import React, { useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { ChartColors } from 'global/enums';
import { ChartData } from 'global/types';
import { generateDatasets, getGuardiansLineChartSettings } from 'utils/chart';

interface StateProps {
    chartData: ChartData;
}

export const Chart = ({ chartData }: StateProps) => {
 const ref = useRef<any>(null)
    const { t } = useTranslation();
    const data = {
        datasets: generateDatasets(chartData)
    };


    const options = getGuardiansLineChartSettings(chartData.unit,ref, t);
    return options ? (
        <div className="line-chart">
            <div className="line-chart-text line-chart-text-left">
                <p className="one-line" style={{ color: ChartColors.DELEGATORS }}>
                    {t('guardians.delegators')}
                </p>
            </div>
            <Line data={data} options={options} ref = {ref} />
            <div className="line-chart-text line-chart-text-right flex-center">
                <p className="one-line" style={{ color: ChartColors.TOTAL_STAKE }}>
                    {`${t('guardians.totalDelegation')}`}
                </p>
                <small>{`&`}</small>
                <p className="one-line" style={{ color: ChartColors.SELF_STAKE }}>{`${t('guardians.ownDelegation')}`}</p>
            </div>
        </div>
    ) : null;
};
