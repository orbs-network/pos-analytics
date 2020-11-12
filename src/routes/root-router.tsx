import { BrowserRouter as Router, Switch, Route, Redirect, useParams } from 'react-router-dom';
import React, { FunctionComponent as Component } from 'react';

import { routes } from './routes';
import { Delegators } from '../screens/deligators/delegators';
import { NavigationMenu } from '../components/navigation-menu/navigation-menu';
import { Guardians } from '../screens/guardians/guardians';
import { Overview } from '../screens/overview/overview';

export const RootRouter: Component = () => {
    return (
        <Router basename={process.env.PUBLIC_URL}>
           
            <Route path={routes.navigation} render={() =>  <NavigationMenu />} />
            <Switch>
                <Route exact path="/">
                    <Redirect to={routes.overview.stake} />
                </Route>
                <Route path={routes.overview.main} render={() => <Overview />} />
                <Route path={routes.guardians.main} render={() => <Guardians />} />
                <Route path={routes.delegators.main} render={() => <Delegators />} />
            </Switch>
        </Router>
    );
};
