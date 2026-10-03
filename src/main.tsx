import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@fontsource/noto-sans-egyptian-hieroglyphs/400.css';
import '@fontsource/noto-sans-cuneiform/400.css';
import '@fontsource/noto-sans-old-persian/400.css';
import '@fontsource/noto-sans-ugaritic/400.css';
import '@fontsource/cinzel/400.css';
import '@fontsource/cinzel/600.css';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
