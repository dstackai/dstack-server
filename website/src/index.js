import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter} from 'react-router-dom';
import {StateProvider as StackAttachmentProvider} from 'components/stack/Attachment/store';
import {AppStoreProvider} from 'AppStore';
import config from 'config';

import App from 'App';
import store from './store';
import * as serviceWorker from './serviceWorker';

import './i18next';
import './index.css';

const
    rootElement = document.getElementById('root');

if (rootElement instanceof Element) {
    render(
        <Provider store={store}>
            <BrowserRouter>
                <AppStoreProvider apiUrl={config.API_URL}>
                    <StackAttachmentProvider apiUrl={config.API_URL}>
                        <App/>
                    </StackAttachmentProvider>
                </AppStoreProvider>
            </BrowserRouter>
        </Provider>,

        rootElement
    );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
