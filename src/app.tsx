import React, { useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { useDispatch, useSelector } from 'react-redux';
import { getGuardiansAction} from './redux/actions/actions';
import { RootRouter } from './routes';
import './scss/app.scss';
import { AppState } from './redux/types/types';
import { ReadProgressBar } from './components/read-progress-bar/read-progress-bar';


const App = () => {
    const dispatch = useDispatch();
    const { chain } = useSelector((state: AppState) => state.main);

    useEffect(() => {
        dispatch(getGuardiansAction(chain));
    }, []);

   

    return (
        <div className={`app ${isMobile ? '' : 'flex-between'}`}>
            <ReadProgressBar />
            <RootRouter chain={chain} />
        </div>
    );
};

export default App;
