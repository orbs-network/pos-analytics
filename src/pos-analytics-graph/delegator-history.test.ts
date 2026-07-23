import { getDelegator, reconstructDelegatorStakeHistory } from './delegator';
import { Topics } from './eth-helpers';

const tokenAmount = (amount: number): string => `${amount}000000000000000000`;

const event = (signature: Topics, name: string, amount: number, blockNumber: number, blockTimestamp: number, transactionIndex: number, logIndex: number) => ({
    address: '0x0000000000000000000000000000000000000001',
    event: name,
    signature,
    blockNumber,
    blockTimestamp,
    transactionIndex,
    logIndex,
    transactionHash: `0x${blockNumber}${transactionIndex}${logIndex}`,
    returnValues: { amount: tokenAmount(amount) }
});

describe('bounded Delegator stake history', () => {
    const current = {
        block_number: 50,
        block_time: 500,
        total_stake: 100,
        cooldown_stake: 10
    };
    const events = [
        // Deliberately scrambled: reconstruction must use block/tx/log order.
        event(Topics.Restaked, 'Restaked', 3, 30, 300, 1, 2),
        event(Topics.Staked, 'Staked', 20, 20, 200, 0, 4),
        event(Topics.Unstaked, 'Unstaked', 5, 30, 300, 0, 8)
    ];

    it('derives an exact left anchor by reversing from the current snapshot', () => {
        const result = reconstructDelegatorStakeHistory(
            { fromTime: 200, toTime: 500 },
            current,
            events,
            1
        );
        const chronological = result.stake_slices.slice().sort((left, right) =>
            left.block_number - right.block_number || left.block_time - right.block_time
        );

        expect(chronological[0]).toMatchObject({ block_time: 200, stake: 82, cooldown: 8 });
        expect(chronological[1]).toMatchObject({ block_time: 200, stake: 102, cooldown: 8 });
        expect(chronological[2]).toMatchObject({ block_time: 300, stake: 97, cooldown: 13 });
        expect(chronological[3]).toMatchObject({ block_time: 300, stake: 100, cooldown: 10 });
        expect(chronological[4]).toMatchObject({ block_time: 500, stake: 100, cooldown: 10 });
    });

    it('returns only in-range points while still using later events for the anchor', () => {
        const result = reconstructDelegatorStakeHistory(
            { fromTime: 200, toTime: 250 },
            current,
            events,
            137
        );
        const chronological = result.stake_slices.slice().sort((left, right) =>
            left.block_number - right.block_number || left.block_time - right.block_time
        );

        expect(chronological).toHaveLength(3);
        expect(chronological[0]).toMatchObject({ block_time: 200, stake: 82, cooldown: 8 });
        expect(chronological[1]).toMatchObject({ block_time: 200, stake: 102, cooldown: 8 });
        expect(chronological[2]).toMatchObject({ block_time: 250, stake: 102, cooldown: 8 });
        expect(result.actions).toHaveLength(1);
        expect(result.actions[0].additional_info_link).toContain('polygonscan.com');
    });

    it('includes an event from the exact block and timestamp of the multicall snapshot', () => {
        const snapshotEvent = event(Topics.Staked, 'Staked', 5, 50, 500, 0, 1);
        const result = reconstructDelegatorStakeHistory(
            { fromTime: 400, toTime: 500 },
            { ...current, total_stake: 105 },
            [snapshotEvent],
            1
        );
        const chronological = result.stake_slices.slice().sort((left, right) =>
            left.block_time - right.block_time || left.block_number - right.block_number
        );

        expect(chronological).toHaveLength(2);
        expect(chronological[0]).toMatchObject({ block_time: 400, stake: 100, cooldown: 10 });
        expect(chronological[1]).toMatchObject({ block_number: 50, block_time: 500, stake: 105, cooldown: 10 });
    });

    it('keeps the legacy API separate and unchanged', () => {
        expect(typeof getDelegator).toBe('function');
        expect(getDelegator.length).toBe(4);
    });
});
