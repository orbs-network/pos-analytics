import { PosOverview, PosOverviewSlice, PosOverviewData, Guardian } from '@orbs-network/pos-analytics-lib';
import { OverviewGuardianDataset, GuardiansChartDatasetObject } from 'global/types';
import moment from 'moment';
import { findIndexInArray } from 'utils/array';
import { ChartUnit } from '../../global/enums';
import { DATE_FORMAT, OVERVIEW_CHART_LIMIT } from '../../global/variables';
import { generateWeeks, generateDays, getDateFormatByUnit } from '../dates';
import { createGuardianDatasets, filledEmptyData, getLastSlice } from './overview';
import { groupArr } from './stake-chart';

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
) => {
    const grouped = groupArr(slices, unit)
    const totalObject: any ={}
    grouped.forEach(({ slice, date, rawDate }: any) => {
        const { data, total_weight, total_effective_stake } = slice;
        const dateString = moment(rawDate).format(DATE_FORMAT);
        totalObject[dateString] = total_effective_stake;
        
        data.forEach(({ weight, address }: PosOverviewData) => {
            const currDataset = guardianDatasets[address];
            if (!currDataset) return;
            const index = findIndexInArray(currDataset.data as any, 'group', date);
            if (index < 0) return;
            const percent = (weight / total_weight) * 100;
            const point: GuardiansChartDatasetObject = {
                group: date,
                x: dateString,
                y: percent
            };
            currDataset.data.splice(index, 1, point);
        });
    });
    // slices.forEach(({ block_time, data }: PosOverviewSlice) => {
    //     const blockTimeDate = moment.unix(block_time);
    //     const blockTimeByUnit = getDateFormatByUnit(blockTimeDate, unit);
    //     const totalWeight = calculateTotalWeight(data);

    //     data.forEach(({ address, weight, name }: PosOverviewData) => {
    //         const percent = (weight / totalWeight) * 100;
    //         const currDataset = guardianDatasets[address];
    //         if(!currDataset) return 
    //         let date;
    //         const index = currDataset.data.findIndex((i) => {
    //             date = i.x;
    //             return blockTimeDate.format(DATE_FORMAT) === i.x;
    //         });

    //         if (index < 0 || !date) return;

    //         const point: GuardiansChartDatasetObject = {
    //             group: blockTimeByUnit,
    //             x: date,
    //             y: percent
    //         };
    //         currDataset.data.splice(index, 1, point);
    //         currDataset.data = filledEmptyData(currDataset.data);
    //     });
    // });
    guardianDatasets.totalObject = totalObject
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
    const guardianDatasets = createGuardianDatasets(sortedGuardians, dates, unit, guardiansColors);
    insertGuardiansByDate(slices, unit, guardianDatasets);
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
