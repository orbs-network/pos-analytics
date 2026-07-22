import { vi } from 'vitest';
import { configureStreamCache, streamCacheKey, streamCacheSet } from './stream-cache';
import { readSubgraphStreamByTime, specForTopic } from './subgraph-events';
import { Topics } from './eth-helpers';

const row = (id: string, blockTimestamp: number, blockNumber: number) => ({
    id,
    stakeOwner: '0x00000000000000000000000000000000000000ca',
    amount: '1000000000000000000',
    totalStakedAmount: '1000000000000000000',
    blockNumber: String(blockNumber),
    blockTimestamp: String(blockTimestamp),
    transactionHash: `0x${id}`,
    logIndex: '0',
    txIndex: '0'
});

describe('timestamp stream cache', () => {
    it('filters narrower ranges and only extends the missing side of wider ranges', async () => {
        configureStreamCache({ enabled: true });
        const originalFetch = global.fetch;
        const initialRows = [row('a', 100, 10), row('b', 300, 30), row('c', 500, 50)];
        const leftRows = [row('d', 50, 5), row('a', 100, 10)];
        const fetchMock = vi.fn(async (_endpoint: string, init: RequestInit) => {
            const query = JSON.parse(String(init.body)).query as string;
            return {
                ok: true,
                json: async () => ({ data: { stakeds: query.includes('blockTimestamp_gte: 50') ? leftRows : initialRows } })
            } as Response;
        });
        global.fetch = fetchMock as any;

        try {
            const spec = specForTopic(Topics.Staked);
            const base = {
                toTime: 500,
                toBlock: 50,
                address: '0x00000000000000000000000000000000000000ca'
            };
            const weeks = await readSubgraphStreamByTime(1, spec, { ...base, fromTime: 100 });
            const days = await readSubgraphStreamByTime(1, spec, { ...base, fromTime: 300 });
            const months = await readSubgraphStreamByTime(1, spec, { ...base, fromTime: 50 });

            expect(weeks.map(item => item.id)).toEqual(['a', 'b', 'c']);
            expect(days.map(item => item.id)).toEqual(['b', 'c']);
            expect(months.map(item => item.id).sort()).toEqual(['a', 'b', 'c', 'd']);
            expect(fetchMock).toHaveBeenCalledTimes(2);
        } finally {
            global.fetch = originalFetch;
            configureStreamCache({ enabled: false });
        }
    });

    it('reuses a legacy lifetime prefix and fetches only its missing reorg-safe tail', async () => {
        configureStreamCache({ enabled: true, reorgMargin: 1000 });
        const originalFetch = global.fetch;
        const address = '0x00000000000000000000000000000000000000cb';
        const prefix = row('prefix', 100, 2000);
        const overlap = row('overlap', 300, 3000);
        const fresh = row('fresh', 500, 3100);
        prefix.stakeOwner = address;
        overlap.stakeOwner = address;
        fresh.stakeOwner = address;
        const fetchMock = vi.fn(async (_endpoint: string, init: RequestInit) => {
            const query = JSON.parse(String(init.body)).query as string;
            expect(query).toContain('blockNumber_gte: 2001');
            return {
                ok: true,
                json: async () => ({ data: { stakeds: [overlap, fresh] } })
            } as Response;
        });
        global.fetch = fetchMock as any;

        try {
            const spec = specForTopic(Topics.Staked);
            await streamCacheSet(streamCacheKey(1, spec.plural, spec.addressField, address, 1000), {
                syncedToBlock: 3000,
                rows: [prefix, overlap]
            });
            const result = await readSubgraphStreamByTime(1, spec, {
                fromTime: 50,
                toTime: 500,
                toBlock: 3100,
                address,
                reuseFromBlocks: [1000]
            });

            expect(result.map((item) => item.id).sort()).toEqual(['fresh', 'overlap', 'prefix']);
            expect(fetchMock).toHaveBeenCalledTimes(1);
        } finally {
            global.fetch = originalFetch;
            configureStreamCache({ enabled: false, reorgMargin: 1000 });
        }
    });
});
