import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { TimeRangeSelector } from 'components/date-format-picker/time-range-selector';
import { LoadingComponent } from 'components/loading-component/loading-component';
import { ChartUnit, LoaderType } from 'global/enums';
import { loadDelegatorStakeHistoryAction } from 'redux/actions/actions';
import { AppState } from 'redux/types/types';
import { Chart } from './chart';
import { NoData } from 'components/no-data/no-data';
import './delegator-stake-chart.scss';



export const DelegatorStakeChart = () => {
    const dispatch = useDispatch();
    const {
        selectedDelegator,
        delegatorIsLoading,
        delegatorChartData,
        delegatorHistoryIsLoading,
        delegatorHistoryError
    } = useSelector(
        (state: AppState) => state.delegator
    );
    const { t } = useTranslation();
    const selectedAddress = selectedDelegator && selectedDelegator.address;
    const selectedBlock = selectedDelegator && selectedDelegator.block_number;
    useEffect(() => {
        if (!selectedAddress) return;
        dispatch(loadDelegatorStakeHistoryAction(ChartUnit.WEEK));
    }, [dispatch, selectedAddress, selectedBlock]);

    const selectChartData = (unit: ChartUnit) => {
        dispatch(loadDelegatorStakeHistoryAction(unit));
    };
    const noData = !delegatorIsLoading && !selectedDelegator
    return (
        noData ? null : <div className="delegator-stake-chart">
            <LoadingComponent
                loaderType={LoaderType.BIG}
                isLoading={delegatorIsLoading || delegatorHistoryIsLoading}
            >
                {selectedDelegator ? (
                    <>
                        <header className="flex-between">
                            <h4>{t('delegators.stakeChangeOverTime')}</h4>
                            <TimeRangeSelector
                                selected={delegatorChartData ? delegatorChartData.unit : ChartUnit.WEEK}
                                selectCallBack={selectChartData}
                            />
                        </header>
                        {delegatorChartData ? (
                            <div className="line-chart">
                                <Chart chartData={delegatorChartData} />
                            </div>
                        ) : delegatorHistoryError ? (
                            <NoData />
                        ) : null}
                    </>
                ) : null}
            </LoadingComponent>
        </div>
    );
};
