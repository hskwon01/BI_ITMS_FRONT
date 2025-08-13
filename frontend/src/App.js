import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { ToastProvider } from './contexts/ToastContext';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AdminUserListPage from './pages/AdminUserListPage';
import AdminRoute from './routes/AdminRoute';
import UserRoute from './routes/UserRoute';
import CreateTicketPage from './pages/CreateTicketPage';
import MyTicketListPage from './pages/MyTicketListPage';
import TicketDetailPage from './pages/TicketDetailPage';
import AdminTicketListPage from './pages/AdminTicketListPage';
import AdminTicketDetailPage from './pages/AdminTicketDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminTeamListPage from './pages/AdminTeamListPage';
import RequestAccessPage from './pages/RequestAccessPage';
import MagicLoginProcessor from './pages/MagicLoginProcessor';
import AdminAccessRequestPage from './pages/AdminAccessRequestPage';
import NoticesPage from './pages/NoticesPage';
import NoticeDetailPage from './pages/NoticeDetailPage';
import NoticeEditPage from './pages/NoticeEditPage';
import NoticeCreatePage from './pages/NoticeCreatePage';
import AdminProductsPage from './pages/AdminProductsPage';
import QuotesPage from './pages/QuotesPage';
import QuoteCreatePage from './pages/QuoteCreatePage';
import QuoteDetailPage from './pages/QuoteDetailPage';

const App = () => (
  <UserProvider>
    <ToastProvider>
      <BrowserRouter>
        <Routes>
        {/* 홈 페이지 */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/request-access" element={<RequestAccessPage />} />
        <Route path="/magic-login" element={<MagicLoginProcessor />} />
        <Route path="/notices" element={<NoticesPage />} />
        <Route path="/notices/create" element={<NoticeCreatePage />} />
        <Route path="/notices/:id" element={<NoticeDetailPage />} />
        <Route path="/notices/:id/edit" element={<NoticeEditPage />} />
        <Route path="/quotes" element={<QuotesPage />} />
        <Route path="/quotes/create" element={<QuoteCreatePage />} />
        <Route path="/quotes/:id" element={<QuoteDetailPage />} />
        
        {/* 고객용 - CommonLayout 사용 */}
        <Route path="/my-tickets" element={<UserRoute><MyTicketListPage /></UserRoute>} />
        <Route path="/my-tickets/create" element={<UserRoute><CreateTicketPage /></UserRoute>} />
        <Route path="/my-tickets/:id" element={<UserRoute><TicketDetailPage /></UserRoute>} />
        <Route path="/profile" element={<UserRoute><ProfilePage /></UserRoute>} />

        {/* 관리자 & 기술지원팀용 */}
        <Route path="/admin/tickets" element={<AdminRoute><AdminTicketListPage /></AdminRoute>}/>
        <Route path="/admin/tickets/:id" element={<AdminRoute><AdminTicketDetailPage /></AdminRoute>} />
        <Route path="/admin/customer" element={<AdminRoute><AdminUserListPage /></AdminRoute>} />
        <Route path="/admin/team" element={<AdminRoute><AdminTeamListPage /></AdminRoute>} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        <Route path="/admin/access-requests" element={<AdminRoute><AdminAccessRequestPage /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
              </Routes>
      </BrowserRouter>
    </ToastProvider>
    </UserProvider>
  );

export default App;
