import { PosOverview, PosOverviewSlice, PosOverviewData } from 'pos-analytics-graph';
import { GuardiansChartDatasetObject, OverviewGuardianDataset } from 'global/types';
import { ChartUnit } from '../../global/enums';
import {  OVERVIEW_CHART_LIMIT } from '../../global/variables';
import {  generateDays, generateWeeks } from '../dates';
import { createGuardianDatasets, forEachBucketSlice, getLastSlice } from './overview';
import _ from 'lodash';
export const generateDataset = (arr: any) => {
    const result = Object.keys(arr).map((key) => {
        return arr[key];
    });
    return result;
};


const insertGuardiansByDate = (
    slices: PosOverviewSlice[],
    unit: ChartUnit,
    guardianDatasets: { [id: string]: OverviewGuardianDataset }
) => {
    const totalObject: any = {};
    forEachBucketSlice(slices, guardianDatasets, (slice, bucketX, index) => {
        totalObject[bucketX] = slice.total_effective_stake;
        slice.data.forEach(({ effective_stake, address }: PosOverviewData) => {
            const currDataset = guardianDatasets[address];
            if (!currDataset) return;
            const point: GuardiansChartDatasetObject = {
                group: bucketX,
                x: bucketX,
                y: effective_stake
            };
            currDataset.data.splice(index, 1, point);
        });
    });
    guardianDatasets.totalObject = totalObject;
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
    const sortedGuardians = lastSlice.data.sort((s1, s2) => s2.effective_stake - s1.effective_stake);
    const guardianDatasets = createGuardianDatasets(sortedGuardians, dates, unit, guardiansColors);
    insertGuardiansByDate(slices, unit, guardianDatasets);
    const obj = {
        data: generateDataset(guardianDatasets),
        unit,
        guardianDatasets
    };
    return obj;
};

export const getStakeChartData = (
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
    // generateWeeks/generateDays return limit+1 buckets; the extra oldest one was
    // invisible before carry-forward filling (its data was filtered out) - drop it
    dates = dates.slice(0, OVERVIEW_CHART_LIMIT);
    return getOverviewChartData(dates, unit, overviewData, guardiansColors);
};
