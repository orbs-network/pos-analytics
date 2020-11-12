import { routes } from '../routes/routes';

export const routeToGuardian = (address?: string): string => {
    if (!address) return '';
    return routes.guardians.stake.replace(':address', address);
};

export const routeToDelegator = (address?: string): string => {
    if (!address) return '';
    return routes.delegators.stake.replace(':address', address);
};
