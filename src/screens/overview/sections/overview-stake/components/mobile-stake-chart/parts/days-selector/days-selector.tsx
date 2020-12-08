import React, { useEffect } from 'react';
import moment from 'moment';
import { useState } from 'react';
import { generateDays } from 'utils/dates';
import CalendarTodayOutlinedIcon from '@material-ui/icons/CalendarTodayOutlined';
import { useClickOutside } from 'react-click-outside-hook';

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

    return (
        <div className="days-selector" ref={ref}>
            <section onClick={() => setShowDates(!showDates)} className="days-selector-selected flex-start-center">
                <CalendarTodayOutlinedIcon />
                <h5> {moment(selectedDate).format('DD.MM.YYYY')}</h5>
            </section>
            {showDates && (
                <ul className="days-selector-options" >
                    {daysToSelect.map((day) => {
                        return <li onClick={() => select(day)}>{moment(day).format('DD.MM.YYYY')}</li>;
                    })}
                </ul>
            )}
        </div>
    );
};
