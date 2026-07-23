import { PosOverview, PosOverviewSlice, PosOverviewData } from 'pos-analytics-graph';
import moment, { Moment } from 'moment';
import { getGuardianColor } from './overview';

const getLatestSliceAtOrBefore = (slices: PosOverviewSlice[], date: Moment): PosOverviewSlice | null => {
    const selectedDayEnd = date.clone().endOf('day').unix();

    return slices.reduce<PosOverviewSlice | null>((latest, slice) => {
        if (slice.block_time > selectedDayEnd) return latest;
        if (!latest || slice.block_time > latest.block_time) return slice;
        return latest;
    }, null);
};

export const getStakeChartData = (date: Moment, { slices }: PosOverview): null | PosOverviewData[] => {
    const selectedDateSlice = getLatestSliceAtOrBefore(slices, date);
    if (!selectedDateSlice) return null;
    return [...selectedDateSlice.data].sort((s1, s2) => s2.effective_stake - s1.effective_stake);
};

export const getWeightChartData = (date: Moment, { slices }: PosOverview): null | PosOverviewSlice => {
    const selectedDateSlice = getLatestSliceAtOrBefore(slices, date);
    if (!selectedDateSlice) return null;
    const guardians = [...selectedDateSlice.data].sort((s1, s2) => s2.effective_stake - s1.effective_stake);
    return { ...selectedDateSlice, data: guardians };
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
    if (!rawData) return null;
    const labels = rawData.map((m: PosOverviewData) => m.name);
    const data = rawData.map((m: PosOverviewData) => m.effective_stake);
    const backgroundColor = rawData.map(
        (m: PosOverviewData, index: number) => guardiansColors?.[m.address] || getGuardianColor(index)
    );

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
