import React from 'react'
import {OverviewWeightChart} from './components/weight-chart/weight-chart'
import {MobileWeightChart} from './components/mobile-weight-chart/mobile-weight-chart';

export const  OverviewWeights = () =>  {
    const isMobile = true
    return (
        <div>
            {isMobile ? <MobileWeightChart /> : <OverviewWeightChart /> }
        </div>
    )
}

