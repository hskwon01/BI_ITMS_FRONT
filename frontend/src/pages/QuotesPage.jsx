import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CommonLayout from '../components/CommonLayout';
import { fetchQuotes, deleteQuote } from '../api/quotes';
import { useUser } from '../contexts/UserContext';
import { ClipboardList } from 'lucide-react';
import '../css/QuotesPage.css';

const QuotesPage = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;
  const { user } = useUser();

  useEffect(() => {
    loadQuotes();
  }, [page, filters]);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * pageSize;
      const response = await fetchQuotes({
        limit: pageSize,
        offset,
        ...filters
      });
      setQuotes(response.data.items || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('견적 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quote) => {
    if (!window.confirm(`"${quote.title}" 견적을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteQuote(quote.id);
      alert('견적이 삭제되었습니다.');
      loadQuotes();
    } catch (error) {
      console.error('견적 삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const formatPrice = (price) => {
    if (!price) return '₩0';
    return `₩${new Intl.NumberFormat('ko-KR').format(price)}`;
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'draft': '임시저장',
      'pending': '검토중',
      'approved': '승인됨',
      'rejected': '거절됨'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      'draft': 'status-draft',
      'pending': 'status-pending',
      'approved': 'status-approved',
      'rejected': 'status-rejected'
    };
    return classMap[status] || 'status-draft';
  };

  const isAdmin = user?.data?.role === 'admin' || user?.data?.role === 'itsm_team';

  return (
    <CommonLayout>
      <div className="quotes-container">
        <div className="quotes-header">
          <h1>견적 관리</h1>
          <p>제품 견적을 요청하고 관리할 수 있습니다.</p>
        </div>

        <div className="quotes-toolbar">
          <div className="filters">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="filter-select"
            >
              <option value="">모든 상태</option>
              <option value="draft">임시저장</option>
              <option value="pending">검토중</option>
              <option value="approved">승인됨</option>
              <option value="rejected">거절됨</option>
            </select>
            
            <input
              type="text"
              placeholder="견적 제목으로 검색..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="search-input"
            />
          </div>

          <Link to="/quotes/create" className="btn btn-primary">
            새 견적 요청
          </Link>
        </div>

        {loading ? (
          <div className="loading">견적 목록을 불러오는 중...</div>
        ) : quotes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><ClipboardList size={48} /></div>
            <h3>견적이 없습니다</h3>
            <p>아직 요청한 견적이 없습니다. 새로운 견적을 요청해보세요.</p>
            <Link to="/quotes/create" className="btn btn-primary">
              첫 견적 요청하기
            </Link>
          </div>
        ) : (
          <>
            <div className="quotes-grid">
              {quotes.map(quote => (
                <div key={quote.id} className="quote-card">
                  <div className="quote-header">
                    <div className="quote-title">
                      <Link to={`/quotes/${quote.id}`}>
                        {quote.title}
                      </Link>
                    </div>
                    <span className={`quote-status ${getStatusClass(quote.status)}`}>
                      {getStatusLabel(quote.status)}
                    </span>
                  </div>

                  <div className="quote-meta">
                    {isAdmin && (
                      <div className="quote-customer">
                        <strong>{quote.customer_name}</strong>
                        {quote.customer_company && (
                          <span className="company">({quote.customer_company})</span>
                        )}
                      </div>
                    )}
                    
                    <div className="quote-amount">
                      {formatPrice(quote.total_amount)}
                    </div>
                    
                    <div className="quote-dates">
                      <div>생성일: {new Date(quote.created_at).toLocaleDateString('ko-KR')}</div>
                      {quote.valid_until && (
                        <div className="valid-until">
                          유효기간: {new Date(quote.valid_until).toLocaleDateString('ko-KR')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="quote-actions">
                    <Link to={`/quotes/${quote.id}`} className="btn btn-secondary btn-sm">
                      상세보기
                    </Link>
                    {(quote.status === 'draft' || isAdmin) && (
                      <Link to={`/quotes/${quote.id}/edit`} className="btn btn-primary btn-sm">
                        수정
                      </Link>
                    )}
                    {(quote.status === 'draft' || isAdmin) && (
                      <button
                        onClick={() => handleDelete(quote)}
                        className="btn btn-danger btn-sm"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary"
              >
                이전
              </button>
              <span className="page-info">
                {page} / {Math.max(1, Math.ceil(total / pageSize))} 페이지 (총 {total}개)
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / pageSize)}
                className="btn btn-secondary"
              >
                다음
              </button>
            </div>
          </>
        )}
      </div>
    </CommonLayout>
  );
};

export default QuotesPage;



