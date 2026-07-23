import { PosOverviewData, PosOverviewSlice } from 'pos-analytics-graph';
import { TFunction } from 'i18next';
import moment from 'moment';
import { ChartUnit, OverviewSections } from '../../global/enums';
import { GuardiansChartDatasetObject, MenuOption, OverviewGuardianDataset } from '../../global/types';
import { routes } from '../../routes/routes';
import { getDateFormatByUnit } from '../dates';
import { overviewguardiansColors } from '../../ui/colors';
import { DATE_FORMAT, OVERVIEW_CHART_LIMIT } from '../../global/variables';

export const generateOverviewRoutes = (t: TFunction): MenuOption[] => {
    return [
        {
            name: t('main.stake'),
            route: routes.overview.stake,
            key: OverviewSections.STAKE
        },
        {
            name: t('main.weights'),
            route: routes.overview.weights,
            key: OverviewSections.WEIGHTS
        }
    ];
};

export const getGuardianColor = (index: number) => {
    const colorIndex = index % overviewguardiansColors.length;
    return overviewguardiansColors[colorIndex];
};

const fillChartData = (dates: Date[], unit: ChartUnit): GuardiansChartDatasetObject[] => {
    return dates.map((date) => {
        const blockTimeDate = moment(date);
        const blockTimeByUnit = getDateFormatByUnit(blockTimeDate, unit);
        return {
            group: blockTimeByUnit,
            x: moment(date).format(DATE_FORMAT),
            y: null
        };
    });
};

export const createGuardianDatasets = (
    sortedGuardians: PosOverviewData[],
    dates: Date[],
    unit: ChartUnit,
    guardiansColors?: { [id: string]: string }
): { [id: string]: OverviewGuardianDataset } => {
    const guardiansObject: { [id: string]: OverviewGuardianDataset } = {};
    sortedGuardians.forEach((guardian: PosOverviewData, index: number) => {
        const obj = {
            order: index,
            backgroundColor: guardiansColors ? guardiansColors[guardian.address] : getGuardianColor(index),
            label: guardian.name,
            data: fillChartData(dates, unit),
            maxBarThickness: 30,
            hoverBackgroundColor: undefined
        };
        guardiansObject[guardian.address] = obj;
    });
    return guardiansObject;
};

export const getLastSlice = (slices: PosOverviewSlice[]): PosOverviewSlice | null => {
    if (!slices || slices.length === 0) return null;
    const sorted = slices.sort((s1, s2) => s2.block_time - s1.block_time);
    return sorted[0];
};

export const getMinDateByUnitOverview = (unit: ChartUnit): Date => {
    switch (unit) {
        case ChartUnit.WEEK:
            return moment().subtract(OVERVIEW_CHART_LIMIT, 'weeks').startOf('day').toDate();
        case ChartUnit.DAY:
            return moment().subtract(OVERVIEW_CHART_LIMIT, 'days').startOf('day').toDate();
        default:
            return moment().subtract(OVERVIEW_CHART_LIMIT, 'weeks').startOf('day').toDate();
    }
};

// Committee stake/weight is a step function: a chart bucket must show the state
// carried forward from the most recent committee event at or before it - NOT only
// events that happened to land on the bucket's exact calendar day (the old behavior,
// which left random bars empty depending on which weekday the site was opened).
export const forEachBucketSlice = (
    slices: PosOverviewSlice[],
    guardianDatasets: { [id: string]: OverviewGuardianDataset },
    fill: (slice: PosOverviewSlice, bucketX: string, index: number) => void
) => {
    const sample = Object.values(guardianDatasets)[0];
    if (!sample || !Array.isArray(sample.data)) return;
    const sorted = [...slices].sort((s1, s2) => s1.block_time - s2.block_time);
    sample.data.forEach((point: GuardiansChartDatasetObject, index: number) => {
        const bucketEnd = moment(point.x as string, DATE_FORMAT)
            .endOf('day')
            .unix();
        let latest: PosOverviewSlice | null = null;
        for (const slice of sorted) {
            if (slice.block_time > bucketEnd) break;
            latest = slice;
        }
        if (!latest) return; // bucket predates all known data
        fill(latest, point.x as string, index);
    });
};
