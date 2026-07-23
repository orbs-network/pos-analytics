import React from 'react';
import './app-loader.scss';

interface AppLoaderProps {
    title?: string;
    description?: string;
    retryLabel?: string;
    onRetry?: () => void;
}

export const AppLoader = ({ title = 'Loading...', description, retryLabel, onRetry }: AppLoaderProps) => {
    return (
        <div className="app-loader" role={onRetry ? 'alert' : undefined}>
            <h5>{title}</h5>
            {description && <p>{description}</p>}
            {onRetry && retryLabel && (
                <button type="button" onClick={onRetry}>
                    {retryLabel}
                </button>
            )}
        </div>
    );
};
