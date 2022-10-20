import { listen, UnlistenFn } from '@tauri-apps/api/event';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { setAppElement } from 'react-modal';
import App from './App';
import { AboutProvider } from './context/AboutContext';
import { NewsProvider } from './context/NewsContext';
import { NotificationsProvider } from './context/NotificatonsContext';
import { PatchNotesProvider } from './context/PatchNotesContext';
import { SettingsProvider } from './context/SettingsContext';
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
    if (e.code === 'F12') e.preventDefault();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.code === 'KeyP') e.preventDefault();
  if (e.ctrlKey && e.code === 'KeyU') e.preventDefault();
  if (e.ctrlKey && e.code === 'KeyF') e.preventDefault();
  if (e.ctrlKey && e.code === 'KeyG') e.preventDefault();

  if (e.altKey && e.code === 'ArrowLeft') e.preventDefault();
  if (e.altKey && e.code === 'ArrowRight') e.preventDefault();

  if (e.ctrlKey && e.shiftKey && e.code === 'KeyC') e.preventDefault();
});

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
  useEffect(() => {
    let unlisten = listen('test-event', (event) => {
      console.log(event);
    });

    return () => {
      unlisten.then((f) => f());
    };
  });

  return (
    <AboutProvider>
      <NewsProvider>
        <PatchNotesProvider>
          <SettingsProvider>
            <NotificationsProvider>
              <App />
            </NotificationsProvider>
          </SettingsProvider>
        </PatchNotesProvider>
      </NewsProvider>
    </AboutProvider>
  );
};

ReactDOM.createRoot(root).render(<Root />);
