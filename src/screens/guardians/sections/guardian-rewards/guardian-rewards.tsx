import React from 'react'
import { GuardianRewardsActions } from './components/guardian-rewards-actions/guardian-rewards-actions'
import {GuardianRewardsTopDesktop} from './components/guardian-rewards-top/desktop/guardian-rewards-top-desktop'
import {GuardianRewardsTopMobile} from './components/guardian-rewards-top/mobile/guardian-rewards-top-mobile'

import { isMobile } from 'react-device-detect';

import  './guardian-rewards.scss';

export const GuardianRewards = () =>  {
    return (
        <div className='guardian-rewards'>
            {isMobile  ?  <GuardianRewardsTopMobile /> : <GuardianRewardsTopDesktop />}
            <GuardianRewardsActions />
        </div>
    )
}

