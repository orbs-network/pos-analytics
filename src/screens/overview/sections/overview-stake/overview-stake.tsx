import React from 'react';
import { StakeBarChart } from './components/stake-bar-chart/skate-bar-chart';
import { MobileStakeChart } from './components/mobile-stake-chart/mobile-stake-chart';
import './overview-stake.scss';
import { isMobile } from 'react-device-detect';

export const OverviewStake = () => {
  return (
    <div className="overview-chart">
      {isMobile ? <MobileStakeChart /> : <StakeBarChart />}
    </div>
  );
};
