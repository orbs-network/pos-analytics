import { types } from '../types/types';
import { delegatorReducer } from './delegator';
import { guardiansReducer } from './guardians';

describe('detail request reducer state', () => {
    it('ignores stale Guardian results and preserves the cached Guardian list while resetting detail state', () => {
        const guardians = [{ address: '0xlist' }];
        const guardiansColors = { '0xlist': '#fff' };
        let state = guardiansReducer(undefined, {
            type: types.GUARDIAN.SET_GUARDIANS,
            payload: { guardians, guardiansColors }
        });
        state = guardiansReducer(state, {
            type: types.GUARDIAN.RESET_GUARDIAN,
            meta: { requestId: 'old' }
        });
        state = guardiansReducer(state, {
            type: types.GUARDIAN.RESET_GUARDIAN,
            meta: { requestId: 'new' }
        });

        const beforeStaleResult = state;
        state = guardiansReducer(state, {
            type: types.GUARDIAN.SET_GUARDIAN,
            payload: { address: '0xold' },
            meta: { requestId: 'old' }
        });
        expect(state).toBe(beforeStaleResult);

        state = guardiansReducer(state, {
            type: types.GUARDIAN.SET_GUARDIAN,
            payload: { address: '0xnew' },
            meta: { requestId: 'new' }
        });
        expect(state).toMatchObject({
            selectedGuardian: { address: '0xnew' },
            guardianIsLoading: false,
            guardianNotFound: false,
            guardians,
            guardiansColors
        });
        expect(state.activeGuardianRequestId).toBeUndefined();
    });

    it('ignores stale Delegator failures and settles the current failure', () => {
        let state = delegatorReducer(undefined, {
            type: types.DELEGATOR.RESET_DELEGATOR,
            meta: { requestId: 'old' }
        });
        state = delegatorReducer(state, {
            type: types.DELEGATOR.RESET_DELEGATOR,
            meta: { requestId: 'new' }
        });

        const beforeStaleFailure = state;
        state = delegatorReducer(state, {
            type: types.DELEGATOR.DELEGATOR_NOT_FOUND,
            payload: true,
            meta: { requestId: 'old' }
        });
        expect(state).toBe(beforeStaleFailure);

        state = delegatorReducer(state, {
            type: types.DELEGATOR.DELEGATOR_NOT_FOUND,
            payload: true,
            meta: { requestId: 'new' }
        });
        expect(state).toMatchObject({
            selectedDelegator: undefined,
            delegatorNotFound: true,
            delegatorIsLoading: false
        });
        expect(state.activeDelegatorRequestId).toBeUndefined();
    });
});
