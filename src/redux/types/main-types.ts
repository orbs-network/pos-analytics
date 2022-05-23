import { CHAINS } from 'types';

export interface BlockRef {
    [key: number]: {
        time: number;
        number: number;
    }
}
export interface MainState {
    chain: CHAINS;
    web3: any;
    blockRef?: BlockRef;
}
