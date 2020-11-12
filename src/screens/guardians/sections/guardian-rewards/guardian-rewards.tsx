import React from 'react'
import { GuardianRewardsActions } from './components/guardian-rewards-actions/guardian-rewards-actions'
import { GuardianRewardsTop } from './components/guardian-rewards-top/guardian-rewards-top'
import  './guardian-rewards.scss';

export const GuardianRewards = () =>  {
    return (
        <div className='guardian-rewards'>
            <GuardianRewardsTop />
            <GuardianRewardsActions />
        </div>
    )
}

