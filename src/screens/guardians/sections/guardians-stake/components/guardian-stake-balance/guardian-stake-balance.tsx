import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/types/types';
import { convertToString, toPercent } from 'utils/number';
import { useTranslation } from 'react-i18next';
import { BalanceSection } from 'components/balance-section/balance-section';
import { NoData } from 'components/no-data/no-data';
import './guardian-stake-balance.scss';

export const GuardianStakeBalance = () => {
    const { selectedGuardian, guardianIsLoading } = useSelector((state: AppState) => state.guardians);
    const { t } = useTranslation();
    const noData = !guardianIsLoading && !selectedGuardian;
    return noData ? (
        <NoData />
    ) : (
        <section className="guardian-stake-balance flex-start">
            <BalanceSection
                data={convertToString(selectedGuardian?.stake_status.total_stake)}
                isLoading={guardianIsLoading}
                text={t('main.stake')}
            />
            <BalanceSection
                data={convertToString(selectedGuardian?.stake_status.self_stake)}
                isLoading={guardianIsLoading}
                text={t('guardians.selfStake')}
            />
            <BalanceSection
                data={convertToString(selectedGuardian?.stake_status.cooldown_stake)}
                isLoading={guardianIsLoading}
                text={t('guardians.cooldown')}
            />
            <BalanceSection
                data={convertToString(selectedGuardian?.stake_status.non_stake)}
                isLoading={guardianIsLoading}
                text={t('guardians.nonStakedBalance')}
            />
            <BalanceSection
                data={toPercent(selectedGuardian?.reward_status.delegator_reward_share)}
                isLoading={guardianIsLoading}
                text={t('guardians.delegatorRewardShare')}
                hideImg
            />
        </section>
    );
};
