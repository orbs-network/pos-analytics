import { OverviewState } from '../types/overview-types';
import { types } from '../types/types';

const initialState: OverviewState = {
    overviewData: undefined,
    overviewStakeChartData: undefined,
    overviewWeightsChartData: undefined,
    overviewDataLoding: true
};

export const overviewReducer = (state = initialState, { payload, type }: any): OverviewState => {
    switch (type) {
        case types.OVERVIEW.SET_OVERVIEW:
            return {
                ...state,
                overviewData: payload,
                overviewDataLoding: false
            };
        case types.OVERVIEW.SET_OVERVIEW_IS_LOADING:
            return {
                ...state,
                overviewDataLoding: payload
            };
        case types.OVERVIEW.SET_STAKE_CHART_DATA:
            return {
                ...state,
                overviewStakeChartData: payload
            };
        case types.OVERVIEW.SET_WEIGHTS_CHART_DATA:
            return {
                ...state,
                overviewWeightsChartData: payload
            };

        default:
            return state;
    }
};
