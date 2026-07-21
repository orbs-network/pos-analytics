import { describe, expect, it } from 'vitest';
import moment from 'moment';
import { forEachBucketSlice } from './overview';
import { getOverviewChartData } from './stake-chart';
import { ChartUnit } from '../../global/enums';
import { PosOverviewSlice } from 'pos-analytics-graph';

const slice = (isoDay: string, stake: number): PosOverviewSlice =>
    ({
        block_number: 1,
        block_time: moment(`${isoDay} 12:00`, 'YYYY-MM-DD HH:mm').unix(),
        total_effective_stake: stake,
        total_weight: stake,
        data: [{ name: 'A', address: '0xa', effective_stake: stake, weight: stake }]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

// bucket x values use DD/MM/YYYY of the exact dates passed in
const dates = [
    moment('2026-07-21', 'YYYY-MM-DD').toDate(),
    moment('2026-07-14', 'YYYY-MM-DD').toDate(),
    moment('2026-07-07', 'YYYY-MM-DD').toDate(),
    moment('2026-06-30', 'YYYY-MM-DD').toDate()
];

describe('forEachBucketSlice (carry-forward bucket filling)', () => {
    it('fills each bucket with the latest slice at or before it, carrying state forward', () => {
        const slices = [slice('2026-07-05', 100), slice('2026-07-13', 150)];
        const datasets: any = {
            '0xa': { data: dates.map((d) => ({ group: '', x: moment(d).format('DD/MM/YYYY'), y: null })) }
        };
        const seen: { [x: string]: number } = {};
        forEachBucketSlice(slices, datasets, (s, x) => {
            seen[x] = s.total_effective_stake;
        });
        expect(seen['07/07/2026']).toBe(100); // latest slice before 7 Jul is 5 Jul
        expect(seen['14/07/2026']).toBe(150); // 13 Jul slice
        expect(seen['21/07/2026']).toBe(150); // no event that week - carried forward
        expect(seen['30/06/2026']).toBeUndefined(); // predates all data - untouched
    });

    it('uses events from the bucket day itself (inclusive end of day)', () => {
        const slices = [slice('2026-07-14', 42)];
        const datasets: any = {
            '0xa': { data: [{ group: '', x: '14/07/2026', y: null }] }
        };
        const seen: number[] = [];
        forEachBucketSlice(slices, datasets, (s) => seen.push(s.total_effective_stake));
        expect(seen).toEqual([42]);
    });
});

describe('getOverviewChartData (stake chart)', () => {
    it('produces filled y values for every bucket at or after the first event', () => {
        const slices = [slice('2026-07-05', 100), slice('2026-07-13', 150)];
        const result = getOverviewChartData(dates, ChartUnit.WEEK, { slices } as any);
        expect(result).toBeTruthy();
        const ys = Object.fromEntries(
            (result as any).guardianDatasets['0xa'].data.map((p: any) => [p.x, p.y])
        );
        expect(ys['07/07/2026']).toBe(100);
        expect(ys['14/07/2026']).toBe(150);
        expect(ys['21/07/2026']).toBe(150);
        expect(ys['30/06/2026']).toBeNull();
    });
});
