import { findCoveringDelegatorHistory, sliceDelegatorHistory } from './delegator-history-cache';

const slices = [
    { block_number: 30, block_time: 300, stake: 30, cooldown: 0 },
    { block_number: 20, block_time: 200, stake: 20, cooldown: 5 },
    { block_number: 10, block_time: 100, stake: 10, cooldown: 0 }
];

describe('delegator history cache helpers', () => {
    it('reuses only a range from the same chain, address and current snapshot that fully covers the request', () => {
        const entry = {
            address: '0xAbC',
            chain: 'polygon',
            currentBlock: 30,
            fromTime: 100,
            toTime: 300,
            stakeSlices: slices
        };

        expect(findCoveringDelegatorHistory([entry], 'polygon', '0xabc', 30, 150, 300)).toBe(entry);
        expect(findCoveringDelegatorHistory([entry], 'ethereum', '0xabc', 30, 150, 300)).toBeUndefined();
        expect(findCoveringDelegatorHistory([entry], 'polygon', '0xabc', 31, 150, 300)).toBeUndefined();
        expect(findCoveringDelegatorHistory([entry], 'polygon', '0xabc', 30, 50, 300)).toBeUndefined();
    });

    it('creates an exact synthetic boundary and keeps only events inside the narrower range', () => {
        expect(sliceDelegatorHistory(slices, 150, 300)).toEqual([
            { block_number: 30, block_time: 300, stake: 30, cooldown: 0 },
            { block_number: 20, block_time: 200, stake: 20, cooldown: 5 },
            { block_number: 10, block_time: 150, stake: 10, cooldown: 0 }
        ]);
    });

    it('preserves the pre-event anchor and every transition occurring at the exact boundary second', () => {
        const sameSecondSlices = [
            { block_number: 30, block_time: 300, stake: 30, cooldown: 0 },
            { block_number: 21, block_time: 200, stake: 25, cooldown: 0 },
            { block_number: 20, block_time: 200, stake: 20, cooldown: 5 },
            { block_number: 10, block_time: 100, stake: 10, cooldown: 0 }
        ];

        expect(sliceDelegatorHistory(sameSecondSlices, 200, 300)).toEqual([
            { block_number: 30, block_time: 300, stake: 30, cooldown: 0 },
            { block_number: 21, block_time: 200, stake: 25, cooldown: 0 },
            { block_number: 20, block_time: 200, stake: 20, cooldown: 5 },
            { block_number: 10, block_time: 200, stake: 10, cooldown: 0 }
        ]);
    });
});
