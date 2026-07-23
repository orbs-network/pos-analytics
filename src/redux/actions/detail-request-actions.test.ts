import { Mock, vi } from 'vitest';
import { api } from '../../services/api';
import { delegatorReducer } from '../reducers/delegator';
import { guardiansReducer } from '../reducers/guardians';
import { findDelegatorAction, loadDelegatorStakeHistoryAction } from './delegator-actions';
import { getGuardianAction } from './guardians-actions';
import { getAvgBlockTime, getRefBlock } from './utils';
import { ChartUnit } from '../../global/enums';

vi.mock('../../services/api', () => ({
    api: {
        getDelegatorApi: vi.fn(),
        getDelegatorCurrentApi: vi.fn(),
        getDelegatorStakeHistoryApi: vi.fn(),
        getGuardianApi: vi.fn()
    }
}));

vi.mock('./utils', () => ({
    getRefBlock: vi.fn(),
    getAvgBlockTime: vi.fn()
}));

const mockedGetDelegator = api.getDelegatorApi as Mock;
const mockedGetDelegatorCurrent = api.getDelegatorCurrentApi as Mock;
const mockedGetDelegatorHistory = api.getDelegatorStakeHistoryApi as Mock;
const mockedGetGuardian = api.getGuardianApi as Mock;
const mockedGetRefBlock = getRefBlock as Mock;
const mockedGetAvgBlockTime = getAvgBlockTime as Mock;

const deferred = <T>() => {
    let resolve!: (value: T) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return { promise, resolve, reject };
};

const detail = (address: string, withActions: boolean = false) => ({
    address,
    actions: withActions ? [{ block_number: 100, event: 'Staked' }] : [],
    stake_slices: []
});

const createHarness = () => {
    let state: any = {
        main: { chain: 'ethereum', web3: { id: 'history-web3' } },
        guardians: guardiansReducer(undefined, { type: '@@init' }),
        delegator: delegatorReducer(undefined, { type: '@@init' })
    };
    const getState = () => state;
    const dispatch: any = (action: any): any => {
        if (typeof action === 'function') return action(dispatch, getState);
        state = {
            ...state,
            guardians: guardiansReducer(state.guardians, action),
            delegator: delegatorReducer(state.delegator, action)
        };
        return action;
    };
    return { dispatch, getState };
};

