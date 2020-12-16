import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/types/types';
import { NoData } from 'components/no-data/no-data';
import { AlreadyClaimed } from './components/AlreadyClaimed';
import { Total } from './components/Total';
import { CurrectBalance } from './components/CurrectBalance';
import { SubSectionSelector } from '../../../../../../../components/sub-section-selector/sub-section-selector';
import { RewardsSection } from 'global/enums';
import './style.scss';

export const GuardianRewardsTopMobile = () => {
    const [selectedSection, SetSelectedSection] = useState<RewardsSection>(RewardsSection.CURRENT);
    const { selectedGuardian, guardianIsLoading } = useSelector((state: AppState) => state.guardians);
    const { t } = useTranslation();

    const generateSection = (section: RewardsSection) => {
        const params = {
            selectedGuardian,
            guardianIsLoading,
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
    const noData = !guardianIsLoading && !selectedGuardian;
    return noData ? (
        <NoData />
    ) : (
        <div className="g-rewards-top-m">
            <SubSectionSelector options={options} select={SetSelectedSection} selectedValue={selectedSection} />
            <div className="g-rewards-top-m-sections flex-start">{generateSection(selectedSection)}</div>
        </div>
    );
};
