import React from 'react'
import { LoaderType } from '../../global/enums';
import { LoadingComponent } from '../loading-component/loading-component';
import TokenImg from '../../assets/images/token.png';

import './balance-section.scss';

    interface StateProps {
        isLoading: boolean,
        text: string;
        data: string | number;
    }

export const  BalanceSection = ({ isLoading, text, data }: StateProps) => {
    return (
        <div className="balance-section flex-column">
            <h4 className="one-line capitalize">{text}</h4>
            <LoadingComponent loaderType={LoaderType.TEXT} isLoading={isLoading}>
                <div className="flex-start-center">
                    <p className="balance-section-bold">{data}</p>
                    <img src={TokenImg} alt="orbs img" className="balance-img" />
                </div>
            </LoadingComponent>
        </div>
    );
};