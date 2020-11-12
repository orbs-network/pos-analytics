import { Dispatch } from 'redux';
import { api } from '../../services/api';
import { types } from '../types/types';

export const getOverviewAction = () => async (dispatch: any) => {
    const overview = await api.getOverviewApi();
    if (!overview) {
        return dispatch(setOverviewIsLoading(false));
    }

    return dispatch({
        type: types.OVERVIEW.SET_OVERVIEW,
        payload: overview
    });
};

export const setOverviewStakeChartData = (data: any) => async (dispatch: Dispatch) => {
    return dispatch({
        type: types.OVERVIEW.SET_STAKE_CHART_DATA,
        payload: data
    });
};

export const setOverviewWeightsChartData = (data: any) => async (dispatch: Dispatch) => {
    return dispatch({
        type: types.OVERVIEW.SET_WEIGHTS_CHART_DATA,
        payload: data
    });
};

export const setOverviewIsLoading = (value: boolean) => async (dispatch: Dispatch) => {
    return dispatch({
        type: types.OVERVIEW.SET_OVERVIEW_IS_LOADING,
        payload: value
    });
};
