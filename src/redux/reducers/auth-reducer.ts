import { AuthState } from '../types/auth-types';
import { types } from '../types/types';

const initialState: AuthState = {
    token: ''
};

export const authReducer = (state = initialState, { payload, type }: any): AuthState => {
    switch (type) {
        case types.LOGIN:
            return {
                ...state
            };
        default:
            return state;
    }
};
