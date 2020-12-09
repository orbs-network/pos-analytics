import { PosOverview, PosOverviewSlice, PosOverviewData } from '@orbs-network/pos-analytics-lib';
import moment, { Moment } from 'moment';

const getFirstSlice = (slices: PosOverviewSlice[], date: Moment): PosOverviewSlice | null => {
    // eslint-disable-next-line @typescript-eslint/camelcase
    const selectedDateSlice: PosOverviewSlice = slices.filter(({ block_time, data }: PosOverviewSlice) => {
        const blockTimeDate = moment.unix(block_time);
        if (moment(blockTimeDate).dayOfYear() !== date.dayOfYear()) return undefined;
        return data;
    })[0];
  return selectedDateSlice
  
};

export const getStakeChartData = (date: Moment, { slices }: PosOverview): null | PosOverviewData[] => {
    // eslint-disable-next-line @typescript-eslint/camelcase
    const selectedDateSlice = getFirstSlice(slices, date);
    if (!selectedDateSlice) return null;
    return selectedDateSlice.data.sort((s1, s2) => s2.effective_stake - s1.effective_stake);
};


export const getWeightChartData = (date: Moment, { slices }: PosOverview): null | PosOverviewSlice => {
    // eslint-disable-next-line @typescript-eslint/camelcase
    const selectedDateSlice = getFirstSlice(slices, date);
    if (!selectedDateSlice) return null;
    const guardians = selectedDateSlice.data.sort((s1, s2) => s2.effective_stake - s1.effective_stake)
    selectedDateSlice.data = guardians
    return selectedDateSlice
};                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    

export const getDoughnutStakeChartData = (date: Date, overviewData?: PosOverview): PosOverviewData[] | null => {
    if (!overviewData) return null;
    return getStakeChartData(moment(date), overviewData);
};
export const getDoughnutWeightChartData = (date: Date, overviewData?: PosOverview): PosOverviewSlice | null => {
    if (!overviewData) return null;
    return getWeightChartData(moment(date), overviewData);
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
