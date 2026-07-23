import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { getLoadProgress, LoadProgress } from 'pos-analytics-graph';
import { ViewportMode } from '../../hooks/useViewport';
import './load-progress-bar.scss';

const messages: { [language: string]: { loading: string; eventsScanned: string } } = {
    en: { loading: 'Loading data…', eventsScanned: 'events scanned' },
    ko: { loading: '데이터 불러오는 중…', eventsScanned: '개 이벤트 확인' },
    ja: { loading: 'データを読み込み中…', eventsScanned: '件のイベントを確認' }
};

// Slim overlay bar showing how much of the page's data loading has completed.
// A unit is one data operation (subgraph stream read / RPC state read); cached
// streams complete instantly, so warm visits barely show the bar. Polls every
// 300ms while any operation is active.
interface LoadProgressBarProps {
    viewportMode: ViewportMode;
}

export const LoadProgressBar = ({ viewportMode }: LoadProgressBarProps) => {
    const { i18n } = useTranslation();
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
    const language = String(i18n.language || 'en').split('-')[0];
    const message = messages[language] || messages.en;
    const detail = progress.pagesFetched > 0
        ? ` (~${(progress.pagesFetched * 1000).toLocaleString()} ${message.eventsScanned})`
        : '';
    return createPortal(
        <div className={`load-progress-bar load-progress-bar--${viewportMode}`}>
            <div className="load-progress-bar__fill" style={{ width: `${percent}%` }} />
            <span className="load-progress-bar__label">
                {message.loading} {percent.toFixed(0)}%{detail}
            </span>
        </div>,
        document.body
    );
};
