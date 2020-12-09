import { PosOverviewData } from '@orbs-network/pos-analytics-lib';
import React from 'react'
import { useHistory } from 'react-router-dom';
import { routes } from 'routes/routes';
import { convertToString } from 'utils/number';


interface StateProps {
    selected: PosOverviewData | null;
}
export const SelectedGuardian = ({ selected }: StateProps) => {
    const history = useHistory();
    const goToGuardian = () => {
        if (!selected) return;
        history.push(routes.guardians.stake.replace(':address', selected.address));
    };
    return selected ? (
        <button className="mobile-stake-chart-selected" onClick={goToGuardian} type="button">
            <p className="text-overflow">{selected?.name}</p>
            <h5>{convertToString(selected?.effective_stake)}</h5>
        </button>
    ) : null;
};