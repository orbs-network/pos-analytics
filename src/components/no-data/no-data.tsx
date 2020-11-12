import React from 'react'
import { useTranslation } from 'react-i18next'
import  './no-data.scss';

interface StateProps {
    customMessage?: string;
}

export const NoData = ({customMessage}: StateProps) => {
    const {t} = useTranslation()
    return (
        <div className='no-data flex-center'>
           <p> {customMessage || t('main.noData')}</p>
        </div>
    )
}

