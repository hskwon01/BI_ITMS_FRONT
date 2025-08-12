import React, { useEffect, useMemo, useState } from 'react';
import { getAllTickets, getAdminUnreadCounts } from '../api/ticket';
import { Link, useLocation } from 'react-router-dom';
import CommonLayout from '../components/CommonLayout';
import { getTimeAgo, formatDateTime, isOldTicket, isVeryOldTicket } from '../utils/timeUtils';
import '../css/AdminTicketListPage.css';

const statusList = ['접수', '진행중', '답변 완료', '종결'];
const urgencyList = ['낮음', '보통', '높음'];
const ticketTypeList = ['SM', 'SR'];

const AdminTicketListPage = () => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const [allTickets, setAllTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [filters, setFilters] = useState({ status: '', urgency: '', keyword: '', ticket_type: '' });
  const [loading, setLoading] = useState(true);
  const [adminUnreadMap, setAdminUnreadMap] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());

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
      const res = await getAllTickets(token, filters);
      setAllTickets(res.data);
      setFilteredTickets(res.data);
      setLoading(false);
    };
    fetch();
  }, [token, filters]);

  useEffect(() => {
    let filtered = allTickets;

    if (filters.keyword) {
      filtered = filtered.filter(ticket =>
        ticket.title.toLowerCase().includes(filters.keyword.toLowerCase())
      );
    }
    if (filters.ticket_type) {
      filtered = filtered.filter(ticket => ticket.ticket_type === filters.ticket_type);
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
    // 등록일이 오래된 순으로 정렬
    filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    setFilteredTickets(filtered);
  }, [filters, allTickets]);

  // 실시간 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1분마다 업데이트

    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const getStatusCount = (status) => allTickets.filter(ticket => ticket.status === status).length;

  const getTicketTypeCount = (ticketType) => allTickets.filter(ticket => ticket.ticket_type === ticketType).length;

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

  const getTicketTypeColor = (ticketType) => {
    switch (ticketType) {
      case 'SM': return 'sm';
      case 'SR': return 'sr';
      default: return 'default';
    }
  };

  const getTicketAgeClass = (createdAt) => {
    if (isVeryOldTicket(createdAt)) {
      return 'very-old';
    } else if (isOldTicket(createdAt)) {
      return 'old';
    }
    return '';
  };

  return (
    <CommonLayout>
      <div className="admin-ticket-list-container">
        <div className="admin-ticket-header">
          <h1>티켓 관리</h1>
          <p className="admin-ticket-desc">모든 고객 문의를 한눈에 관리하세요</p>
        </div>

      <div className="admin-ticket-stats">
        <div className="admin-ticket-stat-card total">
          <div className="stat-label">전체</div>
          <div className="stat-value">{allTickets.length}</div>
        </div>
        <div className="admin-ticket-stat-card sm">
          <div className="stat-label">SM</div>
          <div className="stat-value">{getTicketTypeCount('SM')}</div>
        </div>
        <div className="admin-ticket-stat-card sr">
          <div className="stat-label">SR</div>
          <div className="stat-value">{getTicketTypeCount('SR')}</div>
        </div>
        <div className="admin-ticket-stat-card received">
          <div className="stat-label">접수</div>
          <div className="stat-value">{getStatusCount('접수')}</div>
        </div>
        <div className="admin-ticket-stat-card in-progress">
          <div className="stat-label">진행중</div>
          <div className="stat-value">{getStatusCount('진행중')}</div>
        </div>
        <div className="admin-ticket-stat-card answered">
          <div className="stat-label">답변완료</div>
          <div className="stat-value">{getStatusCount('답변 완료')}</div>
        </div>
        <div className="admin-ticket-stat-card closed">
          <div className="stat-label">종결</div>
          <div className="stat-value">{getStatusCount('종결')}</div>
        </div>
      </div>

      <div className="admin-ticket-filters">
        <input
          name="keyword"
          placeholder="제목, 고객명, 담당자로 검색..."
          value={filters.keyword}
          onChange={handleChange}
          className="admin-ticket-search"
        />
        <select name="ticket_type" value={filters.ticket_type} onChange={handleChange} className="admin-ticket-select">
          <option value="">모든 타입</option>
          {ticketTypeList.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
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
        {loading ? (
          <div className="admin-ticket-loading">로딩 중...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="admin-ticket-empty">
            {allTickets.length === 0 ? '등록된 티켓이 없습니다.' : '검색 조건에 맞는 티켓이 없습니다.'}
          </div>
        ) : (
          <table className="admin-ticket-table">
            <thead>
              <tr>
                <th>제목</th>
                <th>티켓 타입</th>
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
                <tr key={ticket.id} className={getTicketAgeClass(ticket.created_at)}>
                  <td className="title-cell">
                    <Link to={`/admin/tickets/${ticket.id}`} className="admin-ticket-link">
                      {ticket.title}
                      {adminUnreadMap[ticket.id] > 0 && (
                        <span className="unread-badge">
                          {adminUnreadMap[ticket.id]}
                        </span>
                      )}
                    </Link>
                  </td>
                  <td>
                    <span className={`ticket-type-badge ${getTicketTypeColor(ticket.ticket_type)}`}>
                      {ticket.ticket_type}
                    </span>
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
                    <div className="date-time-container">
                      <div className="date-time">{formatDateTime(ticket.created_at)}</div>
                      <div className="time-ago">{getTimeAgo(ticket.created_at, currentTime)}</div>
                    </div>
                  </td>
                  <td>{ticket.assignee_name || '미배정'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
    </CommonLayout>
  );
};

export default AdminTicketListPage;
