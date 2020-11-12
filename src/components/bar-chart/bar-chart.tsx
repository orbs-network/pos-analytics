import React, { useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { Guardian } from '@orbs-network/pos-analytics-lib';
import { getGuardianByName } from '../../utils/guardians';
import { useHistory } from 'react-router-dom';
import { routes } from '../../routes/routes';
import { useTranslation } from 'react-i18next';
import {  getBarChartConfigOptions } from '../../utils/bar-chart';
import './bar-chart.scss';
import { OverviewChartType } from '../../global/enums';

interface StateProps {
    chartData: any;
    guardians?: Guardian[];
    total?: number;
    chartType: OverviewChartType;
}

export const BarChartComponent = ({ chartData, guardians, total, chartType }: StateProps) => {
    const history = useHistory();
    const ref = useRef<any>(null);
    const { t } = useTranslation();

    var barChartData = {
        datasets: chartData.data
    };

    const goToGuardianPage = async (i: any, elem?: any) => {
        var activeElement = ref.current.chartInstance.getElementAtEvent(i);
        if (!activeElement[0]) return;
        const name = activeElement[0]._view.datasetLabel;
        const address = getGuardianByName(guardians, name);
        if (!address) return;
        await ref.current.chartInstance.clear();
        history.push(routes.guardians.stake.replace(':address', address));
    };
    
    const options = getBarChartConfigOptions(chartType, goToGuardianPage, ref, t, chartData.unit, total);
    return <Bar data={barChartData} options={options} ref={ref} />;
};
