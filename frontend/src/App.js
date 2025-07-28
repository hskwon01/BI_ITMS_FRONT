import React from 'react';
import Layout from './components/Layout';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import AdminUserListPage from './pages/AdminUserListPage';
import AdminRoute from './routes/AdminRoute';
import CreateTicketPage from './pages/CreateTicketPage';
import MyTicketListPage from './pages/MyTicketListPage';
import TicketDetailPage from './pages/TicketDetailPage';
import AdminTicketListPage from './pages/AdminTicketListPage';
import AdminTicketDetailPage from './pages/AdminTicketDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';


const App = () => (
  <BrowserRouter>
    <Routes>
       {/* 루트로 접속하면 /login 으로 자동 이동 */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<Layout />}>
        {/* 고객용 */}
        <Route path="/my-tickets" element={<MyTicketListPage />} />
        <Route path="/my-tickets/create" element={<CreateTicketPage />} />
        <Route path="/my-tickets/:id" element={<TicketDetailPage />} />

        {/* 관리자용 */}
        <Route path="/admin/tickets" element={<AdminRoute><AdminTicketListPage /></AdminRoute>} />
        <Route path="/admin/tickets/:id" element={<AdminRoute><AdminTicketDetailPage /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUserListPage /></AdminRoute>} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
