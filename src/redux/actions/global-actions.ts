import { types } from '../types/types';

export const setDataToGlobalReducer = () => async (dispatch: any) => {
    dispatch({
        type: types.SET_DATA_TO_GLOBAL_REDUCER
    });
};
