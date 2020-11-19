const numeral = require('numeral');

export const formatNumber = (num: number, format: string): string => {
    return numeral(num).format(format);
};

export const convertToString = (num?: number, defaultString?: string): number | string => {
    if (!num) return defaultString || '0';
    if (num < 1) {
        return Number(num.toFixed(2));
    }
    return `${Number(num.toFixed(0)).toLocaleString()}`;
};

export const toPercent = (number?: number): string => {
    console.log(number);
    if (!number) return '0';
    const percent = number * 100;
    if (percent > 100) return '100%';
    return `${percent.toFixed(2)}%`;
};
