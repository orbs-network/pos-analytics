import { Mock, MockInstance, vi } from 'vitest';
import { getDelegator, getDelegatorStakeHistory, getGuardian, getGuardians, getOverview } from 'pos-analytics-graph';
import { api } from './api';

vi.mock('pos-analytics-graph', () => ({
    getDelegator: vi.fn(),
    getDelegatorStakeHistory: vi.fn(),
    getGuardian: vi.fn(),
    getGuardians: vi.fn(),
    getOverview: vi.fn(),
    getWeb3: vi.fn(),
    getWeb3Polygon: vi.fn()
}));

const mockedGetDelegator = getDelegator as Mock;
const mockedGetDelegatorStakeHistory = getDelegatorStakeHistory as Mock;
const mockedGetGuardian = getGuardian as Mock;
const mockedGetGuardians = getGuardians as Mock;
const mockedGetOverview = getOverview as Mock;

describe('page API contracts and observations', () => {
    let infoSpy: MockInstance;

    beforeEach(() => {
        vi.clearAllMocks();
        infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    });

    afterEach(() => {
        infoSpy.mockRestore();
    });

    it('calls every legacy data function exactly once with unchanged arguments', async () => {
        const address = '0xguardian-or-delegator';
        const web3 = { currentProvider: 'provider' };
        const blockRef = { blockNumber: 100, timestamp: 200 } as any;
        const nodeEndpoints = ['https://node.example'];
        const delegatorResult = { type: 'delegator' };
        const guardianResult = { type: 'guardian' };
        const guardiansResult = [{ type: 'guardian-list' }];
        const overviewResult = { type: 'overview' };

        mockedGetDelegator.mockResolvedValue(delegatorResult);
        mockedGetGuardian.mockResolvedValue(guardianResult);
        mockedGetGuardians.mockResolvedValue(guardiansResult);
        mockedGetOverview.mockResolvedValue(overviewResult);

        await expect(api.getDelegatorApi(address, web3, blockRef)).resolves.toBe(delegatorResult);
        await expect(api.getGuardianApi(address, web3, blockRef)).resolves.toBe(guardianResult);
        await expect(api.getGuardiansApi(nodeEndpoints)).resolves.toBe(guardiansResult);
        await expect(api.getOverviewApi(nodeEndpoints, web3)).resolves.toBe(overviewResult);

        expect(mockedGetDelegator).toHaveBeenCalledTimes(1);
        expect(mockedGetDelegator).toHaveBeenCalledWith(address, web3, undefined, blockRef);
        expect(mockedGetGuardian).toHaveBeenCalledTimes(1);
        expect(mockedGetGuardian).toHaveBeenCalledWith(address, web3, undefined, blockRef);
        expect(mockedGetGuardians).toHaveBeenCalledTimes(1);
        expect(mockedGetGuardians).toHaveBeenCalledWith(nodeEndpoints);
        expect(mockedGetOverview).toHaveBeenCalledTimes(1);
        expect(mockedGetOverview).toHaveBeenCalledWith(nodeEndpoints, web3);

        expect(infoSpy).toHaveBeenCalledTimes(4);
        expect(infoSpy.mock.calls.map(([, observation]) => observation)).toEqual([
            expect.objectContaining({ name: 'delegator', durationMs: expect.any(Number), status: 'success' }),
            expect.objectContaining({ name: 'guardian', durationMs: expect.any(Number), status: 'success' }),
            expect.objectContaining({ name: 'guardians', durationMs: expect.any(Number), status: 'success' }),
            expect.objectContaining({ name: 'overview', durationMs: expect.any(Number), status: 'success' })
        ]);
    });

    it('records one sanitized failure and preserves each fallback result', async () => {
        const rawError = new Error('sensitive endpoint and request details');
        mockedGetDelegator.mockRejectedValue(rawError);
        mockedGetGuardian.mockRejectedValue(rawError);
        mockedGetGuardians.mockRejectedValue(rawError);
        mockedGetOverview.mockRejectedValue(rawError);

        await expect(api.getDelegatorApi('0xprivate', {}, {} as any)).resolves.toBeUndefined();
        await expect(api.getGuardianApi('0xprivate', {}, {} as any)).resolves.toBeUndefined();
        await expect(api.getGuardiansApi(['https://private-endpoint'])).resolves.toBeNull();
        await expect(api.getOverviewApi(['https://private-endpoint'], {})).resolves.toBeNull();

        expect(infoSpy).toHaveBeenCalledTimes(4);
        infoSpy.mock.calls.forEach(call => {
            expect(call).toHaveLength(2);
            const [label, observation] = call;
            expect(label).toBe('[page-api]');
            expect(Object.keys(observation).sort()).toEqual(['durationMs', 'name', 'status']);
            expect(observation.durationMs).toEqual(expect.any(Number));
            expect(observation.status).toBe('failure');
        });
    });

    it('keeps the legacy Delegator contract while exposing separate current and bounded-history calls', async () => {
        const address = '0xdelegator';
        const web3 = { currentProvider: 'provider' };
        const blockRef = { 1: { number: 100, time: 200 } } as any;
        const current = {
            address,
            block_number: 100,
            block_time: 200,
            total_stake: 10,
            cooldown_stake: 0
        } as any;
        const range = { fromTime: 10, toTime: 200 };
        const history = { from_time: 10, to_time: 200, stake_slices: [], actions: [] };
        mockedGetDelegator.mockResolvedValue(current);
        mockedGetDelegatorStakeHistory.mockResolvedValue(history);

        await expect(api.getDelegatorCurrentApi(address, web3, blockRef)).resolves.toBe(current);
        await expect(api.getDelegatorStakeHistoryApi(address, web3, range, current)).resolves.toBe(history);

        expect(mockedGetDelegator).toHaveBeenCalledTimes(1);
        expect(mockedGetDelegator).toHaveBeenCalledWith(address, web3, { read_history: false }, blockRef);
        expect(mockedGetDelegatorStakeHistory).toHaveBeenCalledTimes(1);
        expect(mockedGetDelegatorStakeHistory).toHaveBeenCalledWith(address, web3, range, { current });
        expect(infoSpy.mock.calls.map(([, observation]) => observation.name)).toEqual([
            'delegator-current',
            'delegator-stake-history'
        ]);
    });
});
