import { DelegatorAction, DelegatorInfo } from 'pos-analytics-graph';
import { TFunction } from 'i18next';
import { ChartColors, ChartUnit, ChartYaxis, DelegatorActionsTypes, DelegatorsSections } from '../global/enums';
import { ChartData, MenuOption } from '../global/types';
import { routes } from '../routes/routes';
import moment from 'moment';
import { convertToString } from './number';
import { chartDatasetObjectComparer } from './chart';
import { getDelegatorHistoryRange } from './delegator-history-range';
export const generateDelegatorsRoutes = (t: TFunction, address: string): MenuOption[] => {
    return [
        {
            name: t('main.stake'),
            route: routes.delegators.stake.replace(':address', address),
            key: DelegatorsSections.STAKE
        },
        // {
        //     name: t('main.rewards'),
        //     route: routes.delegators.rewards.replace(':address', address),
        //     key: DelegatorsSections.REWARDS
        // },
        // {
        //     name: t('main.actions'),
        //     route: routes.delegators.actions.replace(':address', address),
        //     key: DelegatorsSections.ACTIONS
        // }
    ];
};

export const checkIfLoadDeligator = (address?: string, delegator?: DelegatorInfo): boolean => {
    if (!address) return false;
    if (!delegator) return true;
    if (delegator.address.toLowerCase() === address.toLowerCase()) return false;
    return true;
};

export const getDelegatorChartData = (unit: ChartUnit, { stake_slices }: DelegatorInfo): ChartData => {
    const points = stake_slices
        .map((m) => {
            return {
                x: moment.unix(m.block_time).valueOf(),
                y: m.stake
            };
        })
        .sort(chartDatasetObjectComparer);

    const dataset = {
        data: points,
        color: ChartColors.TOTAL_STAKE,
        yAxis: ChartYaxis.Y1
    };
    return {
        datasets: [dataset],
        unit
    };
};

export const generateDelegatorsActionColors = (event: DelegatorActionsTypes) => {
    switch (event) {
        case DelegatorActionsTypes.STAKED:
        case DelegatorActionsTypes.RESTAKED:
            return 'green';
        case DelegatorActionsTypes.UNSTAKED:
        case DelegatorActionsTypes.WITHDREW:
            return 'red';
        case DelegatorActionsTypes.CLAIMED:
            return 'black';
        default:
            break;
    }
};

export const generateDelegatorsCurrentStake = (event: DelegatorActionsTypes, currentStake?: number) => {
    switch (event) {
        case DelegatorActionsTypes.STAKED:
        case DelegatorActionsTypes.RESTAKED:
        case DelegatorActionsTypes.UNSTAKED:
        case DelegatorActionsTypes.WITHDREW:
            return convertToString(currentStake, '0');
        default:
            return convertToString(currentStake, '-');
    }
};

export const generateDelegatorChartData = (unit: ChartUnit, selectedDelegator?: DelegatorInfo): ChartData | undefined => {
    if (!selectedDelegator) return;
    return getDelegatorChartData(unit, selectedDelegator);
};

export const getMinDateByUnit = (unit: ChartUnit): Date => {
    return new Date(getDelegatorHistoryRange(unit).fromTime * 1000);
};

export const getDelegatorRewardActions = (actions?: DelegatorAction[]) => {
    if (!actions) return [];
    return actions.filter((action: DelegatorAction) => action.event === DelegatorActionsTypes.CLAIMED);
};
