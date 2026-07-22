import React from 'react';
import { fireEvent, render, wait } from '@testing-library/react';

const mockDispatch = jest.fn();
const mockGetWeb3 = jest.fn();
const mockGetRefBlocks = jest.fn();
const mockStoreClear = jest.fn();

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ i18n: { language: 'ko' } })
}));

jest.mock('localforage', () => ({
    createInstance: () => ({ clear: mockStoreClear })
}));

jest.mock('../utils/router', () => ({
    getRouterBaseName: () => 'ethereum'
}));

jest.mock('../config', () => ({
    chains: {
        ethereum: { getWeb3: () => mockGetWeb3() },
        polygon: { getWeb3: () => mockGetWeb3() }
    }
}));

jest.mock('pos-analytics-graph', () => ({
    getRefBlocks: (...args: any[]) => mockGetRefBlocks(...args),
    configureStreamCache: jest.fn(),
    configurePosAnalyticsSubgraph: jest.fn()
}));

jest.mock('../app', () => () => <div data-testid="ready-app">ready</div>);

import AppWrapper from './index';

describe('AppWrapper initialization', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockStoreClear.mockResolvedValue(undefined);
    });

    it('shows a localized retry action after failure and recovers without exposing the raw error', async () => {
        mockGetWeb3.mockRejectedValueOnce(new Error('private provider URL must not be rendered'));
        const view = render(<AppWrapper />);

        await wait(() => expect(view.getByText('다시 시도')).toBeTruthy());
        expect(view.getByText('분석 데이터를 불러올 수 없습니다.')).toBeTruthy();
        expect(view.getByText('연결 상태를 확인한 후 잠시 뒤 다시 시도해 주세요.')).toBeTruthy();
        expect(view.queryByText(/private provider URL/)).toBeNull();

        const web3 = { eth: {} };
        const blockRef = { 1: { number: 100, time: 200 } };
        mockGetWeb3.mockResolvedValueOnce(web3);
        mockGetRefBlocks.mockResolvedValueOnce(blockRef);
        fireEvent.click(view.getByText('다시 시도'));

        await wait(() => expect(view.getByTestId('ready-app')).toBeTruthy());
        expect(mockGetWeb3).toHaveBeenCalledTimes(2);
        expect(mockGetRefBlocks).toHaveBeenCalledTimes(1);
        expect(mockGetRefBlocks).toHaveBeenCalledWith([web3]);
        expect(mockDispatch).toHaveBeenCalledTimes(1);
    });
});
