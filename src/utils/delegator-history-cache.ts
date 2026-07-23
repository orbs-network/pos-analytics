import { DelegatorStake } from 'pos-analytics-graph';

export interface DelegatorHistoryCacheEntry {
    address: string;
    chain: string;
    currentBlock: number;
    fromTime: number;
    toTime: number;
    stakeSlices: DelegatorStake[];
}

export const findCoveringDelegatorHistory = (
    entries: DelegatorHistoryCacheEntry[],
    chain: string,
    address: string,
    currentBlock: number,
    fromTime: number,
    toTime: number
): DelegatorHistoryCacheEntry | undefined =>
    entries.find(
        entry =>
            entry.chain === chain &&
            entry.address.toLowerCase() === address.toLowerCase() &&
            entry.currentBlock === currentBlock &&
            entry.fromTime <= fromTime &&
            entry.toTime >= toTime
    );

export const sliceDelegatorHistory = (
    stakeSlices: DelegatorStake[],
    fromTime: number,
    toTime: number
): DelegatorStake[] => {
    if (!stakeSlices.length) return [];

    const ascending = [...stakeSlices].sort((left, right) => {
        if (left.block_time !== right.block_time) return left.block_time - right.block_time;
        return left.block_number - right.block_number;
    });
    let boundaryIndex = -1;
    for (let index = 0; index < ascending.length; index += 1) {
        if (ascending[index].block_time < fromTime) boundaryIndex = index;
    }
    if (boundaryIndex === -1) {
        boundaryIndex = ascending.findIndex(slice => slice.block_time === fromTime);
    }
    const boundarySource = boundaryIndex >= 0 ? ascending[boundaryIndex] : undefined;
    if (!boundarySource) return [];

    const bounded = ascending.filter(
        (slice, index) =>
            slice.block_time <= toTime &&
            (slice.block_time > fromTime || (slice.block_time === fromTime && index > boundaryIndex))
    );
    bounded.unshift({ ...boundarySource, block_time: fromTime });
    return bounded.sort((left, right) => {
        if (left.block_time !== right.block_time) return right.block_time - left.block_time;
        return right.block_number - left.block_number;
    });
};
