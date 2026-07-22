import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getGuardiansAction} from './redux/actions/actions';
import { RootRouter } from './routes';
import './scss/app.scss';
import { AppState } from './redux/types/types';
import { useViewportMode } from './hooks/useViewport';


const App = () => {
    const dispatch = useDispatch();
    const { chain } = useSelector((state: AppState) => state.main);
    const viewportMode = useViewportMode();

    useEffect(() => {
        dispatch(getGuardiansAction(chain));
    }, []);

   

    return (
        <div className={`app app--${viewportMode}`} data-viewport-mode={viewportMode}>
            <RootRouter chain={chain} />
        </div>
    );
};

export default App;
