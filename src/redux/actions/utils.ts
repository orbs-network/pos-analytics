import Cookies from 'universal-cookie';

export async function getRefBlock(web3: any, oldestActionBlock: number) {
    const chainId = await web3.eth.getChainId();
    const cookies = new Cookies();
    const cachedData = cookies.get(`refBlock_${chainId}`);    
    const refBlock =
        cachedData && cachedData.block < oldestActionBlock
            ? cachedData
            : { number: oldestActionBlock, time: (await web3.eth.getBlock(oldestActionBlock))?.timestamp };
    cookies.set(`refBlock_${chainId}`, refBlock);
    return refBlock;
}

export async function getAvgBlockTime(web3: any, refBlock: any): Promise<number> {
    const latestBlock = await web3.eth.getBlock('latest');
    
    return (latestBlock.timestamp - refBlock.time) / (latestBlock.number - refBlock.number);
}
