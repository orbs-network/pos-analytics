import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { LoadingComponent } from 'components/loading-component/loading-component';
import { AddressCopyButton } from 'components/address-copy-button/address-copy-button';
import { LoaderType } from 'global/enums';
import { AppState } from 'redux/types/types';
import './guardian-info.scss';

interface StateProps {
    showInfo: boolean;
}

export const GuardianInfo = ({ showInfo }: StateProps) => {
    const { selectedGuardian, guardianIsLoading } = useSelector((state: AppState) => state.guardians);
    const { t } = useTranslation();

    const website = selectedGuardian?.details.website;
    const detailsUrl = selectedGuardian?.details.details_URL;
    const ip = selectedGuardian?.details.ip;
    const nodeAddress = selectedGuardian?.details.node_address;
    const className = !showInfo ? 'guardian-info-hide guardian-info' : 'guardian-info';
    return (
        <div className={className}>
            <section className="guardian-info-item">
                <h5 className="guardian-info-title">{t('guardians.guardianWebsite')}</h5>
                <LoadingComponent isLoading={guardianIsLoading} loaderType={LoaderType.TEXT}>
                    {website ? (
                        <a href={`${website}`} target="_blank" rel="noopener noreferrer">
                            <p>{website}</p>
                        </a>
                    ) : (
                        <p>-</p>
                    )}
                </LoadingComponent>
            </section>
            <section className="guardian-info-item">
                <h5 className="guardian-info-title">{t('guardians.guardianDetailsUrl')}</h5>
                <LoadingComponent isLoading={guardianIsLoading} loaderType={LoaderType.TEXT}>
                    {detailsUrl ? (
                        <a href={detailsUrl} target="_blank" rel="noopener noreferrer">
                            <p>{detailsUrl}</p>
                        </a>
                    ) : (
                        <p>-</p>
                    )}
                </LoadingComponent>
            </section>
            <section className="guardian-info-item">
                <h5 className="guardian-info-title">{t('guardians.nodeIP')}</h5>
                <LoadingComponent isLoading={guardianIsLoading} loaderType={LoaderType.TEXT}>
                    <p>{ip || '-'}</p>
                </LoadingComponent>
            </section>
            <section className="guardian-info-item">
                <h5 className="guardian-info-title">{t('guardians.nodeAddress')}</h5>
                <LoadingComponent isLoading={guardianIsLoading} loaderType={LoaderType.TEXT}>
                    {nodeAddress ? (
                        <div className="guardian-info-address flex-start-center">
                            <p>{nodeAddress}</p>
                            <AddressCopyButton address={nodeAddress} subject="node" />
                        </div>
                    ) : (
                        <p>-</p>
                    )}
                </LoadingComponent>
            </section>
        </div>
    );
};
