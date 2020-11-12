const numeral = require('numeral');

export const formatNumber = (num: number, format: string): string => {
    return numeral(num).format(format);
};

export const convertToString = (num?: number, defaultString?: string): number | string => {
    if (!num) return defaultString || '0';
    return Number(num.toFixed(0)).toLocaleString();
};
