import React from 'react';
import { GuardianDelegator } from 'pos-analytics-graph';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/types/types';
import { NoData } from 'components/no-data/no-data';
import './guardian-delegators.scss';
import { GuardianDelegatorElement } from './components/guardian-delegator/guardian-delegator';
import { useTranslation } from 'react-i18next';
import { ListMaterial } from 'components/list/list-material';
import { useIsMobileViewport } from 'hooks/useViewport';

export const GuardianDelegators = () => {
  const isMobile = useIsMobileViewport();
  const { selectedGuardian, guardianIsLoading } = useSelector(
    (state: AppState) => state.guardians
  );
  const { t } = useTranslation();
  const titles = [
    isMobile ? t('main.address') : t('guardians.delegatorsAddress'),
    t('guardians.stake'),
    t('guardians.nonStakedBalance'),
  ];

  const noData = !guardianIsLoading && !selectedGuardian;

  return noData ? (
    <NoData />
  ) : (
    <div className="guardian-delegators-list">
      <ListMaterial
        titles={titles}
        titleClassName="list-titles"
        listClassName="guardian-delegators-table"
        listHeaderBg="#F7F7F7"
        isLoading={guardianIsLoading}
        loadingRows={5}
      >
        {selectedGuardian &&
          selectedGuardian.delegators.map((delegator: GuardianDelegator) => {
            return (
              <GuardianDelegatorElement
                delegator={delegator}
                key={delegator.address}
              />
            );
          })}
      </ListMaterial>
    </div>
  );
};
