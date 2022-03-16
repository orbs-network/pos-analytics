import { CHAINS } from 'types';

const chains = {
    [CHAINS.ETHEREUM]: {
        rpc: 'https://mainnet.infura.io/v3/9679dc4f2d724f7997547f05f769d74e',
        node: ['https://0xcore-management-direct.global.ssl.fastly.net/analytics'],
        chainId: 1
    },
    [CHAINS.POLYGON]: {
        rpc: 'https://polygon-rpc.com',
        node: ['https://0xcore-matic-reader-direct.global.ssl.fastly.net/analytics'],
        chainId: 137
    }
};

export { chains };
