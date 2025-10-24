import React from 'react';
import ReactDOM from 'react-dom/client'; // Or 'react-dom'
import './index.css'; // <-- Make sure this line is here
import App from './App'; //
// ... other imports ...

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);