describe('detail request actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedGetRefBlock.mockResolvedValue({ number: 90, time: 900 });
        mockedGetAvgBlockTime.mockResolvedValue(10);
    });

    it('keeps the newer Guardian when an older request resolves last', async () => {
        const oldRequest = deferred<any>();
        const newRequest = deferred<any>();
        mockedGetGuardian.mockReturnValueOnce(oldRequest.promise).mockReturnValueOnce(newRequest.promise);
        const harness = createHarness();
        const web3 = { id: 'web3' };
        const blockRef = { 1: { number: 1, time: 1 } };

        const oldLoad = harness.dispatch(getGuardianAction('0xold', web3, blockRef));
        const newLoad = harness.dispatch(getGuardianAction('0xnew', web3, blockRef));
        newRequest.resolve(detail('0xnew'));
        await newLoad;
        oldRequest.resolve(detail('0xold'));
        await oldLoad;

        expect(harness.getState().guardians).toMatchObject({
            selectedGuardian: { address: '0xnew' },
            guardianIsLoading: false,
            guardianNotFound: false
        });
        expect(mockedGetGuardian).toHaveBeenCalledTimes(2);
        expect(mockedGetGuardian).toHaveBeenNthCalledWith(1, '0xold', web3, blockRef);
        expect(mockedGetGuardian).toHaveBeenNthCalledWith(2, '0xnew', web3, blockRef);
    });

    it('keeps the newer Delegator when an older request resolves last', async () => {
        const oldRequest = deferred<any>();
        const newRequest = deferred<any>();
        mockedGetDelegator.mockReturnValueOnce(oldRequest.promise).mockReturnValueOnce(newRequest.promise);
        const harness = createHarness();
        const web3 = { id: 'web3' };
        const blockRef = { 1: { number: 1, time: 1 } };

        const oldLoad = harness.dispatch(findDelegatorAction('0xold', web3, blockRef));
        const newLoad = harness.dispatch(findDelegatorAction('0xnew', web3, blockRef));
        newRequest.resolve(detail('0xnew'));
        await newLoad;
        oldRequest.resolve(detail('0xold'));
        await oldLoad;

        expect(harness.getState().delegator).toMatchObject({
            selectedDelegator: { address: '0xnew' },
            delegatorIsLoading: false,
            delegatorNotFound: false
        });
        expect(mockedGetDelegator).toHaveBeenCalledTimes(2);
        expect(mockedGetDelegator).toHaveBeenNthCalledWith(1, '0xold', web3, blockRef);
        expect(mockedGetDelegator).toHaveBeenNthCalledWith(2, '0xnew', web3, blockRef);
    });

    it('settles loading after Guardian and Delegator failures', async () => {
        mockedGetGuardian.mockResolvedValueOnce(undefined);
        mockedGetDelegator.mockRejectedValueOnce(new Error('request failed'));
        const harness = createHarness();

        await harness.dispatch(getGuardianAction('0xguardian', {}, {}));
        await harness.dispatch(findDelegatorAction('0xdelegator', {}, {}));

        expect(harness.getState().guardians).toMatchObject({
            selectedGuardian: undefined,
            guardianNotFound: true,
            guardianIsLoading: false
        });
        expect(harness.getState().delegator).toMatchObject({
            selectedDelegator: undefined,
            delegatorNotFound: true,
            delegatorIsLoading: false
        });
    });

    it('does not request block timing when a current-only response has no actions', async () => {
        mockedGetGuardian.mockResolvedValueOnce(detail('0xguardian'));
        mockedGetDelegator.mockResolvedValueOnce(detail('0xdelegator'));
        const harness = createHarness();

        await harness.dispatch(getGuardianAction('0xguardian', {}, {}));
        await harness.dispatch(findDelegatorAction('0xdelegator', {}, {}));

        expect(mockedGetRefBlock).not.toHaveBeenCalled();
        expect(mockedGetAvgBlockTime).not.toHaveBeenCalled();
    });

    it('uses the current-only API for the Stake route without changing the legacy default contract', async () => {
        mockedGetDelegatorCurrent.mockResolvedValueOnce(detail('0xcurrent'));
        const harness = createHarness();
        const web3 = { id: 'web3' };
        const blockRef = { 1: { number: 1, time: 1 } };

        await harness.dispatch(findDelegatorAction('0xcurrent', web3, blockRef, true));

        expect(mockedGetDelegatorCurrent).toHaveBeenCalledTimes(1);
        expect(mockedGetDelegatorCurrent).toHaveBeenCalledWith('0xcurrent', web3, blockRef);
        expect(mockedGetDelegator).not.toHaveBeenCalled();
    });

    it('reuses a wider in-memory range for a narrower selection', async () => {
        const now = Math.floor(Date.now() / 1000);
        const current = {
            ...detail('0xcache'),
            block_number: 500,
            block_time: now,
            total_stake: 10,
            cooldown_stake: 0
        };
        mockedGetDelegatorHistory.mockImplementation(
            (_address: string, _web3: any, range: any) =>
                Promise.resolve({
                    from_time: range.fromTime,
                    to_time: range.toTime,
                    stake_slices: [
                        { block_number: 500, block_time: range.toTime, stake: 10, cooldown: 0 },
                        { block_number: 100, block_time: range.fromTime, stake: 5, cooldown: 0 }
                    ],
                    actions: []
                })
        );
        const harness = createHarness();
        harness.dispatch({ type: 'RESET_DELEGATOR', meta: { requestId: 'seed' } });
        harness.dispatch({ type: 'SET_DELEGATOR', payload: current, meta: { requestId: 'seed' } });

        await harness.dispatch(loadDelegatorStakeHistoryAction(ChartUnit.WEEK));
        await harness.dispatch(loadDelegatorStakeHistoryAction(ChartUnit.DAY));

        expect(mockedGetDelegatorHistory).toHaveBeenCalledTimes(1);
        expect(harness.getState().delegator.delegatorChartData.unit).toBe(ChartUnit.DAY);
        expect(harness.getState().delegator.delegatorHistoryIsLoading).toBe(false);
    });

    it('keeps the latest period when an older history request resolves last', async () => {
        const monthRequest = deferred<any>();
        const dayRequest = deferred<any>();
        mockedGetDelegatorHistory.mockReturnValueOnce(monthRequest.promise).mockReturnValueOnce(dayRequest.promise);
        const now = Math.floor(Date.now() / 1000);
        const current = {
            ...detail('0xperiod'),
            block_number: 600,
            block_time: now,
            total_stake: 20,
            cooldown_stake: 0
        };
        const harness = createHarness();
        harness.dispatch({ type: 'RESET_DELEGATOR', meta: { requestId: 'seed' } });
        harness.dispatch({ type: 'SET_DELEGATOR', payload: current, meta: { requestId: 'seed' } });

        const monthLoad = harness.dispatch(loadDelegatorStakeHistoryAction(ChartUnit.MONTH));
        const dayLoad = harness.dispatch(loadDelegatorStakeHistoryAction(ChartUnit.DAY));
        const dayRange = mockedGetDelegatorHistory.mock.calls[1][2];
        dayRequest.resolve({
            from_time: dayRange.fromTime,
            to_time: dayRange.toTime,
            stake_slices: [{ block_number: 600, block_time: now, stake: 20, cooldown: 0 }],
            actions: []
        });
        await dayLoad;
        const monthRange = mockedGetDelegatorHistory.mock.calls[0][2];
        monthRequest.resolve({
            from_time: monthRange.fromTime,
            to_time: monthRange.toTime,
            stake_slices: [{ block_number: 600, block_time: now, stake: 20, cooldown: 0 }],
            actions: []
        });
        await monthLoad;

        expect(harness.getState().delegator.delegatorChartData.unit).toBe(ChartUnit.DAY);
    });
});
