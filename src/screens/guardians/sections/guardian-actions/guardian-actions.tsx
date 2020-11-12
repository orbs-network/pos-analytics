import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/types/types';
import moment from 'moment';
import { GuardianAction } from '@orbs-network/pos-analytics-lib';
import { NoData } from 'components/no-data/no-data';
import { useTranslation } from 'react-i18next';
import { GuardianActionComponent } from './guardian-action';
import { ListMaterial } from 'components/list/list-material';
import { LoadingComponent } from 'components/loading-component/loading-component';
import { LoaderType } from 'global/enums';
import './guardian-actions.scss';

export const GuardianActions = () => {
    const { selectedGuardian, guardianIsLoading } = useSelector((state: AppState) => state.guardians);
    const { t } = useTranslation();
    const titles = [
        t('main.action'),
        t('main.amount'),
        t('guardians.currentStake'),
        `${t('main.block')} #`,
        `${t('main.time')} (${t('main.gmt')}+${moment(moment().utcOffset()).format('H')})`
    ];

    const noData = !selectedGuardian && !guardianIsLoading;
    return noData ? (
        <NoData />
    ) : (
        <div className="guardian-actions">
            <LoadingComponent isLoading={guardianIsLoading} listElementAmount={5} loaderType={LoaderType.LIST}>
                <ListMaterial titles={titles} titleClassName="list-titles" listHeaderBg="#F7F7F7">
                    {selectedGuardian &&
                        selectedGuardian.actions.map((action: GuardianAction, key: number) => {
                            return <GuardianActionComponent action={action} key={key} />;
                        })}
                </ListMaterial>
            </LoadingComponent>
        </div>
    );
};
