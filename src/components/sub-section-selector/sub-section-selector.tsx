import React from 'react';
import './style.scss';

interface Option {
    name: string;
    value: any;
}
interface StateProps {
    options: Option[];
    select: (section: any) => void;
    selectedValue: string;
}

export const SubSectionSelector = ({ options, select, selectedValue }: StateProps) => {
    return (
        <div className="sub-s-selector flex-start-center">
            {options.map((option, index: number) => {
                const className =
                    selectedValue === option.value
                        ? 'sub-s-selector-option sub-s-selector-option-selected'
                        : 'sub-s-selector-option';
                return (
                    <section className={className} onClick={() => select(option.value)}>
                        <h3 key={`${option}${index}`}>{option.name}</h3>
                    </section>
                );
            })}
        </div>
    );
};
