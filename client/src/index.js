import React from 'react';
import ReactDOM from 'react-dom';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faLongArrowAltDown, faArrowDown } from '@fortawesome/free-solid-svg-icons';

import App from './App';

import 'bootstrap/dist/css/bootstrap.css';

import { Provider } from 'react-redux';
import store from './store';

library.add(faLongArrowAltDown, faArrowDown);

ReactDOM.render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('root'));