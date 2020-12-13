import { BalanceSection } from 'components/balance-section/balance-section';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { convertToString } from 'utils/number';
import { DelegatorMobileRewards } from 'global/types';
import trophy from 'assets/images/trophy.svg';

export const Total = ({ selectedDelegator, delegatorIsLoading }: DelegatorMobileRewards) => {
    const { t } = useTranslation();
    return (
        <>
            <BalanceSection
                data={convertToString(selectedDelegator?.total_rewards)}
                isLoading={delegatorIsLoading}
                text={t('main.rewards')}
                titleImg={trophy}
            />
        </>
    );
};
