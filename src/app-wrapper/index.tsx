import React, { useEffect } from 'react';
import App from '../app';
import { getRouterBaseName } from '../utils/router';
import { useDispatch, useSelector } from 'react-redux';
import { createWeb3 } from '../redux/actions/global-actions';
import { AppState } from '../redux/types/types';

const chain = getRouterBaseName();

function AppWrapper() {
    const { web3 } = useSelector((state: AppState) => state.main);

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(createWeb3(chain));
    }, []);

    return web3 ? (
        <App />
    ) : (
        <div className="loading"  style={{ display: 'flex', alignItems: 'center', justifyContent:'center', height: '100vh', fontSize: 20 }}>
            Loading...
        </div>
    );
}

export default AppWrapper;
