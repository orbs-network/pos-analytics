// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, wait } from '@testing-library/react';
import { vi } from 'vitest';

const { mockDispatch, mockGetWeb3, mockGetRefBlocks, mockStoreClear } = vi.hoisted(() => ({
    mockDispatch: vi.fn(),
    mockGetWeb3: vi.fn(),
    mockGetRefBlocks: vi.fn(),
    mockStoreClear: vi.fn()
}));

vi.mock('react-redux', () => ({
    useDispatch: () => mockDispatch
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ i18n: { language: 'ko' } })
}));

vi.mock('localforage', () => ({
    default: {
        createInstance: () => ({ clear: mockStoreClear })
    }
}));

vi.mock('../utils/router', () => ({
    getRouterBaseName: () => 'ethereum'
}));

vi.mock('../config', () => ({
    chains: {
        ethereum: { getWeb3: () => mockGetWeb3() },
        polygon: { getWeb3: () => mockGetWeb3() }
    }
}));

vi.mock('pos-analytics-graph', () => ({
    getRefBlocks: (...args: any[]) => mockGetRefBlocks(...args),
    configureStreamCache: vi.fn(),
    configurePosAnalyticsSubgraph: vi.fn()
}));

vi.mock('../app', () => ({
    default: () => <div data-testid="ready-app">ready</div>
}));

import AppWrapper from './index';

describe('AppWrapper initialization', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockStoreClear.mockResolvedValue(undefined);
    });

    it('shows a localized retry action after failure and recovers without exposing the raw error', async () => {
        const web3 = { eth: {} };
        const blockRef = { 1: { number: 100, time: 200 } };
        mockGetWeb3.mockResolvedValue(web3);
        mockGetRefBlocks.mockResolvedValue(blockRef);
        mockGetWeb3.mockRejectedValueOnce(new Error('private provider URL must not be rendered'));
        const view = render(<AppWrapper />);

        await wait(() => expect(view.getByText('다시 시도')).toBeTruthy());
        expect(view.getByText('분석 데이터를 불러올 수 없습니다.')).toBeTruthy();
        expect(view.getByText('연결 상태를 확인한 후 잠시 뒤 다시 시도해 주세요.')).toBeTruthy();
        expect(view.queryByText(/private provider URL/)).toBeNull();

        fireEvent.click(view.getByText('다시 시도'));

        await wait(() => expect(mockGetWeb3).toHaveBeenCalledTimes(2));
        await wait(() => expect(view.getByTestId('ready-app')).toBeTruthy());
        expect(mockGetRefBlocks).toHaveBeenCalledTimes(1);
        expect(mockGetRefBlocks).toHaveBeenCalledWith([web3]);
        expect(mockDispatch).toHaveBeenCalledTimes(1);
    });
});
