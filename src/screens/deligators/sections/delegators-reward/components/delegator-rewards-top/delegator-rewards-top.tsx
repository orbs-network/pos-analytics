import React from 'react';
import {isMobile} from 'react-device-detect'
import {DelegatorRewardsTopMobile} from './mobile/delegator-rewards-top-mobile';
import {DelegatorRewardsTopDesktop} from './desktop/delegator-rewards-top-desktop'
import './delegator-rewards-top.scss';

export const DelegatorRewardsTop = () => {

    return (
        isMobile ? <DelegatorRewardsTopMobile /> : <DelegatorRewardsTopDesktop />
    )
};
