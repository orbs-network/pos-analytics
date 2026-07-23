import { ChartUnit } from '../global/enums';
import { getDelegatorHistoryRange } from './delegator-history-range';

describe('getDelegatorHistoryRange', () => {
    const now = new Date('2026-07-21T14:42:06.987Z');
    const toTime = Math.floor(now.getTime() / 1000);

    it.each([
        [ChartUnit.MONTH, '2025-10-01T00:00:00.000Z'],
        [ChartUnit.WEEK, '2026-05-18T00:00:00.000Z'],
        [ChartUnit.DAY, '2026-07-12T00:00:00.000Z']
    ])('returns ten UTC calendar buckets for %s', (unit, expectedStart) => {
        expect(getDelegatorHistoryRange(unit as ChartUnit, now)).toEqual({
            fromTime: Math.floor(new Date(expectedStart as string).getTime() / 1000),
            toTime
        });
    });
});
