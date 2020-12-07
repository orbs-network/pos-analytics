import React, { FunctionComponent as Component, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { useDispatch } from 'react-redux';
import { getGuardiansAction, getOverviewAction } from './redux/actions/actions';
import { RootRouter } from './routes';
import './scss/app.scss';

const App: Component = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getGuardiansAction());
  }, []);

  return (
    <div className={`app ${isMobile ? '' : 'flex-between'}`}>
      <RootRouter />
    </div>
  );
};

export default App;
