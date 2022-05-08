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
}
