import React from 'react';
import { isMobile } from 'react-device-detect';
import { DelegatorStakeChart } from './components/delegator-stake-chart/delegator-stake-chart';
import { DelegatorsStakeBalance } from './components/delegators-stake-balance/delegators-stake-balance';

import './delegators-stake.scss';

export const DelegatorsStake = () => {
  return (
    <div className={`delegators-stake${isMobile ? '-flex flex-start' : ''}`}>
      <DelegatorsStakeBalance />
      <DelegatorStakeChart />
    </div>
  );
};
