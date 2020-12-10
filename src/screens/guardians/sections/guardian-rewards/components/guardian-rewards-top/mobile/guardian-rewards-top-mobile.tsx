import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/types/types';
import { NoData } from 'components/no-data/no-data';
import { AlreadyClaimed } from './components/AlreadyClaimed';
import { Total } from './components/Total';
import { CurrectBalance } from './components/CurrectBalance';
import { SubSectionSelector } from '../../../../../../../components/sub-section-selector/sub-section-selector';
import { GuardiansRewardsSection } from 'global/enums';
import './style.scss';

export const GuardianRewardsTopMobile = () => {
    const [selectedSection, SetSelectedSection] = useState<GuardiansRewardsSection>(GuardiansRewardsSection.CLAIMED);
    const { selectedGuardian, guardianIsLoading } = useSelector((state: AppState) => state.guardians);
    const { t } = useTranslation();

    const generateSection = (section: GuardiansRewardsSection) => {
        const params = {
            selectedGuardian,
            guardianIsLoading,
        };
        
        switch (section) {
            case GuardiansRewardsSection.CLAIMED:
                return <AlreadyClaimed {...params} />;
            case GuardiansRewardsSection.CURRENT:
                return <CurrectBalance {...params} />;
            case GuardiansRewardsSection.TOTAL:
                return <Total {...params} />;

            default:
                break;
        }
    };
    const options = [
        {
            name: t('main.alreadyClaimed'),
            value: GuardiansRewardsSection.CLAIMED
        },
        {
            name: t('main.currentBalance'),
            value: GuardiansRewardsSection.CURRENT
        },
        {
            name: `${t('main.totalClaimed')} (${t('main.untilNow')})`,
            value: GuardiansRewardsSection.TOTAL
        }
    ];
    const noData = !guardianIsLoading && !selectedGuardian;
    return noData ? (
        <NoData />
    ) : (
        <div className="g-rewards-top-m">
            <SubSectionSelector options={options} select={SetSelectedSection} selectedValue={selectedSection} />
            <div className="g-rewards-top-m-sections flex-start">{generateSection(selectedSection)}</div>
            {/* <Reward
                current={selectedGuardian?.reward_status.guardian_rewards_balance}
                claimed={selectedGuardian?.reward_status.guardian_rewards_claimed}
                total={selectedGuardian?.reward_status.total_guardian_rewards}
                img={TrophyImg}
                token={OrbsToken}
                title={t('guardians.guardianRewards')}
                isLoading={guardianIsLoading}
            />
            <Reward
                current={selectedGuardian?.reward_status.delegator_rewards_balance}
                claimed={selectedGuardian?.reward_status.delegator_rewards_claimed}
                total={selectedGuardian?.reward_status.total_delegator_rewards}
                img={TrophyImg}
                token={OrbsToken}
                title={t('guardians.selfStakeReward')}
                isLoading={guardianIsLoading}
            />
            <Reward
                current={selectedGuardian?.reward_status.bootstrap_balance}
                claimed={selectedGuardian?.reward_status.bootstrap_claimed}
                total={selectedGuardian?.reward_status.total_bootstrap}
                img={CommitteeImg}
                token={BoostrapToken}
                title={t('guardians.certifiedCommittee')}
                isLoading={guardianIsLoading}
            />
            <Reward
                current={selectedGuardian?.reward_status.fees_balance}
                claimed={selectedGuardian?.reward_status.fees_claimed}
                total={selectedGuardian?.reward_status.total_fees}
                img={FeesImg}
                token={OrbsToken}
                title={t('guardians.applicationFees')}
                isLoading={guardianIsLoading}
            /> */}
        </div>
    );
};
