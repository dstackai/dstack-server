// @flow
import React from 'react';
import {Switch, Route} from 'react-router-dom';
import routes from 'routes';
import List from './List';
import Details from './Details';
import css from './styles.module.css';

type Props = {}

const Reports = ({}: Props) => {
    return (
        <div className={css.reports}>
            <Switch>
                <Route path={routes.reports()} exact component={List} />
                <Route path={routes.reportsDetails()} component={Details} />
            </Switch>
        </div>
    );
};

export default Reports;
