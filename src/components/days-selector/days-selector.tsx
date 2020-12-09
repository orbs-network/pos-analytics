import React, { useEffect } from 'react';
import moment from 'moment';
import { useState } from 'react';
import { generateDays } from 'utils/dates';
import CalendarTodayOutlinedIcon from '@material-ui/icons/CalendarTodayOutlined';
import { useClickOutside } from 'react-click-outside-hook';
import CloseIcon from '@material-ui/icons/Close';
import './days-selector.scss';

interface StateProps {
    selectDate: (date: Date) => void;
}
export const DaysSelector = ({ selectDate }: StateProps) => {
    const [ref, hasClickedOutside] = useClickOutside();

    const [daysToSelect, setDaysToSelect] = useState<Date[]>(generateDays(20));
    const [selectedDate, setSelectedDate] = useState<Date>(moment().toDate());
    const [showDates, setShowDates] = useState<boolean>(false);

    useEffect(() => {
        setShowDates(false);
    }, [hasClickedOutside]);

    const select = (date: Date) => {
        setSelectedDate(date);
        selectDate(date);
        setShowDates(false)
       
    };

    useEffect(() => {
        const body: any = document.querySelector('body')
        if(!body) return
        body.style.overflow = showDates ? 'hidden' : 'auto';
    }, [showDates])

    return (
        <div className="days-selector" ref={ref}>
            <section onClick={() => setShowDates(!showDates)} className="days-selector-selected flex-start-center">
                <CalendarTodayOutlinedIcon />
                <h5> {moment(selectedDate).format('DD.MM.YYYY')}</h5>
            </section>
            {showDates && (
               <div className='days-selector-modal'>
                
                   <section 
                   onClick={() => setShowDates(false)}
                   className='overlay'></section>
                    <button onClick={() => setShowDates(false)}><CloseIcon /></button>
                    <ul className="days-selector-options" >
                   
                    {daysToSelect.map((day) => {
                        return <li onClick={() => select(day)}>{moment(day).format('DD.MM.YYYY')}</li>;
                    })}
                </ul>
               </div>
            )}
        </div>
    );
};
