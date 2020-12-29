// @flow
import React from 'react';
import {Switch, Route} from 'react-router-dom';
import routes from 'routes';
import css from './styles.module.css';
import List from './List';
import Details from './Details';

type Props = {}

const Stacks = ({}: Props) => {
    return (
        <div className={css.stacks}>
            <Switch>
                <Route path={routes.categoryStacks()} exact component={List} />
                <Route path={routes.categoryUserStacks()} exact component={List} />
                <Route path={routes.stackDetails()} component={Details} />
            </Switch>
        </div>
    );
};

export default Stacks;
