import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import '../css/app.css';

const root = document.getElementById('root');

if (!root) {
    throw new Error('Root element #root not found');
}

createRoot(root).render(
    <StrictMode>
        <ErrorBoundary>
            <MotionConfig
                transition={{ duration: 0.28, ease: [0.33, 1, 0.68, 1] }}
            >
                <App />
            </MotionConfig>
        </ErrorBoundary>
    </StrictMode>,
);
