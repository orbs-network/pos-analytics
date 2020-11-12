import React from 'react';
import { GuardianStakeBalance } from './components/guardian-stake-balance/guardian-stake-balance';
import { GuardianStakeChart } from './components/guardian-stake-chart/guardian-stake-chart';
import { GuardianStakeLegend } from './components/guardian-stake-legend/guardian-stake-legend';
import './guardians-stake.scss';

export const GuardiansStake = () => {

    return (
        <div className="guardian-stake flex-column">
            <GuardianStakeBalance />
           <div className='guardian-stake-flex flex-start'>
           <GuardianStakeChart />
            <GuardianStakeLegend />
           </div>
        </div>
    );
};
