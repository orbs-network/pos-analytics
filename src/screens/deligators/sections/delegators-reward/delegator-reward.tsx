import React from 'react'
import { DelegatorRewardsActions } from './components/delegator-rewards-actions/delegator-rewards-actions';
import { DelegatorRewardsTop } from './components/delegator-rewards-top/delegator-rewards-top';

export const DelegatorReward = () =>  {
    return (
      <div className='delegator-rewards'>
            <DelegatorRewardsTop />
            <DelegatorRewardsActions />
        </div> 
    )
}

