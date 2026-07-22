import { DelegatorInfo } from 'pos-analytics-graph';
import { ChartData } from '../../global/types';
import { DelegatorHistoryCacheEntry } from '../../utils/delegator-history-cache';

export interface DelegatorState {
    selectedDelegator?: DelegatorInfo;
    delegatorNotFound: boolean;
    delegatorIsLoading: boolean;
    delegatorChartData?: ChartData;
    activeDelegatorRequestId?: string;
    delegatorHistoryIsLoading: boolean;
    delegatorHistoryError: boolean;
    activeDelegatorHistoryRequestId?: string;
    delegatorHistoryCache: DelegatorHistoryCacheEntry[];
}
