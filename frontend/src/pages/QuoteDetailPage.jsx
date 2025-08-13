import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CommonLayout from '../components/CommonLayout';
import { fetchQuote, deleteQuote, updateQuote } from '../api/quotes';
import { useUser } from '../contexts/UserContext';
import '../css/QuoteDetailPage.css';

const QuoteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadQuote();
  }, [id]);

  const loadQuote = async () => {
    try {
      setLoading(true);
      const response = await fetchQuote(id);
      setQuote(response.data);
    } catch (error) {
      console.error('견적 조회 실패:', error);
      if (error.response?.status === 404) {
        alert('견적을 찾을 수 없습니다.');
        navigate('/quotes');
      } else if (error.response?.status === 403) {
        alert('접근 권한이 없습니다.');
        navigate('/quotes');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('이 견적을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteQuote(id);
      alert('견적이 삭제되었습니다.');
      navigate('/quotes');
    } catch (error) {
      console.error('견적 삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      await updateQuote(id, { status: newStatus });
      setQuote(prev => ({ ...prev, status: newStatus }));
      alert('상태가 변경되었습니다.');
    } catch (error) {
      console.error('상태 변경 실패:', error);
      alert('상태 변경에 실패했습니다.');
    } finally {
      setUpdating(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '₩0';
    return `₩${new Intl.NumberFormat('ko-KR').format(price)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
  const canEdit = quote && (quote.status === 'draft' || isAdmin);
  const canDelete = quote && (quote.status === 'draft' || isAdmin);

  if (loading) {
    return (
      <CommonLayout>
        <div className="quote-detail-container">
          <div className="loading">견적을 불러오는 중...</div>
        </div>
      </CommonLayout>
    );
  }

  if (!quote) {
    return (
      <CommonLayout>
        <div className="quote-detail-container">
          <div className="error">견적을 찾을 수 없습니다.</div>
        </div>
      </CommonLayout>
    );
  }

  return (
    <CommonLayout>
      <div className="quote-detail-container">
        {/* 헤더 */}
        <div className="quote-header">
          <div className="header-top">
            <div className="breadcrumb">
              <Link to="/quotes">견적 관리</Link>
              <span className="separator">›</span>
              <span>견적 상세</span>
            </div>
            <div className="header-actions">
              {canEdit && (
                <Link to={`/quotes/${id}/edit`} className="btn btn-primary">
                  수정
                </Link>
              )}
              {canDelete && (
                <button onClick={handleDelete} className="btn btn-danger">
                  삭제
                </button>
              )}
            </div>
          </div>
          
          <div className="quote-title-section">
            <h1>{quote.title}</h1>
            <span className={`quote-status ${getStatusClass(quote.status)}`}>
              {getStatusLabel(quote.status)}
            </span>
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="quote-info-section">
          <div className="info-grid">
            <div className="info-item">
              <label>견적번호</label>
              <span>Q{String(quote.id).padStart(6, '0')}</span>
            </div>
            <div className="info-item">
              <label>요청자</label>
              <span>{quote.customer_name}</span>
            </div>
            <div className="info-item">
              <label>이메일</label>
              <span>{quote.customer_email}</span>
            </div>
            <div className="info-item">
              <label>회사명</label>
              <span>{quote.customer_company || '-'}</span>
            </div>
            <div className="info-item">
              <label>생성일</label>
              <span>{formatDate(quote.created_at)}</span>
            </div>
            <div className="info-item">
              <label>유효기간</label>
              <span className={new Date(quote.valid_until) < new Date() ? 'expired' : ''}>
                {formatDate(quote.valid_until)}
                {new Date(quote.valid_until) < new Date() && ' (만료됨)'}
              </span>
            </div>
          </div>

          {quote.notes && (
            <div className="notes-section">
              <label>메모</label>
              <div className="notes-content">{quote.notes}</div>
            </div>
          )}
        </div>

        {/* 견적 항목 */}
        <div className="quote-items-section">
          <h2>견적 항목</h2>
          {quote.items && quote.items.length > 0 ? (
            <div className="items-table-container">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>제품명</th>
                    <th>수량</th>
                    <th>단가</th>
                    <th>합계</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="item-info">
                          <div className="item-name">{item.product_name}</div>
                          {item.product_description && (
                            <div className="item-description">{item.product_description}</div>
                          )}
                        </div>
                      </td>
                      <td>{item.quantity.toLocaleString()}개</td>
                      <td>{formatPrice(item.unit_price)}</td>
                      <td className="total-price">{formatPrice(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="total-section">
                <div className="total-amount">
                  <span>총 견적금액: </span>
                  <strong>{formatPrice(quote.total_amount)}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-items">
              <p>견적 항목이 없습니다.</p>
            </div>
          )}
        </div>

        {/* 관리자 액션 (상태 변경) */}
        {isAdmin && (
          <div className="admin-actions-section">
            <h3>관리자 액션</h3>
            <div className="status-actions">
              <button
                onClick={() => handleStatusChange('pending')}
                disabled={updating || quote.status === 'pending'}
                className="btn btn-warning"
              >
                검토중으로 변경
              </button>
              <button
                onClick={() => handleStatusChange('approved')}
                disabled={updating || quote.status === 'approved'}
                className="btn btn-success"
              >
                승인
              </button>
              <button
                onClick={() => handleStatusChange('rejected')}
                disabled={updating || quote.status === 'rejected'}
                className="btn btn-danger"
              >
                거절
              </button>
            </div>
          </div>
        )}

        {/* 하단 네비게이션 */}
        <div className="bottom-nav">
          <Link to="/quotes" className="btn btn-secondary">
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    </CommonLayout>
  );
};

export default QuoteDetailPage;



