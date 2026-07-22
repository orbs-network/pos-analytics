import moment from 'moment';
import { PosOverview, PosOverviewData, PosOverviewSlice } from 'pos-analytics-graph';
import { generateDoghnutDataset, getDoughnutStakeChartData, getDoughnutWeightChartData } from './doghnut-chart';
import { getGuardianColor } from './overview';

const guardian = (name: string, address: string, effectiveStake: number): PosOverviewData => ({
    name,
    address,
    effective_stake: effectiveStake,
    weight: effectiveStake
});

const slice = (date: string, data: PosOverviewData[]): PosOverviewSlice => ({
    block_number: moment(date).unix(),
    block_time: moment(date).unix(),
    total_weight: 100,
    total_effective_stake: 100,
    data
});

const overview = (slices: PosOverviewSlice[]): PosOverview => ({
    block_number: 1,
    block_time: 1,
    total_stake: 100,
    n_guardians: 2,
    n_committee: 2,
    n_candidates: 0,
    apy: 0,
    slices
});

describe('mobile overview doughnut data', () => {
    it('carries the latest committee state forward to a day without an event', () => {
        const previous = [guardian('A', '0xa', 40), guardian('B', '0xb', 60)];
        const data = getDoughnutStakeChartData(
            moment('2026-07-22T12:00:00').toDate(),
            overview([slice('2026-07-17T08:00:00', previous)])
        );

        expect(data?.map(({ name }) => name)).toEqual(['B', 'A']);
    });

    it('uses the latest event within the selected day', () => {
        const morning = slice('2026-07-22T02:00:00', [guardian('Morning', '0xa', 10)]);
        const evening = slice('2026-07-22T20:00:00', [guardian('Evening', '0xb', 20)]);
        const data = getDoughnutStakeChartData(moment('2026-07-22T12:00:00').toDate(), overview([evening, morning]));

        expect(data?.[0].name).toBe('Evening');
    });

    it('returns no state for a date before the first known event', () => {
        const data = getDoughnutStakeChartData(
            moment('2026-07-10T12:00:00').toDate(),
            overview([slice('2026-07-17T08:00:00', [guardian('A', '0xa', 10)])])
        );

        expect(data).toBeNull();
    });

    it('sorts a copied weight slice without mutating the overview state', () => {
        const originalData = [guardian('A', '0xa', 10), guardian('B', '0xb', 20)];
        const originalSlice = slice('2026-07-17T08:00:00', originalData);
        const result = getDoughnutWeightChartData(moment('2026-07-22T12:00:00').toDate(), overview([originalSlice]));

        expect(result?.data.map(({ name }) => name)).toEqual(['B', 'A']);
        expect(originalSlice.data.map(({ name }) => name)).toEqual(['A', 'B']);
        expect(result).not.toBe(originalSlice);
    });

    it('uses deterministic fallback colors while guardian colors are still loading', () => {
        const rawData = [guardian('A', '0xa', 10), guardian('B', '0xb', 20)];
        const data = generateDoghnutDataset(rawData);

        expect(data?.datasets[0].backgroundColor).toEqual([getGuardianColor(0), getGuardianColor(1)]);
    });
});
