import { DelegatorInfo } from 'pos-analytics-graph';
import { Dispatch } from 'redux';
import { BlockRef } from 'redux/types/main-types';
import { ChartUnit } from '../../global/enums';
import { ChartData } from '../../global/types';
import { api } from '../../services/api';
import {
    DelegatorHistoryCacheEntry,
    findCoveringDelegatorHistory,
    sliceDelegatorHistory
} from '../../utils/delegator-history-cache';
import { getDelegatorHistoryRange } from '../../utils/delegator-history-range';
import { getDelegatorChartData } from '../../utils/delegators';
import { types } from '../types/types';
import { getAvgBlockTime, getRefBlock } from './utils';

let delegatorRequestSequence = 0;

const nextDelegatorRequestId = (): string => {
    delegatorRequestSequence += 1;
    return `delegator-${delegatorRequestSequence}`;
};

const isActiveDelegatorRequest = (getState: any, requestId: string): boolean =>
    getState().delegator.activeDelegatorRequestId === requestId;

export const findDelegatorAction = (address: string, web3: any, blockRef: BlockRef, currentOnly: boolean = false) => async (
    dispatch: any,
    getState: any
) => {
    const requestId = nextDelegatorRequestId();
    dispatch(resetDelegator(requestId));

    try {
        const delegator = currentOnly
            ? await api.getDelegatorCurrentApi(address, web3, blockRef)
            : await api.getDelegatorApi(address, web3, blockRef);
        if (!isActiveDelegatorRequest(getState, requestId)) return;
        if (!delegator) {
            dispatch(delegatorNotFound(true, requestId));
            return;
        }

        const actions = delegator.actions || [];
        let actionsWithTimes = actions;
        if (actions.length > 0) {
            // get reference block for calculating estimated block time
            const refBlock = await getRefBlock(web3, actions[0].block_number);
            if (!isActiveDelegatorRequest(getState, requestId)) return;
            const avgBlockTime = await getAvgBlockTime(web3, refBlock);
            if (!isActiveDelegatorRequest(getState, requestId)) return;

            actionsWithTimes = actions.map((action: any) => {
                return {
                    ...action,
                    block_time: refBlock.time + Math.round((action.block_number - refBlock.number) * avgBlockTime)
                };
            });
        }
        const delegatorWithActionTimes = {
            ...delegator,
            actions: actionsWithTimes
        };
        dispatch(setDelegator(delegatorWithActionTimes, requestId));
    } catch (_error) {
        if (!isActiveDelegatorRequest(getState, requestId)) return;
        dispatch(delegatorNotFound(true, requestId));
    }
};

let delegatorHistoryRequestSequence = 0;

const nextDelegatorHistoryRequestId = (): string => {
    delegatorHistoryRequestSequence += 1;
    return `delegator-history-${delegatorHistoryRequestSequence}`;
};

const isActiveDelegatorHistoryRequest = (getState: any, requestId: string): boolean =>
    getState().delegator.activeDelegatorHistoryRequestId === requestId;

export const loadDelegatorStakeHistoryAction = (unit: ChartUnit) => async (dispatch: any, getState: any) => {
    const state = getState();
    const current = state.delegator.selectedDelegator as DelegatorInfo | undefined;
    if (!current) return;

    const requestId = nextDelegatorHistoryRequestId();
    const range = getDelegatorHistoryRange(unit, new Date(current.block_time * 1000));
    const chain = String(state.main.chain);
    dispatch({
        type: types.DELEGATOR.DELEGATOR_HISTORY_REQUEST,
        payload: { unit },
        meta: { requestId }
    });

    const covering = findCoveringDelegatorHistory(
        state.delegator.delegatorHistoryCache,
        chain,
        current.address,
        current.block_number,
        range.fromTime,
        range.toTime
    );
    if (covering) {
        const stakeSlices = sliceDelegatorHistory(covering.stakeSlices, range.fromTime, range.toTime);
        const chartData = getDelegatorChartData(unit, { ...current, stake_slices: stakeSlices });
        dispatch({
            type: types.DELEGATOR.DELEGATOR_HISTORY_SUCCESS,
            payload: { stakeSlices, chartData },
            meta: { requestId }
        });
        return;
    }

    const history = await api.getDelegatorStakeHistoryApi(current.address, state.main.web3, range, current);
    if (!isActiveDelegatorHistoryRequest(getState, requestId)) return;
    const latest = getState().delegator.selectedDelegator as DelegatorInfo | undefined;
    if (
        !latest ||
        latest.address.toLowerCase() !== current.address.toLowerCase() ||
        latest.block_number !== current.block_number
    ) {
        return;
    }
    if (!history) {
        dispatch({ type: types.DELEGATOR.DELEGATOR_HISTORY_FAILURE, meta: { requestId } });
        return;
    }

    const cacheEntry: DelegatorHistoryCacheEntry = {
        address: current.address,
        chain,
        currentBlock: current.block_number,
        fromTime: history.from_time,
        toTime: history.to_time,
        stakeSlices: history.stake_slices
    };
    const chartData = getDelegatorChartData(unit, { ...current, stake_slices: history.stake_slices });
    dispatch({
        type: types.DELEGATOR.DELEGATOR_HISTORY_SUCCESS,
        payload: { stakeSlices: history.stake_slices, chartData, cacheEntry },
        meta: { requestId }
    });
};

const setDelegator = (delegator: DelegatorInfo, requestId?: string) => async (dispatch: any) => {
    dispatch({
        type: types.DELEGATOR.SET_DELEGATOR,
        payload: delegator,
        meta: requestId ? { requestId } : undefined
    });
};

export const setDelegatorLoading = (value: boolean, requestId?: string) => async (dispatch: any) => {
    return dispatch({
        type: types.DELEGATOR.DELEGATOR_LOADING,
        payload: value,
        meta: requestId ? { requestId } : undefined
    });
};

export const delegatorNotFound = (value: boolean, requestId?: string) => async (dispatch: any) => {
    return dispatch({
        type: types.DELEGATOR.DELEGATOR_NOT_FOUND,
        payload: value,
        meta: requestId ? { requestId } : undefined
    });
};

export const setDelegatorChartData = (chartData: ChartData | undefined) => async (dispatch: Dispatch<any>) => {
    return dispatch({
        type: types.DELEGATOR.SET_DELEGATOR_CHART_DATA,
        payload: chartData
    });
};

export const resetDelegator = (requestId?: string) => async (dispatch: any) => {
    return dispatch({
        type: types.DELEGATOR.RESET_DELEGATOR,
        meta: requestId ? { requestId } : undefined
    });
};
