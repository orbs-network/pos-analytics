import React from 'react';
import { LoaderType } from '../../global/enums';
import { LoadingComponent } from '../loading-component/loading-component';
import TokenImg from '../../assets/images/token.png';

import './balance-section.scss';
import { isMobile } from 'react-device-detect';

interface StateProps {
    isLoading: boolean;
    text: string;
    data: string | number;
    hideImg?: boolean;
    customImg?: string;
    titleImg?: string;
}

export const BalanceSection = ({ isLoading, text, data, hideImg, customImg, titleImg }: StateProps) => {
    return (
        <div className="balance-section flex-column">
            {titleImg ? (
                <section className='flex-start-center'>
                    <img src={titleImg} className="balance-section-title-img" />
                    <h5 className="capitalize">{text}</h5>
                </section>
            ) : (
                <h4 className="one-line capitalize">{text}</h4>
            )}
            <LoadingComponent loaderType={LoaderType.TEXT} isLoading={isLoading}>
                <div className={`${isMobile ? 'flex-center' : 'flex-start-center'}`}>
                    <p className="balance-section-bold">{data}</p>
                    {!hideImg && <img src={customImg || TokenImg} alt="orbs img" className="balance-img" />}
                </div>
            </LoadingComponent>
        </div>
    );
};
