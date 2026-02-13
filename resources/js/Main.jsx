import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useInactivityTracker from './hooks/useInactivityTracker';
import Lockscreen from './components/Lockscreen';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateProposal from './pages/proposals/Create';
import ReviewIndex from './pages/reviews/Index';
import ProposalsIndex from './pages/proposals/Index';
import PostDetail from './pages/PostDetail';
import AgendaDetail from './pages/AgendaDetail';
import PublicDocuments from './pages/public/Documents';
import PublicSurvey from './pages/public/Survey';
import PostCategory from './pages/public/PostCategory';
import InfoDetail from './pages/public/InfoDetail';
import PublicKknRegister from './pages/public/KknRegister';
import PublicOrganization from './pages/public/OrganizationChart';
import PageDetail from './pages/public/PageDetail';
import StudentRegister from './pages/StudentRegister';
import api from './utils/api';

import ReportsIndex from './pages/reports/Index';
import PostsIndex from './pages/cms/Posts';
import CmsPostDetail from './pages/cms/PostDetail';
import DocumentsIndex from './pages/cms/Documents';
import GalleriesIndex from './pages/cms/Galleries';
import ProfileIndex from './pages/profile/Index';
import StatsIndex from './pages/profile/Stats';
import FiscalYearsIndex from './pages/admin/fiscal_years/Index';
import SchemesIndex from './pages/admin/schemes/Index';
import UsersIndex from './pages/admin/users/Index';
import FacultiesIndex from './pages/admin/master/Faculties';
import StudyProgramsIndex from './pages/admin/master/StudyPrograms';

import OrganizationAdminIndex from './pages/admin/organization/Index';
import RolesIndex from './pages/admin/roles/Index';
import PermissionsIndex from './pages/admin/permissions/Index';
import MenuIndex from './pages/admin/menus/Index';
import MenuBuilder from './pages/admin/menus/Builder';
import SystemSettingIndex from './pages/admin/SystemSetting';

import OrganizationIndex from './pages/profile/Organization';
import KknLocationsIndex from './pages/kkn/Locations';
import KknStudentRegistration from './pages/kkn/Registration';
import KknParticipantsIndex from './pages/kkn/Participants';
import KknDocumentTemplates from './pages/admin/KknDocumentTemplates';
import StudentKknStatus from './pages/student/KknStatus';

// KKN Posko Management
import PostoIndex from './pages/kkn/PostoIndex';
import PostoForm from './pages/kkn/PostoForm';
import PostoDetail from './pages/kkn/PostoDetail';
import PostoAddMember from './pages/kkn/PostoAddMember';

// Student KKN Dashboard Components
import StudentKknDashboard from './pages/student/kkn/StudentKknDashboard';
import StudentKknRegistration from './pages/student/kkn/StudentKknRegistration';
import StudentKknStatusPage from './pages/student/kkn/StudentKknStatus';
import StudentKknGroup from './pages/student/kkn/StudentKknGroup';
import StudentKknGuidance from './pages/student/kkn/StudentKknGuidance';
import StudentKknReports from './pages/student/kkn/StudentKknReports';
import StudentKknAssessment from './pages/student/kkn/StudentKknAssessment';

// Journal Consultation
import JournalIndex from './pages/journal/Index';
import JournalCreate from './pages/journal/Create';
import JournalShow from './pages/journal/Show';

import KknAssessment from './pages/kkn/Assessment';

import PrivateRoute from './components/PrivateRoute';
import { Provider, useSelector, useDispatch } from 'react-redux';
import store from './store';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import { selectSettings, setSettings } from './store/slices/systemSlice';
import { useAuth } from './hooks/useAuth';

