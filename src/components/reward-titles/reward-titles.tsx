import React from 'react'
import { LoaderType } from '../../global/enums';
import { LoadingComponent } from '../loading-component/loading-component';
import './reward-titles.scss';

interface StateProps {
isLoading: boolean;
titles: string[];
listElementAmount: number;
}

export const RewardTitles = ({isLoading, titles, listElementAmount}: StateProps) =>  {
    return (
        <section className="rewards-titles flex-start">
        <LoadingComponent loaderType={LoaderType.ONE_LINE} isLoading={isLoading} listElementAmount={listElementAmount}>
            <>
                {titles.map((title: string, key: number) => {
                    return <h4 key={key}>{title}</h4>;
                })}
            </>
        </LoadingComponent>
    </section>
    )
}

