import { NoData } from 'components/no-data/no-data';
import { SubSectionSelector } from 'components/sub-section-selector/sub-section-selector';
import { RewardsSection } from 'global/enums';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/types/types';
import { AlreadyClaimed } from './components/AlreadyClaimed';
import {Total} from './components/Total'
import {CurrectBalance} from './components/CurrectBalance'
import './style.scss';

export const DelegatorRewardsTopMobile = () => {
    const [selectedSection, SetSelectedSection] = useState<RewardsSection>(RewardsSection.CURRENT);
    const { selectedDelegator, delegatorIsLoading } = useSelector((state: AppState) => state.delegator);
    const { t } = useTranslation();

    const generateSection = (section: RewardsSection) => {
        const params = {
            selectedDelegator,
            delegatorIsLoading
        };

        switch (section) {
            case RewardsSection.CLAIMED:
                return <AlreadyClaimed {...params} />;
            case RewardsSection.CURRENT:
                return <CurrectBalance {...params} />;
            case RewardsSection.TOTAL:
                return <Total {...params} />;

            default:
                break;
        }
    };
    const options = [
      
        {
            name: t('main.currentBalance'),
            value: RewardsSection.CURRENT
        },
        {
            name: t('main.alreadyClaimed'),
            value: RewardsSection.CLAIMED
        },
        {
            name: `${t('main.totalClaimed')} (${t('main.untilNow')})`,
            value: RewardsSection.TOTAL
        }
    ];
    const noData = !delegatorIsLoading && !selectedDelegator;
    return noData ? (
        <NoData />
    ) : (
        <div className="d-rewards-top-m">
            <SubSectionSelector options={options} select={SetSelectedSection} selectedValue={selectedSection} />
            <div className="d-rewards-top-m-sections flex-start">{generateSection(selectedSection)}</div>
        </div>
    );
};
