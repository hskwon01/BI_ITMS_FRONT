import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyTickets, getUnreadCounts } from '../api/ticket';
import UserLayout from '../components/UserLayout';
import '../css/MyTicketListPage.css';

const MyTicketListPage = () => {
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({ status: '', urgency: '', keyword: '' });
  const [unreadMap, setUnreadMap] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await getMyTickets(token, filters);
      setTickets(res.data);
    } catch {
      alert('티켓 목록 불러오기 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchTickets();

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

    fetchData();
  }, [filters]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const getStatusCount = (status) => {
    return tickets.filter(ticket => ticket.status === status).length;
  };

  const getUrgencyCount = (urgency) => {
    return tickets.filter(ticket => ticket.urgency === urgency).length;
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

  return (
    <UserLayout>
      <div className="my-ticket-list-container">
        <div className="my-ticket-header">
          <h1>내 티켓 목록</h1>
          <p className="my-ticket-desc">내가 등록한 티켓들을 관리하고 확인하세요</p>
        </div>

        <div className="my-ticket-stats">
          <div className="my-ticket-stat-card total">
            <div className="stat-label">전체</div>
            <div className="stat-value">{tickets.length}</div>
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
          ) : tickets.length === 0 ? (
            <div className="my-ticket-empty">
              등록된 티켓이 없습니다.
            </div>
          ) : (
            <table className="my-ticket-table">
              <thead>
                <tr>
                  <th>제목</th>
                  <th>상태</th>
                  <th>긴급도</th>
                  <th>담당자</th>
                  <th>등록일</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr key={ticket.id}>
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
                    <td>{new Date(ticket.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default MyTicketListPage;
