import { chains } from 'config';
import { types } from 'redux/types/types';
import { CHAINS } from 'types';

export const createWeb3 = (chain: CHAINS) => async (dispatch: any) => {
    const chainConfig = chains[chain];
    if (!chainConfig) {
        return;
    }
    try {
        const { getWeb3 } = chainConfig;

        const web3 = await getWeb3();

        dispatch({
            type: types.SET_WEB3,
            payload: { web3, chain }
        });
    } catch (error) {}
};
