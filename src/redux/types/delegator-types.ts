import { DelegatorInfo } from '@orbs-network/pos-analytics-lib';
import { ChartData } from '../../global/types';

export interface DelegatorState {
    selectedDelegator?: DelegatorInfo;
    delegatorNotFound: boolean;
    delegatorIsLoading: boolean;
    delegatorChartData?: ChartData;
}
