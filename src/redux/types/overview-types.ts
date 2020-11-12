import { PosOverview } from '@orbs-network/pos-analytics-lib';

export interface OverviewState {
    overviewData?: PosOverview;
    overviewStakeChartData?: any;
    overviewWeightsChartData?: any;
    overviewDataLoding: boolean;
}
