import { useEffect, useState } from 'react';

export const MOBILE_VIEWPORT_MAX = 767;
export const TABLET_VIEWPORT_MAX = 1199;

export type ViewportMode = 'mobile' | 'tablet' | 'desktop';

export const getViewportMode = (width: number): ViewportMode => {
    if (width <= MOBILE_VIEWPORT_MAX) return 'mobile';
    if (width <= TABLET_VIEWPORT_MAX) return 'tablet';
    return 'desktop';
};

export const getCurrentViewportMode = (): ViewportMode => {
    if (typeof window === 'undefined') return 'desktop';
    return getViewportMode(window.innerWidth);
};

export const useViewportMode = (): ViewportMode => {
    const [viewportMode, setViewportMode] = useState<ViewportMode>(getCurrentViewportMode);

    useEffect(() => {
        const updateViewportMode = () => {
            const nextViewportMode = getCurrentViewportMode();
            setViewportMode((currentViewportMode) =>
                currentViewportMode === nextViewportMode ? currentViewportMode : nextViewportMode
            );
        };

        window.addEventListener('resize', updateViewportMode);
        updateViewportMode();

        return () => window.removeEventListener('resize', updateViewportMode);
    }, []);

    return viewportMode;
};

export const useIsMobileViewport = (): boolean => useViewportMode() === 'mobile';
