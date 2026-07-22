import { GuardiansState } from '../types/guardians-types';
import { types } from '../types/types';

const initialState: GuardiansState = {
    selectedGuardian: undefined,
    guardians: undefined,
    guardianNotFound: false,
    guardianIsLoading: true,
    guardianChartData: undefined,
    guardiansColors: undefined
};

const isCurrentRequest = (state: GuardiansState, meta?: { requestId?: string }): boolean =>
    !meta || !meta.requestId || meta.requestId === state.activeGuardianRequestId;

export const guardiansReducer = (state = initialState, { payload, type, meta }: any): GuardiansState => {
    switch (type) {
        case types.GUARDIAN.SET_GUARDIAN:
            if (!isCurrentRequest(state, meta)) return state;
            return {
                ...state,
                selectedGuardian: payload,
                guardianNotFound: false,
                guardianIsLoading: false,
                activeGuardianRequestId: undefined
            };
        case types.GUARDIAN.SET_GUARDIANS: {
            const { guardiansColors, guardians } = payload;
            return {
                ...state,
                guardians,
                guardiansColors
            };
        }
        case types.GUARDIAN.GUARDIAN_NOT_FOUND:
            if (!isCurrentRequest(state, meta)) return state;
            return {
                ...state,
                guardianNotFound: payload,
                selectedGuardian: payload ? undefined : state.selectedGuardian,
                guardianIsLoading: false,
                activeGuardianRequestId: undefined
            };
        case types.GUARDIAN.GUARDIAN_LOADING:
            if (!isCurrentRequest(state, meta)) return state;
            return {
                ...state,
                guardianIsLoading: payload,
                activeGuardianRequestId: payload ? state.activeGuardianRequestId : undefined
            };
        case types.GUARDIAN.SET_GUARDIAN_CHART_DATA:
            return {
                ...state,
                guardianChartData: payload
            };
        case types.GUARDIAN.RESET_GUARDIAN:
            return {
                ...state,
                guardianChartData: undefined,
                selectedGuardian: undefined,
                guardianNotFound: false,
                guardianIsLoading: true,
                activeGuardianRequestId: meta && meta.requestId
            };
        default:
            return state;
    }
};
