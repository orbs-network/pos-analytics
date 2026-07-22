/**
 * Copyright 2020 the pos-analytics authors
 * This file is part of the pos-analytics library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import _ from 'lodash';
import BigNumber from "bignumber.js";
import { bigToNumber, optionsStartFromText, parseOptions } from './helpers';
import { addressToTopic, appendItems, ascendingEvents, Contracts, generateTxLink, getBlockEstimatedTime, getLatestPosContract, getQueryDelegationBlock, getQueryPosBlock, getStartOfPosBlock, getWeb3, getWeb3Polygon, readContractEvents, readDelegatorDataFromState, Topics } from "./eth-helpers";
import { DelegatorInfo, DelegatorAction, DelegatorReward, DelegatorStake, DelegatorStakeHistory, DelegatorStakeHistoryCurrent, DelegatorStakeHistoryOptions, DelegatorStakeHistoryRange, PosOptions } from "./model";
import { getDelegatorRewardsStakingInternal, getRewardsClaimActions } from './rewards';
import { getSubgraphHeadBlock, readSubgraphStreamByTime, rowToEvent, specForTopic } from './subgraph-events';

export async function getDelegator(address: string, ethereumEndpoint: string | any, o?: PosOptions | any, refBlock?:{[chainId: number]: {time: number, number: number}}): Promise<DelegatorInfo> {
    const options = parseOptions(o);
    const web3 = _.isString(ethereumEndpoint) ? options.is_polygon ? await getWeb3Polygon(ethereumEndpoint) : await getWeb3(ethereumEndpoint): ethereumEndpoint;
    const actions: DelegatorAction[] = [];
    let stakes: DelegatorStake[] = [];
    let rewards: DelegatorReward[] = [];

    let ethData = await readDelegatorDataFromState(address, web3);
    if (options.read_history) {
        const txs: Promise<any>[] = [
            getStakeActions(address, ethData, web3, options, refBlock).then(res => {
                stakes = res.stakes;
                appendItems(actions, res.stakeActions);
            }),
            getDelegateActions(address, ethData, web3, options, refBlock).then(res => {appendItems(actions, res.delegateActions)}),
        ];
        if(options.read_rewards_disable) {
            txs.push(getRewardsClaimActions(address, ethData, web3, options, false, refBlock).then(res => appendItems(actions, res.claimActions)));
        } else {
            txs.push(getDelegatorRewardsStakingInternal(address, ethData, web3, options, refBlock).then(res =>{
                appendItems(actions, res.claimActions);
                rewards = res.rewards;
            }));
        }
        await Promise.all(txs);
    }

    actions.sort((n1:any, n2:any) => n2.block_number - n1.block_number); // desc unlikely delegator actions in same block

    return {
        address: address.toLowerCase(),
        block_number: ethData.block.number,
        block_time: ethData.block.time,
        read_from_block: optionsStartFromText(options, ethData.block.number),
        total_stake: bigToNumber(ethData.staked),
        cooldown_stake: bigToNumber(ethData.cooldown_stake),
        current_cooldown_time: ethData.current_cooldown_time,
        non_stake: bigToNumber(ethData.non_stake),
        delegated_to: ethData.guardian,
        rewards_balance: bigToNumber(ethData.self_reward_balance),
        rewards_claimed: bigToNumber(ethData.self_reward_claimed),
        total_rewards: bigToNumber(ethData.self_total_rewards),
        stake_slices: stakes,
        actions, 
        reward_slices: rewards
    }
}

const STAKE_TOPICS = [Topics.Staked, Topics.Restaked, Topics.Unstaked, Topics.Withdrew];

const delay = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds));

async function waitForSubgraphSnapshot(chainId: number, blockNumber: number) {
    let indexedBlock = 0;
    for (let attempt = 0; attempt < 6; attempt += 1) {
        indexedBlock = await getSubgraphHeadBlock(chainId);
        if (indexedBlock >= blockNumber) return;
        await delay(250 * (attempt + 1));
    }
    throw new Error(`pos-analytics subgraph is indexed through block ${indexedBlock}, below current snapshot block ${blockNumber}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyStakeEvent(stake: BigNumber, cooldown: BigNumber, event: any, reverse: boolean) {
    const amount = new BigNumber(event.returnValues.amount).dividedBy('1e18');
    const direction = reverse ? -1 : 1;
    switch (event.signature) {
        case Topics.Staked:
            return { stake: stake.plus(amount.multipliedBy(direction)), cooldown };
        case Topics.Restaked:
            return {
                stake: stake.plus(amount.multipliedBy(direction)),
                cooldown: cooldown.minus(amount.multipliedBy(direction))
            };
        case Topics.Unstaked:
            return {
                stake: stake.minus(amount.multipliedBy(direction)),
                cooldown: cooldown.plus(amount.multipliedBy(direction))
            };
        case Topics.Withdrew:
            return { stake, cooldown: cooldown.minus(amount.multipliedBy(direction)) };
        default:
            throw new Error(`unsupported delegator stake event ${event.signature}`);
    }
}

// Kept separate from I/O so range anchoring and tx/log ordering can be tested
// deterministically. Events must be the web3-shaped rows produced by rowToEvent.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function reconstructDelegatorStakeHistory(range: DelegatorStakeHistoryRange, current: DelegatorStakeHistoryCurrent, events: any[], chainId: number): DelegatorStakeHistory {
    const fromTime = Math.floor(range.fromTime);
    const requestedToTime = Math.floor(range.toTime);
    if (!Number.isFinite(fromTime) || !Number.isFinite(requestedToTime)) {
        throw new Error('delegator stake history range must contain finite timestamps');
    }
    if (fromTime > requestedToTime) throw new Error('delegator stake history fromTime must not exceed toTime');

    if (!Number.isFinite(current.block_number) || !Number.isFinite(current.block_time)) {
        throw new Error('delegator stake history current snapshot must contain finite block values');
    }
    const ordered = events.filter(event =>
        Number(event.blockTimestamp) >= fromTime
        && Number(event.blockTimestamp) <= current.block_time
        && Number(event.blockNumber) <= current.block_number
    ).sort(ascendingEvents);
    let stake = new BigNumber(current.total_stake);
    let cooldown = new BigNumber(current.cooldown_stake);

    // Reverse every event from the current snapshot to obtain the exact state
    // immediately before the first event in the requested window.
    for (let index = ordered.length - 1; index >= 0; index -= 1) {
        const previous = applyStakeEvent(stake, cooldown, ordered[index], true);
        stake = previous.stake;
        cooldown = previous.cooldown;
    }

    const firstBlock = ordered.length ? Math.max(0, Number(ordered[0].blockNumber) - 1) : current.block_number;
    const stakeSlices: DelegatorStake[] = [generateStakeAction(firstBlock, fromTime, stake.toNumber(), cooldown.toNumber())];
    const stakeActions: DelegatorAction[] = [];
    let lastRangeBlock = firstBlock;

    for (const event of ordered) {
        const next = applyStakeEvent(stake, cooldown, event, false);
        stake = next.stake;
        cooldown = next.cooldown;
        const blockTime = Number(event.blockTimestamp);
        if (blockTime > requestedToTime) continue;

        lastRangeBlock = Number(event.blockNumber);
        stakeSlices.push(generateStakeAction(lastRangeBlock, blockTime, stake.toNumber(), cooldown.toNumber()));
        stakeActions.push({
            contract: String(event.address).toLowerCase(),
            event: event.event,
            block_number: lastRangeBlock,
            block_time: blockTime,
            tx_hash: event.transactionHash,
            additional_info_link: generateTxLink(event.transactionHash, chainId),
            amount: bigToNumber(new BigNumber(event.returnValues.amount)),
            current_stake: stake.toNumber()
        });
    }

    // Match the legacy history shape by carrying the last state to the right edge.
    // For a range ending at "now", the exact RPC snapshot point is retained.
    const rightTime = Math.min(requestedToTime, current.block_time);
    const rightBlock = rightTime === current.block_time ? current.block_number : lastRangeBlock;
    const rightStake = rightTime === current.block_time ? current.total_stake : stakeSlices[stakeSlices.length - 1].stake;
    const rightCooldown = rightTime === current.block_time ? current.cooldown_stake : stakeSlices[stakeSlices.length - 1].cooldown;
    if (rightTime > fromTime && stakeSlices[stakeSlices.length - 1].block_time < rightTime) {
        stakeSlices.push(generateStakeAction(rightBlock, rightTime, rightStake, rightCooldown));
    }

    stakeSlices.sort((left, right) => right.block_time - left.block_time || right.block_number - left.block_number);
    stakeActions.reverse();
    return {
        from_time: fromTime,
        to_time: requestedToTime,
        stake_slices: stakeSlices,
        actions: stakeActions
    };
}

/**
 * Loads only the stake events needed to reconstruct a Delegator chart window.
 * Passing a current-only DelegatorInfo through options.current avoids another RPC
 * state read; the original getDelegator API and its lifetime behavior are unchanged.
 */
