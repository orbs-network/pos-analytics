import React, { useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { useDispatch, useSelector } from 'react-redux';
import { getGuardiansAction} from './redux/actions/actions';
import { RootRouter } from './routes';
import './scss/app.scss';
import { AppState } from './redux/types/types';


const App = () => {
    const dispatch = useDispatch();
    const { chain } = useSelector((state: AppState) => state.main);

    useEffect(() => {
        dispatch(getGuardiansAction(chain));
    }, []);

   

    return (
        <div className={`app ${isMobile ? '' : 'flex-between'}`}>
            <RootRouter chain={chain} />
        </div>
    );
};

export default App;
