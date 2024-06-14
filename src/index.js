import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Import the bundled bitcoinjs-lib
import('./bitcoinjs-lib.js')
  .then(() => {
    // bitcoinjs-lib is now available globally as 'bitcoin'
    console.log('bitcoinjs-lib loaded');

    var bitcoin = require('./bitcoinjs-lib.js')
    //bitcoin_js.bigi = require('bigi') // not available?
    console.log(bitcoin)
    bitcoin.Buffer = require('./safe-buffer').Buffer

    const TESTNET = bitcoin.networks.testnet;

    console.log('bitcoinjs-lib', TESTNET);




    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(

      <React.StrictMode>

        <App />


      </React.StrictMode>
      ,
    );

  })
  .catch((error) => {
    console.error('Failed to load bitcoinjs-lib:', error);
  });




// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
