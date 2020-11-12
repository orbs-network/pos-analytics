import { Delegator } from '@orbs-network/pos-analytics-lib';
import { Dispatch } from 'redux';
import { ChartData } from '../../global/types';
import { api } from '../../services/api';
import { types } from '../types/types';

export const findDelegatorAction = (address: string) => async (dispatch: any) => {
    dispatch(resetDelegator());
    const delegator = await api.getDelegatorApi(address);
    dispatch(setDelegatorLoading(false));
    if (!delegator) {
        return dispatch(delegatorNotFound(true));
    }
    dispatch(setDelegator(delegator));
};

const setDelegator = (delegator: Delegator) => async (dispatch: any) => {
    dispatch({
        type: types.DELEGATOR.SET_DELEGATOR,
        payload: delegator
    });
};

export const setDelegatorLoading = (value: boolean) => async (dispatch: any) => {
    return dispatch({
        type: types.DELEGATOR.DELEGATOR_LOADING,
        payload: value
    });
};

export const delegatorNotFound = (value: boolean) => async (dispatch: any) => {
    return dispatch({
        type: types.DELEGATOR.DELEGATOR_NOT_FOUND,
        payload: value
    });
};

export const setDelegatorChartData = (chartData: ChartData | undefined) => async (dispatch: Dispatch<any>) => {
    return dispatch({
        type: types.DELEGATOR.SET_DELEGATOR_CHART_DATA,
        payload: chartData
    });
};

export const resetDelegator = () => async (dispatch: any) => {
    return dispatch({
        type: types.DELEGATOR.RESET_DELEGATOR
    });
};
