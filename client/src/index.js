import React from 'react';
import ReactDOM from 'react-dom';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faLongArrowAltDown, faArrowDown } from '@fortawesome/free-solid-svg-icons';

import App from './App';

import 'bootstrap/dist/css/bootstrap.css';


library.add(faLongArrowAltDown, faArrowDown);

ReactDOM.render(<App />, document.getElementById('root'));