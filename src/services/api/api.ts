import { getDelegator, getGuardian, getGuardians, getOverview } from '@orbs-network/pos-analytics-lib';
import axios from 'axios';
import { SupportedLanguage } from '../../global/types';
import { LOCAIZE_API, LOCAIZE_PROJECT_ID } from '../../global/variables';
class Api {
    async getDelegatorApi(address: string, ethereumEndpoint: string) {
        
        try {
            const res = await getDelegator(address, ethereumEndpoint);
            return res;
        } catch (error) {
            return undefined;
        }
    }

    async getGuardianApi(address: string, ethereumEndpoint: string) {
        
        try {
           return getGuardian(address, ethereumEndpoint);
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
    async getOverviewApi(nodeEndpoints: string[], ethereumEndpoint: string) {
        try {
           return getOverview(nodeEndpoints, ethereumEndpoint);
        } catch (error) {
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
