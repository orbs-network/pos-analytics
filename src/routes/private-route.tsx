import { Route, Redirect, RouteProps } from 'react-router-dom';
import React, { FunctionComponent as Component } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../redux/types/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props = { children: any } & RouteProps;

interface StateProps {
    token?: string;
}

export const PrivateRoute: Component<Props> = ({ children, ...rest }) => {
    const { token } = useSelector<AppState, StateProps>((state: AppState) => {
        return {
            token: state.auth.token
        };
    });
  
    return (
        <Route
            /* eslint-disable react/jsx-props-no-spreading */
            {...rest}
            render={({ location }) =>
                token ? (
                    children
                ) : (
                    <Redirect
                        to={{
                            pathname: '/login',
                            state: { from: location }
                        }}
                    />
                )
            }
        />
    );
};
