import { getWeb3 } from '@orbs-network/pos-analytics-lib';
import { CHAINS, IChain } from 'types';
import ethLogo from 'assets/images/chain/ethereum-menu-logo.svg'
import polygonLogo from 'assets/images/chain/polygon-menu-logo.svg'
import { ETHERSCAN_BLOCK_ADDRESS, POLYGONSCAN_BLOCK_ADDRESS } from 'keys/keys';
import { getWeb3PolygonFromRegistry } from 'utils/polygon-web3';


// largest eth_getLogs block range that never fails on rpcman's upstream pool, used as the
// chunk size for history scans. The pools differ per chain and are heterogeneous - a chunk
// size must be reliable on the WEAKEST upstream, because each rejection stalls ~30s.
// Measured 2026-07-19 on fresh ranges: eth 4M 0/3 failed (full range rejected);
// polygon 500k 5/5 failed, 250k 2/5, 100k 0/5.
const GETLOGS_PACE_ETH = 4000000;
const GETLOGS_PACE_POLYGON = 100000;

const chains: { [key in CHAINS]: IChain} = {
    [CHAINS.ETHEREUM]: {
        rpc: process.env.REACT_APP_MAINNET_RPC!!,
        node: ['https://0xcore-management-direct.global.ssl.fastly.net/analytics'],
        chainId: 1,
        // pace is passed here (not only assigned after boot) because getWeb3's registry
        // scan already needs chunked getLogs on range-capped providers
        getWeb3: () => getWeb3(process.env.REACT_APP_MAINNET_RPC!!, true, GETLOGS_PACE_ETH),
        name:'Ethereum',
        logo: ethLogo,
        explorerUrl: ETHERSCAN_BLOCK_ADDRESS,
        getLogsPace: GETLOGS_PACE_ETH
    },
    [CHAINS.POLYGON]: {
        rpc: process.env.REACT_APP_POLYGON_RPC!!,
        node: ['https://0xcore-matic-reader-direct.global.ssl.fastly.net/analytics'],
        chainId: 137,
        getWeb3: () => getWeb3PolygonFromRegistry(process.env.REACT_APP_POLYGON_RPC!!),
        name:'Polygon',
        logo: polygonLogo,
        explorerUrl: POLYGONSCAN_BLOCK_ADDRESS,
        getLogsPace: GETLOGS_PACE_POLYGON
    }
};

export { chains };
