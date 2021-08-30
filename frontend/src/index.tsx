import 'react-app-polyfill/ie11';
import 'core-js/es/number';
import React from 'react';
import ReactDOM from 'react-dom';
import './bootstrap-reboot.css';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { CodeQuarkus, fetchConfig, fetchPlatform } from '@quarkusio/code-quarkus.components';

ReactDOM.render((
  <CodeQuarkus configApi={fetchConfig} platformApi={fetchPlatform} />
), document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
