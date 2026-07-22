import {
    DelegatorInfo,
    DelegatorStakeHistoryRange,
    getDelegator,
    getDelegatorStakeHistory,
    getGuardian,
    getGuardians,
    getOverview
} from 'pos-analytics-graph';
import axios from 'axios';
import { SupportedLanguage } from '../../global/types';
import { LOCAIZE_API, LOCAIZE_PROJECT_ID } from '../../global/variables';
import { BlockRef } from '../../redux/types/main-types';

type PageApiName =
    | 'delegator'
    | 'delegator-current'
    | 'delegator-stake-history'
    | 'guardian'
    | 'guardians'
    | 'overview';

const runObservedPageApi = async <T, F>(name: PageApiName, request: () => Promise<T>, fallback: F): Promise<T | F> => {
    const startedAt = Date.now();
    let succeeded = false;
    try {
        const result = await request();
        succeeded = true;
        return result;
    } catch (error) {
        return fallback;
    } finally {
        console.info('[page-api]', {
            name,
            durationMs: Math.max(0, Date.now() - startedAt),
            status: succeeded ? 'success' : 'failure'
        });
    }
};

class Api {
    async getDelegatorApi(address: string, web3: any, blockRef: BlockRef) {
        return runObservedPageApi('delegator', () => getDelegator(address, web3, undefined, blockRef), undefined);
    }

    async getDelegatorCurrentApi(address: string, web3: any, blockRef: BlockRef) {
        return runObservedPageApi(
            'delegator-current',
            () => getDelegator(address, web3, { read_history: false }, blockRef),
            undefined
        );
    }

    async getDelegatorStakeHistoryApi(
        address: string,
        web3: any,
        range: DelegatorStakeHistoryRange,
        current: DelegatorInfo
    ) {
        return runObservedPageApi(
            'delegator-stake-history',
            () => getDelegatorStakeHistory(address, web3, range, { current }),
            undefined
        );
    }

    async getGuardianApi(address: string, web3: any, blockRef: BlockRef) {
        return runObservedPageApi('guardian', () => getGuardian(address, web3, undefined, blockRef), undefined);
    }

    async getGuardiansApi(nodeEndpoints: string[]) {
        return runObservedPageApi('guardians', () => getGuardians(nodeEndpoints), null);
    }

    async getOverviewApi(nodeEndpoints: string[], web3: any) {
        return runObservedPageApi('overview', () => getOverview(nodeEndpoints, web3), null);
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
