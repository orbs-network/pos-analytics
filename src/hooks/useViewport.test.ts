import { getViewportMode } from './useViewport';

describe('getViewportMode', () => {
    it('uses one shared set of boundaries for mobile, tablet, and desktop layouts', () => {
        expect(getViewportMode(320)).toBe('mobile');
        expect(getViewportMode(767)).toBe('mobile');
        expect(getViewportMode(768)).toBe('tablet');
        expect(getViewportMode(1199)).toBe('tablet');
        expect(getViewportMode(1200)).toBe('desktop');
    });
});
