import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/types/types';
import moment from 'moment';
import { DelegatorAction } from '@orbs-network/pos-analytics-lib';
import { DelegatorActionElement } from './components/delegator-action';
import { NoData } from 'components/no-data/no-data';
import { useTranslation } from 'react-i18next';
import { ListMaterial } from 'components/list/list-material';
import { LoadingComponent } from 'components/loading-component/loading-component';
import { LoaderType } from 'global/enums';
import './delegators-actions.scss';

export const DeligatorsActions = () => {
    const { selectedDelegator, delegatorIsLoading } = useSelector((state: AppState) => state.delegator);
    const { t } = useTranslation();
    const titles = [
        t('main.action'),
        t('main.amount'),
        t('main.currentStake'),
        `${t('main.block')} #`,
        `${t('main.time')} (${t('main.gmt')}+${moment(moment().utcOffset()).format('H')})`
    ];

    const noData = !delegatorIsLoading && !selectedDelegator;
    return noData ? (
        <NoData />
    ) : (
        <div className="delegators-actions">
              <LoadingComponent isLoading={delegatorIsLoading} listElementAmount={5} loaderType={LoaderType.LIST}>
                <ListMaterial titles={titles} titleClassName="list-titles" listHeaderBg="#F7F7F7">
                    {selectedDelegator && selectedDelegator.actions.map((action: DelegatorAction, key: number) => {
                            return <DelegatorActionElement action={action} key={key} />;
                        })}
                </ListMaterial>
            </LoadingComponent>
        </div>
    );
};
