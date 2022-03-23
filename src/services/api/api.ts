import {
    getDelegator,
    getGuardian,
    getGuardians,
    getOverview,
    getWeb3,
    getWeb3Polygon
} from '@orbs-network/pos-analytics-lib';
import axios from 'axios';
import { SupportedLanguage } from '../../global/types';
import { LOCAIZE_API, LOCAIZE_PROJECT_ID } from '../../global/variables';
class Api {
    async getDelegatorApi(address: string, web3: any) {
        try {
            const res = await getDelegator(address, web3);
            return res;
        } catch (error) {
            return undefined;
        }
    }

    async getGuardianApi(address: string, web3: any) {
        try {
            return getGuardian(address, web3);
        } catch (error) {
            return undefined;
        }
    }

    async getGuardiansApi(nodeEndpoints: string[]) {
        try {
            return getGuardians(nodeEndpoints);
        } catch (error) {
            return null;
        }
    }
    async getOverviewApi(nodeEndpoints: string[], web3: any) {
                        
        try {
            return getOverview(nodeEndpoints, web3);
        } catch (error) {
            console.log(error);
            
            return null;
        }
    }

    async getSupportedlanguages(): Promise<{ [id: string]: SupportedLanguage } | null> {
        try {
            const res = await axios.get(`${LOCAIZE_API}/languages/${LOCAIZE_PROJECT_ID}`);
            return res.data;
        } catch (error) {
            return null;
        }
    }
}

export const api = new Api();
