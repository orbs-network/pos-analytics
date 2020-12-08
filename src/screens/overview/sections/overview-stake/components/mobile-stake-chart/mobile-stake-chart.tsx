import React, { useEffect, useRef, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { PosOverviewData } from '@orbs-network/pos-analytics-lib';
import { generateDoghnutDataset, getDoughnutChartData } from 'utils/overview/doghnut-chart';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/types/types';
import moment from 'moment';
import { LoadingComponent } from 'components/loading-component/loading-component';
import { LoaderType } from 'global/enums';
import { convertToString } from 'utils/number';
import { DaysSelector } from './parts/days-selector/days-selector';
import './mobile-stake-chart.scss';
import { useHistory } from 'react-router-dom';
import { routes } from 'routes/routes';

export const MobileStakeChart = () => {
    const ref = useRef<any>(null);
    const history = useHistory();
    const { guardiansColors } = useSelector((state: AppState) => state.guardians);
    const { overviewData } = useSelector((state: AppState) => state.overview);
    const [rawData, setRawData] = useState<PosOverviewData[] | null>(null);
    const [selected, setSelected] = useState<null | PosOverviewData>(null);
    useEffect(() => {
        createChartDataset(moment().toDate());
    }, []);

    const createChartDataset = (date: Date) => {
        const newRawData = getDoughnutChartData(date, overviewData);
        if (!newRawData) return;
        setRawData(newRawData);
        setSelected(null);
    };

    const selectGuardian = (i: any) => {
        const activeElement = ref.current.chartInstance.getElementAtEvent(i);
        if (!activeElement[0]) return;
        // eslint-disable-next-line no-underscore-dangle
        const name = activeElement[0]._view.label;
        if (!rawData) return;
        const guardian = rawData.filter((m: PosOverviewData) => m.name === name)[0];
        setSelected(guardian);
    };

    const goToGuardian = () => {
        if (!selected) return;
        history.push(routes.guardians.stake.replace(':address', selected.address));
    };

    const options = {
        maintainAspectRatio: false,
        responsive: true,
        tooltips: {
            enabled: false
        },
        legend: {
            display: false
        },
        cutoutPercentage: 70,
        onClick: (e: any) => selectGuardian(e)
    };

    const selectDate = (date: Date) => {
        createChartDataset(date);
    };
    const chartData = generateDoghnutDataset(rawData, guardiansColors);
    return (
        <div className="mobile-stake-chart">
            <LoadingComponent isLoading={!chartData} loaderType={LoaderType.BIG}>
                <div className="mobile-stake-chart-title flex-center" >
                    <h5 className="mobile-stake-chart-title-name">Overall stats</h5>
                    <DaysSelector selectDate={selectDate} />
                </div>
                <div className="mobile-stake-chart-chart">
                    <Doughnut data={chartData} ref={ref} options={options} />
                    {selected && (
                        <section className="mobile-stake-chart-selected" onClick={() => goToGuardian()}>
                            <p className="text-overflow">{selected?.name}</p>
                            <h5>{convertToString(selected?.effective_stake)}</h5>
                        </section>
                    )}
                </div>
            </LoadingComponent>
        </div>
    );
};
