import { chains } from 'config';
import { CHAINS } from 'types';

const getChainConfig = (chain: CHAINS) => {
    const chainConfig = chains[chain];
    return chainConfig || chains.ethereum;
};

const getExplorerUrl = (chain: CHAINS) => {
    const config = getChainConfig(chain);
    return config.explorerUrl;
};

export { getChainConfig, getExplorerUrl };
