export enum CHAINS {
    ETHEREUM = 'ethereum',
    POLYGON = 'polygon'
}

export interface IChain {
    rpc: string;
    node: string[];
    chainId: number;
    getWeb3: () => void;
    name: string;
    logo: string;
    explorerUrl: string;
    // largest eth_getLogs block range the RPC provider accepts; used as chunk size for
    // history scans. Omit to let the lib discover it (slow on providers that fail slowly).
    getLogsPace?: number;
}
