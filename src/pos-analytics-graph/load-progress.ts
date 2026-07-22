/**
 * Load-progress accounting for UI progress bars. A "unit" is one data operation the
 * page waits on: a subgraph stream read or an RPC current-state read. Units register
 * when they start and report when they finish; percent = doneUnits / totalUnits.
 * Streams also report each fetched page so the UI can show activity detail.
 * When a new batch starts after everything finished, counters reset so a fresh
 * page load starts from 0%.
 */

export interface LoadProgress {
    totalUnits: number;
    doneUnits: number;
    activeUnits: number;
    pagesFetched: number;
}

const progress: LoadProgress = { totalUnits: 0, doneUnits: 0, activeUnits: 0, pagesFetched: 0 };

export function progressUnitStart() {
    if (progress.activeUnits === 0 && progress.doneUnits >= progress.totalUnits) {
        progress.totalUnits = 0;
        progress.doneUnits = 0;
        progress.pagesFetched = 0;
    }
    progress.activeUnits += 1;
    progress.totalUnits += 1;
}

export function progressUnitDone() {
    progress.activeUnits = Math.max(progress.activeUnits - 1, 0);
    progress.doneUnits += 1;
}

export function progressPageFetched() {
    progress.pagesFetched += 1;
}

export function getLoadProgress(): LoadProgress {
    return { ...progress };
}

// Wraps a promise-returning operation as one progress unit.
export async function trackLoadUnit<T>(work: () => Promise<T>): Promise<T> {
    progressUnitStart();
    try {
        return await work();
    } finally {
        progressUnitDone();
    }
}
