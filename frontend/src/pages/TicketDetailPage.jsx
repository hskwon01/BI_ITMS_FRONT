import React from 'react';
import TicketDetailBase from '../components/TicketDetailBase';
import { useParams } from 'react-router-dom';

const TicketDetailPage = () => {
  const { id } = useParams();
  const token = localStorage.getItem('token');

  return (
    <TicketDetailBase ticketId={id} token={token} role="customer" />
  );
};

export default TicketDetailPage;
