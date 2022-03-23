import { CHAINS } from 'types';
import { types } from '../types/types';

export const setChain = (chain: CHAINS) => async (dispatch: any) => {
    dispatch({
        type: types.SET_CHAIN,
        payload: chain
    });
};
