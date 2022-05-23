import React, { useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { useDispatch, useSelector } from 'react-redux';
import { getGuardiansAction, setChain, setLatestBlockRef } from './redux/actions/actions';
import { RootRouter } from './routes';
import './scss/app.scss';
import { AppState } from './redux/types/types';
import { getRefBlocks } from '@orbs-network/pos-analytics-lib/dist/eth-helpers';


const App = () => {
    const dispatch = useDispatch();
    const { chain, web3 } = useSelector((state: AppState) => state.main);

    useEffect(() => {
        dispatch(getGuardiansAction(chain));
        dispatch(setChain(chain));
        getBlockRef()
    }, []);

    const getBlockRef = async() =>{
        const result = await getRefBlocks([web3])
        dispatch(setLatestBlockRef(result))
    }

    return (
        <div className={`app ${isMobile ? '' : 'flex-between'}`}>
            <RootRouter chain={chain} />
        </div>
    );
};

export default App;
