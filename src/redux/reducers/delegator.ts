import { DelegatorState } from '../types/delegator-types';
import { types } from '../types/types';

const initialState: DelegatorState = {
    selectedDelegator: undefined,
    delegatorNotFound: false,
    delegatorIsLoading: true,
    delegatorChartData: undefined,
    delegatorHistoryIsLoading: false,
    delegatorHistoryError: false,
    delegatorHistoryCache: []
};

const isCurrentRequest = (state: DelegatorState, meta?: { requestId?: string }): boolean =>
    !meta || !meta.requestId || meta.requestId === state.activeDelegatorRequestId;

export const delegatorReducer = (state = initialState, { payload, type, meta }: any): DelegatorState => {
    switch (type) {
        case types.DELEGATOR.SET_DELEGATOR:
            if (!isCurrentRequest(state, meta)) return state;
            return {
                ...state,
                selectedDelegator: payload,
                delegatorNotFound: false,
                delegatorIsLoading: false,
                activeDelegatorRequestId: undefined
            };
        case types.DELEGATOR.DELEGATOR_LOADING:
            if (!isCurrentRequest(state, meta)) return state;
            return {
                ...state,
                delegatorIsLoading: payload,
                activeDelegatorRequestId: payload ? state.activeDelegatorRequestId : undefined
            };
        case types.DELEGATOR.CLEAR_DELEGATOR:
            return {
                ...state,
                selectedDelegator: undefined
            };
        case types.DELEGATOR.DELEGATOR_NOT_FOUND:
            if (!isCurrentRequest(state, meta)) return state;
            return {
                ...state,
                delegatorNotFound: payload,
                selectedDelegator: payload ? undefined : state.selectedDelegator,
                delegatorIsLoading: false,
                activeDelegatorRequestId: undefined
            };
        case types.DELEGATOR.SET_DELEGATOR_CHART_DATA:
            return {
                ...state,
                delegatorChartData: payload
            };
        case types.DELEGATOR.DELEGATOR_HISTORY_REQUEST:
            return {
                ...state,
                delegatorHistoryIsLoading: true,
                delegatorHistoryError: false,
                activeDelegatorHistoryRequestId: meta && meta.requestId
            };
        case types.DELEGATOR.DELEGATOR_HISTORY_SUCCESS:
            if (!meta || meta.requestId !== state.activeDelegatorHistoryRequestId) return state;
            const nextCache = payload.cacheEntry
                ? [
                      payload.cacheEntry,
                      ...state.delegatorHistoryCache.filter(
                          entry =>
                              !(
                                  entry.chain === payload.cacheEntry.chain &&
                                  entry.address.toLowerCase() === payload.cacheEntry.address.toLowerCase() &&
                                  entry.currentBlock === payload.cacheEntry.currentBlock &&
                                  entry.fromTime === payload.cacheEntry.fromTime &&
                                  entry.toTime === payload.cacheEntry.toTime
                              )
                      )
                  ].slice(0, 30)
                : state.delegatorHistoryCache;
            return {
                ...state,
                selectedDelegator: state.selectedDelegator
                    ? { ...state.selectedDelegator, stake_slices: payload.stakeSlices }
                    : state.selectedDelegator,
                delegatorChartData: payload.chartData,
                delegatorHistoryIsLoading: false,
                delegatorHistoryError: false,
                activeDelegatorHistoryRequestId: undefined,
                delegatorHistoryCache: nextCache
            };
        case types.DELEGATOR.DELEGATOR_HISTORY_FAILURE:
            if (!meta || meta.requestId !== state.activeDelegatorHistoryRequestId) return state;
            return {
                ...state,
                delegatorHistoryIsLoading: false,
                delegatorHistoryError: true,
                activeDelegatorHistoryRequestId: undefined
            };
        case types.DELEGATOR.RESET_DELEGATOR:
            return {
                ...state,
                delegatorChartData: undefined,
                selectedDelegator: undefined,
                delegatorNotFound: false,
                delegatorIsLoading: true,
                activeDelegatorRequestId: meta && meta.requestId,
                delegatorHistoryIsLoading: false,
                delegatorHistoryError: false,
                activeDelegatorHistoryRequestId: undefined
            };
        default:
            return state;
    }
};
