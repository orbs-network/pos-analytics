import { PosOverview, PosOverviewSlice, PosOverviewData, Guardian } from '@orbs-network/pos-analytics-lib';
import { OverviewGuardianDataset, GuardiansChartDatasetObject } from 'global/types';
import moment from 'moment';
import { ChartUnit } from '../../global/enums';
import { DATE_FORMAT, OVERVIEW_CHART_LIMIT } from '../../global/variables';
import { generateWeeks, generateDays, getDateFormatByUnit } from '../dates';
import { createGuardianDatasets, filledEmptyData, getLastSlice } from './overview';

export const generateDataset = (arr: any) => {
    const result = Object.keys(arr).map((key) => {
        return arr[key];
    });
    return result;
};

const calculateTotalWeight = (data: PosOverviewData[]) => {
    return data
        .map((m) => m.weight)
        .reduce(function (total, g1) {
            return total + g1;
        }, 0);
};

const insertGuardiansByDate = (
    slices: PosOverviewSlice[],
    unit: ChartUnit,
    guardianDatasets: { [id: string]: OverviewGuardianDataset },
    dates: Date[]
) => {
    slices.forEach(({ block_time, data }: PosOverviewSlice) => {
        const blockTimeDate = moment.unix(block_time);
        const blockTimeByUnit = getDateFormatByUnit(blockTimeDate, unit);
        const totalWeight = calculateTotalWeight(data);

        data.forEach(({ address, weight, name }: PosOverviewData) => {
            const percent = (weight / totalWeight) * 100;
            const currDataset = guardianDatasets[address];
            if(!currDataset) return 
            let date;
            const index = currDataset.data.findIndex((i) => {
                date = i.x;
                return blockTimeDate.format(DATE_FORMAT) === i.x;
            });

            if (index < 0 || !date) return;

            const point: GuardiansChartDatasetObject = {
                group: blockTimeByUnit,
                x: date,
                y: percent
            };
            currDataset.data.splice(index, 1, point);
            currDataset.data = filledEmptyData(currDataset.data);
        });
    });

    return guardianDatasets;
};

export const getOverviewChartData = (
    dates: any,
    unit: ChartUnit,
    { slices }: PosOverview,
    guardiansColors?: { [id: string]: string }
) => {
    const lastSlice = getLastSlice(slices);
    if (!lastSlice) return;
    const sortedGuardians = lastSlice.data.sort((s1, s2) => s2.weight - s1.weight);
    let guardianDatasets = createGuardianDatasets(sortedGuardians, dates, unit, guardiansColors);
    insertGuardiansByDate(slices, unit, guardianDatasets, dates);
    const obj = {
        data: generateDataset(guardianDatasets),
        unit,
        guardianDatasets
    };
    return obj;
};
export const getWeightsChartData = (
    unit: ChartUnit,
    overviewData?: PosOverview,
    guardiansColors?: { [id: string]: string }
): any => {
    if (!overviewData) return;
    let dates;
    switch (unit) {
        case ChartUnit.WEEK:
            dates = generateWeeks(OVERVIEW_CHART_LIMIT);
            break;
        case ChartUnit.DAY:
            dates = generateDays(OVERVIEW_CHART_LIMIT);
            break;
        default:
            dates = generateWeeks(OVERVIEW_CHART_LIMIT);
            break;
    }
    if (!dates) return;
    return getOverviewChartData(dates, unit, overviewData, guardiansColors);
};
