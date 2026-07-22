import { ChartUnit } from '../global/enums';
import { STACK_GRAPH_MONTHS_LIMIT } from '../global/variables';

export interface DelegatorHistoryRange {
    fromTime: number;
    toTime: number;
}

const seconds = (milliseconds: number): number => Math.floor(milliseconds / 1000);

/**
 * Returns the current partial UTC calendar bucket plus the previous nine buckets.
 * The range always ends at `now`, so a current-state snapshot can anchor an exact
 * reverse reconstruction of the bounded event history.
 */
export const getDelegatorHistoryRange = (unit: ChartUnit, now: Date = new Date()): DelegatorHistoryRange => {
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const dayOfMonth = now.getUTCDate();
    const previousBuckets = STACK_GRAPH_MONTHS_LIMIT - 1;
    let fromMilliseconds: number;

    switch (unit) {
        case ChartUnit.MONTH:
            fromMilliseconds = Date.UTC(year, month - previousBuckets, 1);
            break;
        case ChartUnit.DAY:
            fromMilliseconds = Date.UTC(year, month, dayOfMonth - previousBuckets);
            break;
        case ChartUnit.WEEK: {
            const daysSinceMonday = (now.getUTCDay() + 6) % 7;
            fromMilliseconds = Date.UTC(year, month, dayOfMonth - daysSinceMonday - previousBuckets * 7);
            break;
        }
        default:
            throw new Error(`Unsupported chart unit: ${unit}`);
    }

    return {
        fromTime: seconds(fromMilliseconds),
        toTime: seconds(now.getTime())
    };
};
