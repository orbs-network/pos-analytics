import React from 'react';
import { OverviewWeightChart } from './components/weight-chart/weight-chart';
import { MobileWeightChart } from './components/mobile-weight-chart/mobile-weight-chart';
import { isMobile } from 'react-device-detect';

export const OverviewWeights = () => {
  return (
    <div className="overview-chart">
      {isMobile ? <MobileWeightChart /> : <OverviewWeightChart />}
    </div>
  );
};
