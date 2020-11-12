import React from 'react'
import './loaders.scss';
import { TextLoader } from './text-loader';

interface StateProps {
    listElementAmount: number;
    listLength?: number
}

export const ListLoader = ({listElementAmount, listLength}: StateProps) => {
    return (
            <ul className='loader-list'>
                {Array.apply(null, Array(listLength || 6)).map((m: any, i: number) => {
                    return <li key = {i} className='flex-start-center loader-list-element'>
                        {
                            Array.apply(null, Array(listElementAmount)).map((m: any, index: number) => {
                                return <div key = {index}> <TextLoader /></div>
                            })
                        }
                            
                            
                    </li>
                })}
            </ul>
      
    )
}

