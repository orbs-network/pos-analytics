import moment from 'moment';

export const sortByDateMilliseconds = (arr: any) => {
    if (!arr) return;
    return arr.sort((a: any, b: any) => {
        return moment(a.x).diff(moment(b.x));
    });
};

export const sortByNumber = (arr: any, propertyName: string, asc?: boolean) => {
    if (!arr) return;
    return arr.sort((a: any, b: any) => {
        return asc ? a[propertyName] - b[propertyName] : b[propertyName] - a[propertyName];
    });
};

export const findIndexInArray = (arr: [any], propertyName: string, key: string): number => {
    return arr.findIndex((elem: any) => elem[propertyName] === key);
};
