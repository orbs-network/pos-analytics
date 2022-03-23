import { chains } from "config"
import { CHAINS } from "types"

const getRouterBaseName = (): CHAINS => {
    
    const chain = window.location.pathname.split('/')[1].toLocaleLowerCase()
    const validChain = chains[chain as CHAINS]        
    if(validChain){
        return chain as CHAINS
    }
    return CHAINS.ETHEREUM
    
}

export { getRouterBaseName }