export async function getDelegatorStakeHistory(address: string, ethereumEndpoint: string | any, range: DelegatorStakeHistoryRange, historyOptions: DelegatorStakeHistoryOptions = {}): Promise<DelegatorStakeHistory> {
    const web3 = _.isString(ethereumEndpoint)
        ? historyOptions.is_polygon ? await getWeb3Polygon(ethereumEndpoint) : await getWeb3(ethereumEndpoint)
        : ethereumEndpoint;
    const chainId = await web3.eth.getChainId();
    let current = historyOptions.current;
    if (!current) {
        const state = await readDelegatorDataFromState(address, web3);
        current = {
            block_number: state.block.number,
            block_time: state.block.time,
            total_stake: bigToNumber(state.staked),
            cooldown_stake: bigToNumber(state.cooldown_stake)
        };
    }

    await waitForSubgraphSnapshot(chainId, current.block_number);
    const contractAddress = getLatestPosContract(web3, Contracts.Stake).options.address;
    const queryToTime = Math.max(Math.floor(range.fromTime), current.block_time);
    const reuseFromBlocks = Array.from(new Set([
        getStartOfPosBlock().number,
        getStartOfPosBlock(chainId).number
    ]));

    const eventGroups = await Promise.all(STAKE_TOPICS.map(async topic => {
        const spec = specForTopic(topic);
        const rows = await readSubgraphStreamByTime(chainId, spec, {
            fromTime: range.fromTime,
            toTime: queryToTime,
            toBlock: current!.block_number,
            address,
            reuseFromBlocks
        });
        return rows.map(row => rowToEvent(row, spec, contractAddress));
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const events: any[] = [];
    for (const group of eventGroups) appendItems(events, group);
    return reconstructDelegatorStakeHistory(range, current, events, chainId);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getStakeActions(address:string, ethState:any, web3:any, options: PosOptions, refBlock?:{[chainId: number]: {time: number, number: number}}) {
    let startBlock = getQueryPosBlock(options.read_from_block, ethState.block.number);
    const filter = [undefined /*don't filter event type*/, addressToTopic(address)];
    const events = await readContractEvents(filter, Contracts.Stake, web3, startBlock);
    const chainId = await web3.eth.getChainId();

    let totalStake = new BigNumber(0);
    let coolDownStake = new BigNumber(0);
    const stakeActions: DelegatorAction[] = [];
    const stakes: DelegatorStake[] = [generateStakeAction(ethState.block.number, ethState.block.time, bigToNumber(ethState.staked), bigToNumber(ethState.cooldown_stake))];
    events.sort(ascendingEvents); 
    
    for (let event of events) {
        const amount = new BigNumber(event.returnValues.amount);
        switch (event.signature) { // same as topics[0] same as event type
            case Topics.Staked:
                totalStake = totalStake.plus(amount);
                break;
            case Topics.Restaked:
                totalStake = totalStake.plus(amount)
                coolDownStake = coolDownStake.minus(amount)
                break;
            case Topics.Unstaked:
                totalStake = totalStake.minus(amount)
                coolDownStake = coolDownStake.plus(amount)
                break;
            case Topics.Withdrew:
                coolDownStake = coolDownStake.minus(amount)
                break;
            default:
                continue;
        }
        const blockTime = getBlockEstimatedTime(event.blockNumber, chainId, refBlock)
        stakeActions.push({
            contract: event.address.toLowerCase(),
            event: event.event,
            block_number: event.blockNumber,
            block_time: blockTime,
            tx_hash: event.transactionHash,
            additional_info_link: generateTxLink(event.transactionHash, chainId),
            amount: bigToNumber(amount),
            current_stake: bigToNumber(totalStake),
        });
        stakes.push(generateStakeAction(event.blockNumber, blockTime, bigToNumber(totalStake), bigToNumber(coolDownStake)));
    }

    if (startBlock <= getStartOfPosBlock().number) {
        // fake 'start' of events
        stakes.push(generateStakeAction(getStartOfPosBlock().number, getStartOfPosBlock().time, 0, 0));
    }

    stakes.sort((n1:any, n2:any) => n2.block_number - n1.block_number);  // desc

    return { stakes, stakeActions };
}

function generateStakeAction(block_number: number, block_time: number, stake: number, cooldown: number) : DelegatorStake {
    return { block_number, block_time, stake, cooldown }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getDelegateActions(address:string, ethState:any, web3:any, options: PosOptions, refBlock?:{[chainId: number]: {time: number, number: number}}) {
    let startBlock = getQueryDelegationBlock(options.read_from_block, ethState.block.number);
    const filter = [Topics.Delegated, addressToTopic(address)];
    const events = await readContractEvents(filter, Contracts.Delegate, web3, startBlock);
    const chainId = await web3.eth.getChainId();

    const delegateActions: DelegatorAction[] = [];
    
    for (let event of events) {
        delegateActions.push({
            contract: event.address.toLowerCase(),
            event: event.event,
            block_time: getBlockEstimatedTime(event.blockNumber, chainId, refBlock),
            block_number: event.blockNumber,
            tx_hash: event.transactionHash,
            additional_info_link: generateTxLink(event.transactionHash, chainId),
            to: String(event.returnValues.to).toLowerCase(),
        });
    }

    return { delegateActions };
}
