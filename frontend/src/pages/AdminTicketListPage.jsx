import React, { useEffect, useMemo, useState } from 'react';
import { getAllTickets, getAdminUnreadCounts } from '../api/ticket';
import { Link, useLocation } from 'react-router-dom';
import CommonLayout from '../components/CommonLayout';
import '../css/AdminTicketListPage.css';

const statusList = ['접수', '진행중', '답변 완료', '종결'];
const urgencyList = ['낮음', '보통', '높음'];

const AdminTicketListPage = ({ ticketType }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const [allTickets, setAllTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [filters, setFilters] = useState({ status: '', urgency: '', keyword: '' });
  const [loading, setLoading] = useState(true);
  const [adminUnreadMap, setAdminUnreadMap] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status') || '';
    if (status && status !== filters.status) {
      setFilters((prev) => ({ ...prev, status }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const res = await getAllTickets(token, { ...filters, type: ticketType });
      setAllTickets(res.data);
      setFilteredTickets(res.data);
      setLoading(false);
    };
    fetch();
  }, [token, ticketType]);

  useEffect(() => {
    let filtered = allTickets;

    if (filters.keyword) {
      filtered = filtered.filter(ticket =>
        ticket.title.toLowerCase().includes(filters.keyword.toLowerCase())
      );
    }
    if (filters.status) {
      filtered = filtered.filter(ticket => ticket.status === filters.status);
    }
    if (filters.urgency) {
      filtered = filtered.filter(ticket => ticket.urgency === filters.urgency);
    }

    const fetchUnreadCounts = async () => {
      const res = await getAdminUnreadCounts(token); // 새 API 호출
      const map = {};
      res.data.forEach(r => {
        map[r.ticket_id] = Number(r.unread_count);
      });
      setAdminUnreadMap(map);
    };
    fetchUnreadCounts();
    setFilteredTickets(filtered);
  }, [filters, allTickets]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const getStatusCount = (status) => allTickets.filter(ticket => ticket.status === status).length;

  const getStatusColor = (status) => {
    switch (status) {
      case '접수': return 'received';
      case '진행중': return 'in-progress';
      case '답변 완료': return 'answered';
      case '종결': return 'closed';
      default: return 'default';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case '높음': return 'high';
      case '보통': return 'medium';
      case '낮음': return 'low';
      default: return 'default';
    }
  };

  return (
    <CommonLayout>
      <div className="admin-ticket-list-container">
        <div className="admin-ticket-header">
          <h1>{ticketType === "SM" ? "SM 고객 티켓 관리" : "SR 고객 티켓 관리"}</h1>
          <p className="admin-ticket-desc">모든 고객 문의를 한눈에 관리하세요</p>
        </div>

      <div className="admin-ticket-stats">
        <div className="admin-ticket-stat-card total">
          <div className="stat-label">전체</div>
          <div className="stat-value">{allTickets.length}</div>
        </div>
        {statusList.map(status => (
          <div className={`admin-ticket-stat-card ${getStatusColor(status)}`} key={status}>
            <div className="stat-label">{status}</div>
            <div className="stat-value">{getStatusCount(status)}</div>
          </div>
        ))}
      </div>

      <div className="admin-ticket-filters">
        <input
          name="keyword"
          placeholder="제목으로 검색"
          value={filters.keyword}
          onChange={handleChange}
          className="admin-ticket-search"
        />
        <select name="status" value={filters.status} onChange={handleChange} className="admin-ticket-select">
          <option value="">모든 상태</option>
          {statusList.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <select name="urgency" value={filters.urgency} onChange={handleChange} className="admin-ticket-select">
          <option value="">모든 긴급도</option>
          {urgencyList.map(urgency => (
            <option key={urgency} value={urgency}>{urgency}</option>
          ))}
        </select>
      </div>

      <div className="admin-ticket-table-wrapper">
        <table className="admin-ticket-table">
          <thead>
            <tr>
              <th>제목</th>
              <th>상태</th>
              <th>긴급도</th>
              <th>고객</th>
              <th>회사</th>
              <th>등록일</th>
              <th>담당자</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map(ticket => (
              <tr key={ticket.id}>
                <td className="title-cell">
                  <Link to={`/admin/tickets/${ticket.id}`} className="admin-ticket-link">
                    {ticket.title}
                  </Link>
                  {adminUnreadMap[ticket.id] > 0 && (
                    <span className="unread-badge">
                      {adminUnreadMap[ticket.id]}
                    </span>
                  )}
                </td>
                <td>
                  <span className={`status-badge ${getStatusColor(ticket.status)}`}>{ticket.status}</span>
                </td>
                <td>
                  <span className={`urgency-badge ${getUrgencyColor(ticket.urgency)}`}>{ticket.urgency}</span>
                </td>
                <td>{ticket.customer_name}</td>
                <td>{ticket.company_name}</td>
                <td>
                  {new Date(ticket.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </td>
                <td>{ticket.assignee_name || '미배정'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTickets.length === 0 && (
          <div className="admin-ticket-empty">검색 결과가 없습니다.</div>
        )}
              </div>
      </div>
    </CommonLayout>
  );
};

export default AdminTicketListPage;
