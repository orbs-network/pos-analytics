import React from 'react'
import './loaders.scss';
import { TextLoader } from './text-loader';

interface StateProps {
    listElementAmount: number;
}

export const OneLineList = ({listElementAmount}: StateProps) => {
    return (
            <ul className='loader-one-line-list flex-start'>
                {Array.apply(null, Array(listElementAmount)).map((m: any, i: number) => {
                    return <li  key = {i}><TextLoader /></li>
                })}
            </ul>
      
    )
}
