import { chains } from "config"
import { CHAINS } from "types"

const getChainConfig = (chain: CHAINS) => {
    const chainConfig = chains[chain]
    return chainConfig || chains.ethereum
}

export {getChainConfig}