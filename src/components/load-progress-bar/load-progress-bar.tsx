import React, { useEffect, useState } from 'react';
import { getLoadProgress, LoadProgress } from 'pos-analytics-graph';
import './load-progress-bar.scss';

// Slim overlay bar showing how much of the page's data loading has completed.
// A unit is one data operation (subgraph stream read / RPC state read); cached
// streams complete instantly, so warm visits barely show the bar. Polls every
// 300ms while any operation is active.
export const LoadProgressBar = () => {
    const [progress, setProgress] = useState<LoadProgress>({
        totalUnits: 0,
        doneUnits: 0,
        activeUnits: 0,
        pagesFetched: 0
    });

    useEffect(() => {
        const id = setInterval(() => setProgress(getLoadProgress()), 300);
        return () => clearInterval(id);
    }, []);

    if (!progress.activeUnits || !progress.totalUnits) return null;
    const percent = Math.min((progress.doneUnits / progress.totalUnits) * 100, 100);
    const detail = progress.pagesFetched > 0 ? ` (~${(progress.pagesFetched * 1000).toLocaleString()} events scanned)` : '';
    return (
        <div className="load-progress-bar">
            <div className="load-progress-bar__fill" style={{ width: `${percent}%` }} />
            <span className="load-progress-bar__label">
                Loading data… {percent.toFixed(0)}%{detail}
            </span>
        </div>
    );
};
