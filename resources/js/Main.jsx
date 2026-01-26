import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateProposal from './pages/proposals/Create';
import KknIndex from './pages/kkn/Index';
import ReportsIndex from './pages/reports/Index';
import PostsIndex from './pages/cms/Posts';
import DocumentsIndex from './pages/cms/Documents';
import GalleriesIndex from './pages/cms/Galleries';
import ProfileIndex from './pages/profile/Index';
import StatsIndex from './pages/profile/Stats';
import OrganizationIndex from './pages/profile/Organization';
import PrivateRoute from './components/PrivateRoute';
import useAuthStore from './store/useAuthStore';

import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

export default function Main() {
    const { fetchUser } = useAuthStore();

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Layout Routes */}
                <Route path="/" element={<PublicLayout />}>
                    <Route index element={<Home />} />
                    <Route path="login" element={<Login />} />
                    {/* Add other public routes here like /about, /news etc */}
                </Route>
                
                {/* Authenticated Admin Routes */}
                <Route element={<PrivateRoute />}>
                     <Route path="/" element={<AdminLayout />}>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="proposals" element={<Dashboard />} /> {/* Reuse Dashboard for list */}
                        <Route path="proposals/create" element={<CreateProposal />} />
                        
                        {/* Program Activity */}
                        <Route path="kkn" element={<KknIndex />} />
                        <Route path="reports" element={<ReportsIndex />} />

                        {/* CMS */}
                        <Route path="cms/posts" element={<PostsIndex />} />
                        <Route path="cms/documents" element={<DocumentsIndex />} />
                        <Route path="cms/galleries" element={<GalleriesIndex />} />

                        {/* Profile */}
                        <Route path="profile" element={<ProfileIndex />} />
                        <Route path="profile/stats" element={<StatsIndex />} />
                        <Route path="organization" element={<OrganizationIndex />} />
                     </Route>
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

if (document.getElementById('app')) {
    const root = createRoot(document.getElementById('app'));
    root.render(<Main />);
}
