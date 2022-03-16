import React, { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useDispatch } from 'react-redux';
import { getGuardiansAction, setChain } from './redux/actions/actions';
import { RootRouter } from './routes';
import { getRouterBaseName } from './utils/router';
import './scss/app.scss';

const chain = getRouterBaseName();

const App = () => {
    const dispatch = useDispatch();
    const [appLoaded, setAppLoaded] = useState(false)
    useEffect(() => {      
        dispatch(getGuardiansAction(chain));
        dispatch(setChain(chain))
        setAppLoaded(true)
    }, []);

    return (
        <div className={`app ${isMobile ? '' : 'flex-between'}`}>
           {appLoaded &&  <RootRouter chain={chain} />}
        </div>
    );
};

export default App;