function App() {
    const { fetchUser, isAuthenticated, isLocked, lockScreen, unlockScreen, logout, user } = useAuth();
    const dispatch = useDispatch();
    const settings = useSelector(selectSettings);

    // Inactivity tracker - only active when authenticated
    useInactivityTracker(
        () => lockScreen(),           // Lock after 30 minutes
        () => logout(),                // Logout after 60 minutes
        isLocked || !isAuthenticated   // Don't track when locked or not authenticated
    );

    useEffect(() => {
        fetchUser();
        fetchSystemSettings();
    }, []);

    const fetchSystemSettings = async () => {
        try {
            const { data } = await api.get('/system-settings');
            
            // Save to Redux store
            dispatch(setSettings(data));

            if (data?.theme_color) {
                document.documentElement.style.setProperty('--primary-color', data.theme_color);
            }
            if (data?.favicon_path) {
                const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
                link.type = 'image/x-icon';
                link.rel = 'shortcut icon';
                link.href = `/storage/${data.favicon_path}`;
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            if (data?.system_name) {
                document.title = data.system_name;
            }
        } catch (error) {
            console.error('Failed to load system settings:', error);
        }
    };

    // Handle unlock
    const handleUnlock = async (email) => {
        await unlockScreen(email);
    };

    // Show lockscreen if locked
    if (isLocked && isAuthenticated) {
        return (
            <>
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                />
                <Lockscreen 
                    user={user} 
                    onUnlock={handleUnlock} 
                    onLogout={logout}
                />
            </>
        );
    }

    return (
        <BrowserRouter>
            <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
        />
        <Routes>
            {/* Public Layout Routes */}
            <Route path="/" element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="posts/:slug" element={<PostDetail />} />
                <Route path="agendas/:id" element={<AgendaDetail />} />
                <Route path="documents" element={<PublicDocuments />} />
                <Route path="survey" element={<PublicSurvey />} />
                <Route path="posts/category/:category" element={<PostCategory />} />
                <Route path="info/:slug" element={<InfoDetail />} />
                <Route path="kkn/register" element={<PublicKknRegister />} />
                <Route path="about/organization" element={<PublicOrganization />} />
                <Route path="pages/:slug" element={<PageDetail />} />
                <Route path="register" element={<StudentRegister />} />
            </Route>
            
            {/* Authenticated Admin Routes */}
            <Route element={<PrivateRoute />}>
                 <Route path="/" element={<AdminLayout />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="proposals" element={<ProposalsIndex />} /> {/* Separate Proposal List */}
                    <Route path="proposals/create" element={<CreateProposal />} />
                    
                    {/* Program Activity */}
                    <Route path="reports" element={<ReportsIndex />} />
                    <Route path="reviews" element={<ReviewIndex />} />
                    
                    {/* Journal Consultation */}
                    <Route path="journals" element={<JournalIndex />} />
                    <Route path="journals/create" element={<JournalCreate />} />
                    <Route path="journals/:id" element={<JournalShow />} />
                    
                    
                    {/* Student KKN Dashboard */}
                    <Route path="dashboard/kkn" element={<StudentKknDashboard />} />
                    <Route path="dashboard/kkn/register" element={<StudentKknRegistration />} />
                    <Route path="dashboard/kkn/status" element={<StudentKknStatusPage />} />
                    <Route path="dashboard/kkn/status" element={<StudentKknStatusPage />} />
                    <Route path="dashboard/kkn/group" element={<StudentKknGroup />} />
                    <Route path="dashboard/kkn/guidance" element={<StudentKknGuidance />} />
                    <Route path="dashboard/kkn/reports" element={<StudentKknReports />} />
                    <Route path="dashboard/kkn/assessment" element={<StudentKknAssessment />} />

                    {/* KKN Module (Admin/Legacy) */}
                    <Route path="kkn" element={<KknStudentRegistration />} /> {/* Default to registration/dashboard for student */}
                    <Route path="kkn/locations" element={<KknLocationsIndex />} />
                    <Route path="kkn/registration" element={<KknStudentRegistration />} />
                    <Route path="kkn/status" element={<StudentKknStatus />} />
                    <Route path="kkn/participants" element={<KknParticipantsIndex />} />
                    
                    {/* KKN Posko Management (Admin) */}
                    <Route path="kkn/postos" element={<PostoIndex />} />
                    <Route path="kkn/postos/create" element={<PostoForm />} />
                    <Route path="kkn/postos/:id" element={<PostoDetail />} />
                    <Route path="kkn/postos/:id/edit" element={<PostoForm />} />
                    <Route path="kkn/postos/:id/members/add" element={<PostoAddMember />} />
                    
                    {/* KKN Assessment (Admin/Staff) */}
                    <Route path="kkn/assessment" element={<KknAssessment />} />
                    <Route path="kkn/document-templates" element={<KknDocumentTemplates />} />

                    {/* CMS */}
                    <Route path="cms/posts" element={<PostsIndex />} />
                    <Route path="cms/posts/:id" element={<CmsPostDetail />} />
                    <Route path="cms/documents" element={<DocumentsIndex />} />
                    <Route path="cms/galleries" element={<GalleriesIndex />} />

                    {/* Master Data (Admin Only) */}
                    <Route path="master/faculties" element={<FacultiesIndex />} />
                    <Route path="master/study-programs" element={<StudyProgramsIndex />} />
                    <Route path="master/fiscal-years" element={<FiscalYearsIndex />} />
                    <Route path="master/schemes" element={<SchemesIndex />} />
                    <Route path="master/users" element={<UsersIndex />} />
                    
                    {/* User Management */}
                    <Route path="admin/organization" element={<OrganizationAdminIndex />} />
                    <Route path="admin/roles" element={<RolesIndex />} />
                    <Route path="admin/permissions" element={<PermissionsIndex />} />
                    <Route path="admin/menus" element={<MenuIndex />} />
                    <Route path="admin/menus/:id" element={<MenuBuilder />} />
                    <Route path="admin/settings" element={<SystemSettingIndex />} />

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

function Main() {
    return (
        <Provider store={store}>
            <App />
        </Provider>
    );
}

if (document.getElementById('app')) {
    const root = createRoot(document.getElementById('app'));
    root.render(<Main />);
}
