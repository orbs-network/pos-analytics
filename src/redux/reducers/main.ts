import { CHAINS } from 'types';
import { MainState } from '../types/main-types';
import { types } from '../types/types';

const initialState: MainState = {
    chain: CHAINS.ETHEREUM
};

export const mainReducer = (state = initialState, { payload, type }: any): MainState => {
    switch (type) {
        case types.SET_CHAIN:
            return {
                ...state,
                chain: payload
            };
        default:
            return state;
    }
};
