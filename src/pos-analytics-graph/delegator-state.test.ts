import BigNumber from 'bignumber.js';
// @ts-ignore legacy package has no TypeScript declarations
import { aggregate } from '@makerdao/multicall';
import { Contracts, readDelegatorDataFromState } from './eth-helpers';

vi.mock('@makerdao/multicall', () => ({ aggregate: vi.fn() }));

const mockedAggregate = vi.mocked(aggregate);
const address = '0xd94f00aa2904b3e2b84ef4e665e2b3e80e1a450f';
const guardian = '0xd94f00aa2904b3e2b84ef4e665e2b3e80e1a450f';

const stateResult = (includeRewards = false) => {
    const transformed: Record<string, any> = {
        b: new BigNumber(7),
        s: new BigNumber(5),
        cooldownStake: new BigNumber(3),
        cooldownTime: new BigNumber(2),
        dGuardian: guardian,
        CURRENT_BLOCK_TIMESTAMP: new BigNumber(1000)
    };
    if (includeRewards) {
        Object.assign(transformed, {
            dRewardBalance: new BigNumber(11),
            dRewardClaim: new BigNumber(13),
            dRPT: new BigNumber(17),
            dDeltaRPT: new BigNumber(19)
        });
    }
    return {
        results: {
            blockNumber: new BigNumber(100),
            original: {},
            transformed
        },
        keyToArgMap: {}
    };
};

const guardianRewardsCall = vi.fn().mockResolvedValue({
    stakingRewardsPerWeightDelta: '0',
    lastStakingRewardsPerWeight: '0',
    delegatorRewardsPerTokenDelta: '0',
    delegatorRewardsPerToken: '0'
});

const web3 = {
    multicallContractAddress: '0x0000000000000000000000000000000000000001',
    contractsData: {
        [Contracts.Erc20]: [{ address: '0x0000000000000000000000000000000000000002' }],
        [Contracts.Stake]: [{ address: '0x0000000000000000000000000000000000000003' }],
        [Contracts.Reward]: [{
            address: '0x0000000000000000000000000000000000000004',
            abi: []
        }],
        [Contracts.Delegate]: [{ address: '0x0000000000000000000000000000000000000005' }]
    },
    eth: {
        Contract: vi.fn(function ContractMock(this: any) {
            this.methods = {
                getGuardianStakingRewardsData: () => ({ call: guardianRewardsCall })
            };
        })
    }
};

describe('Delegator current-state reads', () => {
    beforeEach(() => {
        mockedAggregate.mockReset();
        guardianRewardsCall.mockClear();
    });

    it('keeps stake data and recovers delegation when only the rewards read reverts', async () => {
        mockedAggregate
            .mockRejectedValueOnce(new Error('Returned error: execution reverted'))
            .mockRejectedValueOnce(new Error('Returned error: execution reverted'))
            .mockResolvedValueOnce(stateResult() as any);

        const result = await readDelegatorDataFromState(address, web3 as any);

        expect(result.non_stake.toNumber()).toBe(7);
        expect(result.staked.toNumber()).toBe(5);
        expect(result.cooldown_stake.toNumber()).toBe(3);
        expect(result.guardian).toBe(guardian);
        expect(result.self_reward_balance.toNumber()).toBe(0);
        expect(result.self_reward_claimed.toNumber()).toBe(0);
        expect(mockedAggregate).toHaveBeenCalledTimes(3);
        expect(mockedAggregate.mock.calls[1][0]).toHaveLength(1);
        expect(mockedAggregate.mock.calls[2][0]).toEqual(expect.arrayContaining([
            expect.objectContaining({ call: ['getDelegation(address)(address)', address] })
        ]));
    });

    it('keeps the existing single-multicall path when every read succeeds', async () => {
        mockedAggregate.mockResolvedValueOnce(stateResult(true) as any);

        const result = await readDelegatorDataFromState(address, web3 as any);

        expect(result.self_total_rewards.toNumber()).toBe(24);
        expect(mockedAggregate).toHaveBeenCalledTimes(1);
        expect(mockedAggregate.mock.calls[0][0]).not.toEqual(expect.arrayContaining([
            expect.objectContaining({ call: ['getDelegation(address)(address)', address] })
        ]));
    });
});
