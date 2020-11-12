import { AuthState } from '../types/auth-types';
import { DelegatorState } from '../types/delegator-types';
import { types } from '../types/types';

const initialState: DelegatorState = {
    selectedDelegator: undefined,
    delegatorNotFound: false,
    delegatorIsLoading: true,
    delegatorChartData: undefined
};

export const delegatorReducer = (state = initialState, { payload, type }: any): DelegatorState => {
    switch (type) {
        case types.DELEGATOR.SET_DELEGATOR:
            return {
                ...state,
                selectedDelegator: payload
            };
        case types.DELEGATOR.DELEGATOR_LOADING:
            return {
                ...state,
                delegatorIsLoading: payload
            };
        case types.DELEGATOR.CLEAR_DELEGATOR:
            return {
                ...state,
                selectedDelegator: undefined
            };
        case types.DELEGATOR.DELEGATOR_NOT_FOUND:
            return {
                ...state,
                delegatorNotFound: payload,
                selectedDelegator: payload ? undefined : state.selectedDelegator
            };
        case types.DELEGATOR.SET_DELEGATOR_CHART_DATA:
            return {
                ...state,
                delegatorChartData: payload
            };
        case types.DELEGATOR.RESET_DELEGATOR:
            return {
                ...state,
                delegatorChartData: undefined,
                selectedDelegator: undefined,
                delegatorNotFound: false,
                delegatorIsLoading: true
            };
        default:
            return state;
    }
};
