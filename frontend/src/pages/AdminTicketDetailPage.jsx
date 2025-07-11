import React from 'react';
import TicketDetailBase from '../components/TicketDetailBase';
import { useParams } from 'react-router-dom';

const AdminTicketDetailPage = () => {
  const { id } = useParams();
  const token = localStorage.getItem('token');

  return (
    <TicketDetailBase ticketId={id} token={token} role="admin" />
  );
};

export default AdminTicketDetailPage;
