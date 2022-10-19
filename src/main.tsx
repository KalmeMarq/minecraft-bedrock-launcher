import React from 'react';
import ReactDOM from 'react-dom/client';
import { setAppElement } from 'react-modal';
import App from './App';
import { AboutProvider } from './context/AboutContext';
import { TranslationProvider } from './context/TranslationContext';
import './fonts.scss';
import './index.scss';
import { isDev } from './utils';

if (!isDev()) {
  document.addEventListener('keydown', (e) => {
    if (e.code === 'F5') e.preventDefault();
    if (e.code === 'F3') e.preventDefault();
    if (e.code === 'F7') e.preventDefault();
    if (e.code === 'KeyR' && e.ctrlKey) e.preventDefault();
  });
}

window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

window.addEventListener('mousedown', (e) => {
  if (e.button === 1) {
    e.preventDefault();
  }
});

setAppElement('#root');

const root = document.getElementById('root') as HTMLElement;

const Root = () => {
  return (
    <AboutProvider>
      <TranslationProvider translation={{}}>
        <App />
      </TranslationProvider>
    </AboutProvider>
  );
};

ReactDOM.createRoot(root).render(<Root />);
