import React, { useEffect, useRef, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { PosOverviewData } from '@orbs-network/pos-analytics-lib';
import { generateDoghnutDataset, getDoughnutChartData } from 'utils/overview/doghnut-chart';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/types/types';
import moment from 'moment';
import { LoadingComponent } from 'components/loading-component/loading-component';
import { LoaderType } from 'global/enums';
import { DaysSelector } from './parts/days-selector/days-selector';
import { SelectedGuardian } from './parts/selected-guardian/selected-guardian';
import './mobile-stake-chart.scss';

export const MobileStakeChart = () => {
    const ref = useRef<any>(null);
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

    const chartData = generateDoghnutDataset(rawData, guardiansColors);
    return (
        <div className="mobile-stake-chart">
            <LoadingComponent isLoading={!chartData} loaderType={LoaderType.BIG}>
                <div className="mobile-stake-chart-title flex-center">
                    <h5 className="mobile-stake-chart-title-name">Overall stats</h5>
                    <DaysSelector selectDate={createChartDataset} />
                </div>
                <div className="mobile-stake-chart-chart">
                    <Doughnut data={chartData} ref={ref} options={options} />
                    <SelectedGuardian selected={selected} />
                </div>
            </LoadingComponent>
        </div>
    );
};
