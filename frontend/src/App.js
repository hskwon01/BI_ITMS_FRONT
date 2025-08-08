import React from 'react';
import Layout from './components/Layout';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
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
import RequestAccessPage from './pages/RequestAccessPage'; // 추가
import MagicLoginProcessor from './pages/MagicLoginProcessor'; // 추가
import AdminAccessRequestPage from './pages/AdminAccessRequestPage'; // 추가


const App = () => (
  <BrowserRouter>
    <Routes>
      {/* 홈 페이지 */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/request-access" element={<RequestAccessPage />} /> {/* 추가 */}
      <Route path="/magic-login" element={<MagicLoginProcessor />} /> {/* 추가 */}

      {/* 고객용 - UserLayout 사용 */}
      <Route path="/my-tickets" element={<UserRoute><MyTicketListPage /></UserRoute>} />
      <Route path="/my-tickets/create" element={<UserRoute><CreateTicketPage /></UserRoute>} />
      <Route path="/my-tickets/:id" element={<UserRoute><TicketDetailPage /></UserRoute>} />
      <Route path="/profile" element={<UserRoute><ProfilePage /></UserRoute>} />

      {/* 관리자 & 기술지원팀용 - Layout 없이 직접 라우팅 */}
      <Route path="/admin/tickets" element={<AdminRoute><AdminTicketListPage /></AdminRoute>} />
      <Route path="/admin/tickets/:id" element={<AdminRoute><AdminTicketDetailPage /></AdminRoute>} />
      <Route path="/admin/customer" element={<AdminRoute><AdminUserListPage /></AdminRoute>} />
      <Route path="/admin/team" element={<AdminRoute><AdminTeamListPage /></AdminRoute>} />
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
      <Route path="/admin/access-requests" element={<AdminRoute><AdminAccessRequestPage /></AdminRoute>} /> {/* 추가 */}
    </Routes>
  </BrowserRouter>
);

export default App;
