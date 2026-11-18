import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

/* PWA: تسجيل عامل الخدمة (يعمل أوفلاين بعد أول زيارة — الشبكة أولاً للمحداثة) */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      /* بدون PWA لا يتعطل التطبيق — يعمل عادي */
    });
  });
}
