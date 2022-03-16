import { Dispatch } from 'redux';
import { CHAINS } from 'types';
import { getChainConfig } from 'utils/chain';
import { api } from '../../services/api';
import { types } from '../types/types';

export const getOverviewAction = (chain: CHAINS) => async (dispatch: any) => {
    const { node, rpc } = getChainConfig(chain);

    try {
        const overview = await api.getOverviewApi(node, rpc);
        console.log({ overview });

        dispatch({
            type: types.OVERVIEW.SET_OVERVIEW,
            payload: overview
        });
    } catch (error) {
        console.log(error);
        
    } finally {
        dispatch(setOverviewIsLoading(false));
    }
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
