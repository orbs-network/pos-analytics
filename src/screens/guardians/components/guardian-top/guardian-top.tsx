import React, { useState } from 'react';
import { RouteParams } from 'global/types';
import { GuardianInfo } from './components/guardian-info/guardian-info';
import { GuardianSearch } from './components/guardian-search/guardian-search';
import './guardian-top.scss';

interface StateProps {
    params: RouteParams;
}

export const GuardianTop = ({ params }: StateProps) => {
const [showInfo, setShowInfo] = useState<boolean>(false)
    return (
        <div className="guardian-top flex-start-center">
            <GuardianSearch address={params.address} section={params.section} />
        
            <GuardianInfo showInfo={showInfo} />
            <button onClick={() => setShowInfo(!showInfo)} type="button" className="guardian-top-mobile-toggle">
               <figure></figure>
               <figure></figure>
            </button>
        </div>
    );
};
