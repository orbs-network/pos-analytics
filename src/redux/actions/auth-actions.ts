import { types } from '../types/types';

export const login = () => async (dispatch: any) => {
    //api
    dispatch({
        type: types.LOGIN
    });
};
