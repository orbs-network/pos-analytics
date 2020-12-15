import { PosOverview, PosOverviewSlice, PosOverviewData } from '@orbs-network/pos-analytics-lib';
import moment from 'moment';
import { GuardiansChartDatasetObject, OverviewGuardianDataset } from 'global/types';
import { ChartUnit } from '../../global/enums';
import { DATE_FORMAT, OVERVIEW_CHART_LIMIT } from '../../global/variables';
import { convertDateFromUnitFormat, generateDays, generateWeeks, getDateFormatByUnit } from '../dates';
import { createGuardianDatasets, getLastSlice } from './overview';
import { findIndexInArray } from 'utils/array';
import _ from 'lodash';
export const generateDataset = (arr: any) => {
    const result = Object.keys(arr).map((key) => {
        return arr[key];
    });
    return result;
};

export const groupArr = (slices: PosOverviewSlice[], unit: ChartUnit) => {
    
    const mapped = slices.map((slice) => {
        let prev: PosOverviewData[] = [];
        const { block_time, data } = slice;
        const date = getDateFormatByUnit(moment.unix(block_time), unit);
        const { length } = data;
        if (length > 0) {
            prev = data;
        }
        return {
            ...slice,
            date,
            data: length > 0 ? data : prev
        };
    });

    const grouped = _(mapped)
        .groupBy((x) => x.date)
        .map((value, key) => {
            const sorted = value.sort((s1: PosOverviewSlice, s2: PosOverviewSlice) => s1.block_time - s2.block_time);
            const slice = sorted[sorted.length - 1];
            const rawDate = convertDateFromUnitFormat(key, unit);
            return { date: key, slice, rawDate };
        })
        .value();
    return grouped;
};

const insertGuardiansByDate = (
    slices: PosOverviewSlice[],
    unit: ChartUnit,
    guardianDatasets: { [id: string]: OverviewGuardianDataset }
) => {
    const totalObject: any = {};
    const grouped = groupArr(slices, unit);
    grouped.forEach(({ slice, date, rawDate }: any) => {
        const { data, total_effective_stake } = slice;
        const dateString = moment(rawDate).format(DATE_FORMAT);
        totalObject[dateString] = total_effective_stake;
        data.forEach(({ effective_stake, address }: PosOverviewData) => {
            const currDataset = guardianDatasets[address];
            if (!currDataset) return;
            const index = findIndexInArray(currDataset.data as any, 'group', date);
            if (index < 0) return;
            const point: GuardiansChartDatasetObject = {
                group: date,
                x: dateString,
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
    return getOverviewChartData(dates, unit, overviewData, guardiansColors);
};
