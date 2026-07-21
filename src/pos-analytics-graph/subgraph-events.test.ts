import { afterEach, describe, expect, it, vi } from 'vitest';
import { configurePosAnalyticsSubgraph, readSubgraphStream, specForTopic, specsForContract } from './subgraph-events';
import { configureStreamCache } from './stream-cache';

const TOPIC_STAKED = '0x1449c6dd7851abc30abf37f57715f492010519147cc2652fbc38202c18a6ee90';
const TOPIC_DELEGATE_STAKE_CHANGED = '0x52db726bc1b1643b24886ed6f0194a41de9abac79d1c12108aca494e5b2bda6b';
const TOPIC_ALLOCATED = '0x5830b366dc4564bf14d32116f14c979ac2c150a96b7c6b99bea717e6990d56ba';

describe('event spec table (derived from ABIs)', () => {
    it('maps topics to the subgraph entities and address fields the lib expects', () => {
        const staked = specForTopic(TOPIC_STAKED);
        expect(staked.name).toBe('Staked');
        expect(staked.plural).toBe('stakeds');
        expect(staked.addressField).toBe('stakeOwner');

        const dsc = specForTopic(TOPIC_DELEGATE_STAKE_CHANGED);
        expect(dsc.name).toBe('DelegatedStakeChanged');
        expect(dsc.plural).toBe('delegatedStakeChangeds');
        expect(dsc.addressField).toBe('addr');

        const allocated = specForTopic(TOPIC_ALLOCATED);
        expect(allocated.name).toBe('StakingRewardsAllocated');
        expect(allocated.plural).toBe('stakingRewardsAllocateds');
    });

    it('knows every stream of every contract the lib scans', () => {
        expect(specsForContract('Stake')).toHaveLength(4);
        expect(specsForContract('delegations')).toHaveLength(2);
        expect(specsForContract('stakingRewards')).toHaveLength(4);
        expect(specsForContract('feesAndBootstrapRewards')).toHaveLength(4);
        expect(specsForContract('guardiansRegistration')).toHaveLength(1);
    });
});

// serves canned GraphQL responses and records every query it receives
function mockSubgraph(rowsByPlural: { [plural: string]: any[] }, headBlock: number) {
    const queries: string[] = [];
    vi.stubGlobal('fetch', async (_url: any, init: any) => {
        const { query } = JSON.parse(init.body);
        queries.push(query);
        if (query.includes('_meta')) {
            return { ok: true, json: async () => ({ data: { _meta: { block: { number: headBlock } } } }) };
        }
        const plural = Object.keys(rowsByPlural).find((p) => query.includes(`${p}(`));
        if (!plural) return { ok: true, json: async () => ({ data: {} }) };
        // respect blockNumber bounds like the real subgraph would
        const gte = Number((query.match(/blockNumber_gte: (\d+)/) || [])[1] || 0);
        const lte = Number((query.match(/blockNumber_lte: (\d+)/) || [])[1] || Infinity);
        const rows = rowsByPlural[plural].filter((r) => r.blockNumber >= gte && r.blockNumber <= lte);
        return { ok: true, json: async () => ({ data: { [plural]: rows } }) };
    });
    return queries;
}

const row = (id: number, blockNumber: number) => ({
    id: `0x${String(id).padStart(4, '0')}`,
    stakeOwner: '0xaaa',
    amount: '1',
    totalStakedAmount: '1',
    blockNumber,
    blockTimestamp: blockNumber * 2,
    transactionHash: `0xtx${id}`,
    logIndex: '0',
    txIndex: '0'
});

describe('readSubgraphStream', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        configureStreamCache({ enabled: false });
    });

    it('reads a stream and respects block bounds', async () => {
        configurePosAnalyticsSubgraph({ 901: 'http://mock.test/901' });
        mockSubgraph({ stakeds: [row(1, 100), row(2, 200), row(3, 999999)] }, 50000);
        const spec = specForTopic(TOPIC_STAKED);
        const rows = await readSubgraphStream(901, spec, { fromBlock: 0, toBlock: 300 });
        expect(rows.map((r: any) => r.id)).toEqual(['0x0001', '0x0002']);
    });

    it('serves history from the cache and fetches only the tail on the next read', async () => {
        configurePosAnalyticsSubgraph({ 902: 'http://mock.test/902' });
        const store = new Map<string, any>();
        configureStreamCache({
            enabled: true,
            storage: {
                getItem: async (k) => store.get(k) || null,
                setItem: async (k, v) => {
                    store.set(k, JSON.parse(JSON.stringify(v)));
                }
            },
            reorgMargin: 10
        });
        const queries = mockSubgraph({ stakeds: [row(1, 100), row(2, 200)] }, 1000);
        const spec = specForTopic(TOPIC_STAKED);

        const first = await readSubgraphStream(902, spec, { fromBlock: 0 });
        expect(first).toHaveLength(2);

        const dataQueriesBefore = queries.filter((q) => q.includes('stakeds(')).length;
        const second = await readSubgraphStream(902, spec, { fromBlock: 0 });
        expect(second).toHaveLength(2); // identical result from cache + tail
        const tailQueries = queries.filter((q) => q.includes('stakeds(')).slice(dataQueriesBefore);
        expect(tailQueries).toHaveLength(1);
        // tail re-reads only from syncedToBlock (1000) - reorgMargin (10) + 1
        expect(tailQueries[0]).toContain('blockNumber_gte: 991');
    });
});
