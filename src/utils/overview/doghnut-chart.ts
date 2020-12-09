import { PosOverview, PosOverviewSlice, PosOverviewData } from '@orbs-network/pos-analytics-lib';
import moment, { Moment } from 'moment';

const getFirstSlice = (slices: PosOverviewSlice[], date: Moment): PosOverviewData[] | null => {
    // eslint-disable-next-line @typescript-eslint/camelcase
    const selectedDateSlice: PosOverviewSlice = slices.filter(({ block_time, data }: PosOverviewSlice) => {
        const blockTimeDate = moment.unix(block_time);
        if (moment(blockTimeDate).dayOfYear() !== date.dayOfYear()) return undefined;
        return data;
    })[0];
    if (!selectedDateSlice) return null;
    return selectedDateSlice.data.sort((s1, s2) => s2.effective_stake - s1.effective_stake);
};

export const getOverviewChartData = (date: Moment, { slices }: PosOverview): null | PosOverviewData[] => {
    // eslint-disable-next-line @typescript-eslint/camelcase
    const selectedDateSliceGuardians = getFirstSlice(slices, date);
    if (!selectedDateSliceGuardians) return null;
    return selectedDateSliceGuardians;
};

export const getDoughnutChartData = (date: Date, overviewData?: PosOverview): PosOverviewData[] | null => {
    if (!overviewData) return null;
    return getOverviewChartData(moment(date), overviewData);
};

interface Result {
    labels: string[];
    datasets: Dataset[];
}
interface Dataset {
    data: number[];
    backgroundColor: string[];
    hoverBackgroundColor: string[];
    borderWidth: number;
    weight: number;
}

interface ChartData {
    data: number[];
    labels: string[];
    backgroundColor: string[];
}

export const generateDoghnutDataset = (
    rawData: PosOverviewData[] | null,
    guardiansColors?: { [id: string]: string }
): Result | null => {
    if (!rawData || !guardiansColors) return null;
    const labels = rawData.map((m: PosOverviewData) => m.name);
    const data = rawData.map((m: PosOverviewData) => m.effective_stake);
    const backgroundColor = rawData.map((m: PosOverviewData) => guardiansColors[m.address]);

    const result = {
        labels,
        datasets: [
            {
                data,
                backgroundColor,
                hoverBackgroundColor: backgroundColor,
                borderWidth: 0,
                weight: 2
            }
        ]
    };
    return result;
};
