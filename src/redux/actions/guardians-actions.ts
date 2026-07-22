import { Guardian } from 'pos-analytics-graph';
import { BlockRef } from 'redux/types/main-types';
import { CHAINS } from 'types';
import { getChainConfig } from 'utils/chain';
import { getGuardianColor } from 'utils/overview/overview';
import { ChartData } from '../../global/types';
import { api } from '../../services/api';
import { types } from '../types/types';
import { getAvgBlockTime, getRefBlock } from './utils';

let guardianRequestSequence = 0;

const nextGuardianRequestId = (): string => {
    guardianRequestSequence += 1;
    return `guardian-${guardianRequestSequence}`;
};

const isActiveGuardianRequest = (getState: any, requestId: string): boolean =>
    getState().guardians.activeGuardianRequestId === requestId;

export const getGuardianAction = (address: string, web3: any, blockRef: BlockRef) => async (
    dispatch: any,
    getState: any
) => {
    const requestId = nextGuardianRequestId();
    dispatch(resetguardian(requestId));

    try {
        const guardian = await api.getGuardianApi(address, web3, blockRef);
        if (!isActiveGuardianRequest(getState, requestId)) return;
        if (!guardian) {
            dispatch(setGuardianNotFound(true, requestId));
            return;
        }

        const actions = guardian.actions || [];
        let actionsWithTimes = actions;
        if (actions.length > 0) {
            // get reference block for calculating estimated block time
            const refBlock = await getRefBlock(web3, actions[0].block_number);
            if (!isActiveGuardianRequest(getState, requestId)) return;
            const avgBlockTime = await getAvgBlockTime(web3, refBlock);
            if (!isActiveGuardianRequest(getState, requestId)) return;

            actionsWithTimes = actions.map((action: any) => {
                return {
                    ...action,
                    block_time: refBlock.time + Math.round((action.block_number - refBlock.number) * avgBlockTime)
                };
            });
        }
        const guardianWithActionTimes = {
            ...guardian,
            actions: actionsWithTimes
        };

        dispatch({
            type: types.GUARDIAN.SET_GUARDIAN,
            payload: guardianWithActionTimes,
            meta: { requestId }
        });
    } catch (_error) {
        if (!isActiveGuardianRequest(getState, requestId)) return;
        dispatch(setGuardianNotFound(true, requestId));
    }
};

export const getGuardiansAction = (chain: CHAINS) => async (dispatch: any) => {
    const { node } = getChainConfig(chain);
    const guardians = await api.getGuardiansApi(node);
    if (!guardians) return null;
    const guardiansColors: { [id: string]: string } = {};
    guardians
        .sort((a, b) => b.effective_stake - a.effective_stake)
        .forEach((guardian: Guardian, index: number) => {
            guardiansColors[guardian.address] = getGuardianColor(index);
        });
    return dispatch({
        type: types.GUARDIAN.SET_GUARDIANS,
        payload: { guardians, guardiansColors }
    });
};

export const setGuardianLoading = (value: boolean, requestId?: string) => async (dispatch: any) => {
    return dispatch({
        type: types.GUARDIAN.GUARDIAN_LOADING,
        payload: value,
        meta: requestId ? { requestId } : undefined
    });
};

export const setGuardianNotFound = (value: boolean, requestId?: string) => async (dispatch: any) => {
    return dispatch({
        type: types.GUARDIAN.GUARDIAN_NOT_FOUND,
        payload: value,
        meta: requestId ? { requestId } : undefined
    });
};

export const setGuardianChartData = (chartData: ChartData | undefined) => async (dispatch: any) => {
    return dispatch({
        type: types.GUARDIAN.SET_GUARDIAN_CHART_DATA,
        payload: chartData
    });
};

export const resetguardian = (requestId?: string) => async (dispatch: any) => {
    return dispatch({
        type: types.GUARDIAN.RESET_GUARDIAN,
        meta: requestId ? { requestId } : undefined
    });
};
