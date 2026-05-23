import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminApp from './admin/AdminApp';
import TalkPage from './pages/TalkPage';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/talk" replace />} />
                <Route path="/talk/*" element={<TalkPage />} />
                <Route path="/admin/*" element={<AdminApp />} />
                <Route path="*" element={<Navigate to="/talk" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
