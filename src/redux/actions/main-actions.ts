import { BlockRef } from 'redux/types/main-types';
import { CHAINS } from 'types';
import { types } from '../types/types';

export const setChain = (chain: CHAINS) => async (dispatch: any) => {
    dispatch({
        type: types.SET_CHAIN,
        payload: chain
    });
};



export const setLatestBlockRef = (data: BlockRef) => async (dispatch: any) => {
    dispatch({
        type: types.SET_LATEST_BLOCK_REF,
        payload: data
    });
};
