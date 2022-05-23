import { MainState } from './main-types';
import { DelegatorState } from './delegator-types';
import { GuardiansState } from './guardians-types';
import { OverviewState } from './overview-types';

export const types = {
    SET_DATA_TO_GLOBAL_REDUCER: 'SET_DATA_TO_GLOBAL_REDUCER',
    SET_CHAIN: 'SET_CHAIN',
    SET_WEB3: 'SET_WEB3',
    SET_LATEST_BLOCK_REF:'SET_LATEST_BLOCK_REF',

    DELEGATOR: {
        SET_DELEGATOR: 'SET_DELEGATOR',
        DELEGATOR_NOT_FOUND: 'DELEGATOR_NOT_FOUND',
        DELEGATOR_LOADING: 'DELEGATOR_LOADING',
        CLEAR_DELEGATOR: 'CLEAR_DELEGATOR',
        SET_DELEGATOR_CHART_DATA: 'SET_DELEGATOR_CHART_DATA',
        RESET_DELEGATOR: 'RESET_DELEGATOR'
    },
    GUARDIAN: {
        SET_GUARDIANS: 'SET_GUARDIANS',
        SET_GUARDIAN: 'SET_GUARDIAN',
        GUARDIAN_NOT_FOUND: 'GUARDIAN_NOT_FOUND',
        GUARDIAN_LOADING: 'GUARDIAN_LOADING',
        SET_GUARDIAN_CHART_DATA: 'SET_GUARDIAN_CHART_DATA',
        RESET_GUARDIAN: 'RESET_GUARDIAN'
    },
    OVERVIEW: {
        SET_OVERVIEW: 'SET_OVERVIEW',
        SET_OVERVIEW_IS_LOADING: 'SET_OVERVIEW_IS_LOADING',
        SET_STAKE_CHART_DATA: 'SET_STAKE_CHART_DATA',
        SET_WEIGHTS_CHART_DATA: 'SET_WEIGHTS_CHART_DATA'
    }
};

export interface AppState {
    main: MainState;
    delegator: DelegatorState;
    guardians: GuardiansState;
    overview: OverviewState;
}
