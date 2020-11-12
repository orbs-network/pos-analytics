import { Delegator } from '@orbs-network/pos-analytics-lib';
import { ChartData } from '../../global/types';

export interface DelegatorState {
    selectedDelegator?: Delegator;
    delegatorNotFound: boolean;
    delegatorIsLoading: boolean;
    delegatorChartData?: ChartData;
}
