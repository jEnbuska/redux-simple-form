import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, } from 'react-redux';
import MiscForm from './containers/MiscForm';


import store from './store';

const Root = () => (
    <Provider store={store}>
        <MiscForm />
    </Provider>
);

ReactDOM.render(<Root />, document.getElementById('root'));

