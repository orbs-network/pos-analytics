import React, { useEffect, useState } from 'react';
import localforage from 'localforage';
import App from '../app';
import { getRouterBaseName } from '../utils/router';
import { useDispatch } from 'react-redux';
import { setInitialConfiguration } from '../redux/actions/global-actions';
import { AppLoader } from '../components/app-loader/app-loader';
import { getRefBlocks } from '@orbs-network/pos-analytics-lib/dist/eth-helpers';
import { configureEventCache } from '@orbs-network/pos-analytics-lib';
import { chains } from '../config';
import { CHAINS } from '../types';

const chain = getRouterBaseName();

// Incremental event cache (IndexedDB). Toggle per visit with a URL param for A/B runs:
//   ?cache=off   disable (every event scan hits the RPC, pre-cache behaviour)
//   ?cache=on    enable
//   ?cache=clear wipe stored events, then run enabled
// Default comes from REACT_APP_EVENT_CACHE ('off' disables); otherwise enabled.
const setupEventCache = async () => {
    const store = localforage.createInstance({ name: 'pos-analytics', storeName: 'event_cache' });
    const param = new URLSearchParams(window.location.search).get('cache');
    if (param === 'clear') await store.clear();
    const enabled = param
        ? param !== 'off' && param !== '0' && param !== 'false'
        : process.env.REACT_APP_EVENT_CACHE !== 'off';
    configureEventCache({ storage: store, enabled });
    console.log(`event cache: ${enabled ? 'enabled' : 'disabled'}${param === 'clear' ? ' (cleared)' : ''}`);
};

function AppWrapper() {
    const [appLoading, setAppLoading] = useState(true);

    const dispatch = useDispatch();

    useEffect(() => {
        const onLoad = async () => {
            const chainConfig = chains[chain] || chains[CHAINS.ETHEREUM];
            const { getWeb3 } = chainConfig;

            await setupEventCache();
            const web3: any = await getWeb3();
            if (chainConfig.getLogsPace) Object.assign(web3, { getLogsPace: chainConfig.getLogsPace });
            const blockRef = await getRefBlocks([web3]);
            dispatch(setInitialConfiguration(chain, web3, blockRef));
            setAppLoading(false);
        };
        onLoad();
    }, []);

    return !appLoading ? <App /> : <AppLoader />;
}

export default AppWrapper;
