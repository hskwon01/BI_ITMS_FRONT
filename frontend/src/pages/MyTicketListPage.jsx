import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyTickets, getUnreadCounts } from '../api/ticket';
import CommonLayout from '../components/CommonLayout';
import { getTimeAgo, formatDateTime, isOldTicket, isVeryOldTicket } from '../utils/timeUtils';
import '../css/MyTicketListPage.css';

const MyTicketListPage = () => {
  const token = localStorage.getItem('token');
  const [allTickets, setAllTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [filters, setFilters] = useState({ status: '', urgency: '', keyword: '', ticket_type: '' });
  const [loading, setLoading] = useState(true);
  const [unreadMap, setUnreadMap] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());

  // 1. 전체 티켓 목록을 처음 한 번만 가져오는 useEffect
useEffect(() => {
  const fetchAllTickets = async () => {
    setLoading(true);
    const res = await getMyTickets(token, filters);
    setAllTickets(res.data); // 전체 티켓 원본 저장
    setLoading(false);
  };
  fetchAllTickets();
}, [token]);

// 2. filters가 바뀔 때 필터링만 프론트에서 수행
useEffect(() => {
  // 필터링 처리
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

  // 미확인 댓글 수 가져오기
  const fetchUnreadCounts = async () => {
    try {
      const res = await getUnreadCounts(token);
      const map = {};
      res.data.forEach(r => {
        map[r.ticket_id] = Number(r.unread_count);
      });
      setUnreadMap(map);
    } catch (err) {
      console.error("미확인 댓글 수 불러오기 실패", err);
    }
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

  const getStatusCount = (status) => {
    return allTickets.filter(ticket => ticket.status === status).length;
  };

  const getUrgencyCount = (urgency) => {
    return allTickets.filter(ticket => ticket.urgency === urgency).length;
  };

  const getTicketTypeCount = (ticketType) => {
    return allTickets.filter(ticket => ticket.ticket_type === ticketType).length;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case '접수': return 'received';
      case '진행중': return 'in-progress';
      case '답변 완료': return 'answered';
      case '종결': return 'closed';
      default: return '';
    }
  };

  const getUrgencyClass = (urgency) => {
    switch (urgency) {
      case '높음': return 'high';
      case '보통': return 'medium';
      case '낮음': return 'low';
      default: return '';
    }
  };

  const getTicketTypeClass = (ticketType) => {
    switch (ticketType) {
      case 'SM': return 'sm';
      case 'SR': return 'sr';
      default: return '';
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
      <div className="my-ticket-list-container">
        <div className="my-ticket-header">
          <h1>내 티켓 목록</h1>
          <p className="my-ticket-desc">내가 등록한 티켓들을 관리하고 확인하세요</p>
        </div>

        <div className="my-ticket-stats">
          <div className="my-ticket-stat-card total">
            <div className="stat-label">전체</div>
            <div className="stat-value">{allTickets.length}</div>
          </div>
          <div className="my-ticket-stat-card sm">
            <div className="stat-label">SM</div>
            <div className="stat-value">{getTicketTypeCount('SM')}</div>
          </div>
          <div className="my-ticket-stat-card sr">
            <div className="stat-label">SR</div>
            <div className="stat-value">{getTicketTypeCount('SR')}</div>
          </div>
          <div className="my-ticket-stat-card received">
            <div className="stat-label">접수</div>
            <div className="stat-value">{getStatusCount('접수')}</div>
          </div>
          <div className="my-ticket-stat-card in-progress">
            <div className="stat-label">진행중</div>
            <div className="stat-value">{getStatusCount('진행중')}</div>
          </div>
          <div className="my-ticket-stat-card answered">
            <div className="stat-label">답변완료</div>
            <div className="stat-value">{getStatusCount('답변 완료')}</div>
          </div>
          <div className="my-ticket-stat-card closed">
            <div className="stat-label">종결</div>
            <div className="stat-value">{getStatusCount('종결')}</div>
          </div>
        </div>

        <div className="my-ticket-filters">
          <input
            name="keyword"
            placeholder="제목으로 검색..."
            value={filters.keyword}
            onChange={handleChange}
            className="my-ticket-search"
          />
          <select
            name="ticket_type"
            value={filters.ticket_type}
            onChange={handleChange}
            className="my-ticket-select"
          >
            <option value="">전체 타입</option>
            <option value="SM">SM</option>
            <option value="SR">SR</option>
          </select>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="my-ticket-select"
          >
            <option value="">전체 상태</option>
            <option value="접수">접수</option>
            <option value="진행중">진행중</option>
            <option value="답변 완료">답변 완료</option>
            <option value="종결">종결</option>
          </select>
          <select
            name="urgency"
            value={filters.urgency}
            onChange={handleChange}
            className="my-ticket-select"
          >
            <option value="">전체 긴급도</option>
            <option value="낮음">낮음</option>
            <option value="보통">보통</option>
            <option value="높음">높음</option>
          </select>
        </div>

        <div className="my-ticket-table-wrapper">
          {loading ? (
            <div className="my-ticket-loading">로딩 중...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="my-ticket-empty">
              {allTickets.length === 0 ? '등록된 티켓이 없습니다.' : '검색 조건에 맞는 티켓이 없습니다.'}
            </div>
          ) : (
            <table className="my-ticket-table">
              <thead>
                <tr>
                  <th>제목</th>
                  <th>티켓 타입</th>
                  <th>상태</th>
                  <th>긴급도</th>
                  <th>담당자</th>
                  <th>등록일</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map(ticket => (
                  <tr key={ticket.id} className={getTicketAgeClass(ticket.created_at)}>
                    <td className="title-cell">
                      <Link to={`/my-tickets/${ticket.id}`} className="my-ticket-link">
                        {ticket.title}
                      </Link>
                      {unreadMap[ticket.id] > 0 && (
                        <span className="unread-badge">
                          {unreadMap[ticket.id]}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`ticket-type-badge ${getTicketTypeClass(ticket.ticket_type)}`}>
                        {ticket.ticket_type}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td>
                      <span className={`urgency-badge ${getUrgencyClass(ticket.urgency)}`}>
                        {ticket.urgency}
                      </span>
                    </td>
                    <td>{ticket.assignee_name || '미배정'}</td>
                    <td>
                      <div className="date-time-container">
                        <div className="date-time">{formatDateTime(ticket.created_at)}</div>
                        <div className="time-ago">{getTimeAgo(ticket.created_at, currentTime)}</div>
                      </div>
                    </td>
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

export default MyTicketListPage;
