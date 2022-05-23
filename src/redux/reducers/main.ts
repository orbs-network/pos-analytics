import { CHAINS } from 'types';
import { MainState } from '../types/main-types';
import { types } from '../types/types';

const initialState: MainState = {
    chain: CHAINS.ETHEREUM,
    web3: undefined,
    blockRef: undefined

};

export const mainReducer = (state = initialState, { payload, type }: any): MainState => {
    switch (type) {
       
            case types.SET_WEB3:
                return {
                    ...state,
                    web3: payload.web3,
                    chain: payload.chain
                };
                case types.SET_LATEST_BLOCK_REF:
                    return {
                        ...state,
                        blockRef: payload,
                    };
        default:
            return state;
    }
};
