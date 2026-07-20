import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getReadProgress } from '@orbs-network/pos-analytics-lib';
import { AppState } from 'redux/types/types';
import { getChainConfig } from 'utils/chain';
import './read-progress-bar.scss';

// Slim overlay bar showing how much of the required block range has been scanned.
// Progress is tracked by the lib per chain (blocks fetched / blocks that need fetching
// this visit - ranges already in the local cache are not counted, so warm visits barely
// show the bar). Polls every 300ms while scans are active.
export const ReadProgressBar = () => {
    const { chain } = useSelector((state: AppState) => state.main);
    const [progress, setProgress] = useState({ plannedBlocks: 0, doneBlocks: 0, activeScans: 0 });

    useEffect(() => {
        const id = setInterval(() => {
            const { chainId } = getChainConfig(chain);
            setProgress(getReadProgress(chainId));
        }, 300);
        return () => clearInterval(id);
    }, [chain]);

    if (!progress.activeScans || !progress.plannedBlocks) return null;
    const percent = Math.min((progress.doneBlocks / progress.plannedBlocks) * 100, 100);
    return (
        <div className="read-progress-bar">
            <div className="read-progress-bar__fill" style={{ width: `${percent}%` }} />
            <span className="read-progress-bar__label">
                Reading blockchain history… {percent.toFixed(0)}%
            </span>
        </div>
    );
};
