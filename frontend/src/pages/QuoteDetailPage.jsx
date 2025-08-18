import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CommonLayout from '../components/CommonLayout';
import { getQuote, updateQuote, deleteQuote, addQuoteItem, updateQuoteItem, deleteQuoteItem } from '../api/quotes';
import { fetchProducts } from '../api/products';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';
import { formatDateTime } from '../utils/timeUtils';
import '../css/QuoteDetailPage.css';

const QuoteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { showSuccess, showError } = useToast();
  
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showProductModal, setShowProductModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadQuote();
  }, [id]);

  const loadQuote = async () => {
    try {
      setLoading(true);
      const response = await getQuote(id);
      setQuote(response.data);
      setEditData({
        title: response.data.title,
        valid_until: response.data.valid_until,
        notes: response.data.notes
      });
    } catch (error) {
      console.error('견적 로드 실패:', error);
      showError('견적을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetchProducts({ limit: 100, active_only: true });
      setProducts(response.data.items || []);
    } catch (error) {
      console.error('제품 목록 로드 실패:', error);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateQuote(id, editData);
      await loadQuote();
      setEditing(false);
      showSuccess('견적이 수정되었습니다.');
    } catch (error) {
      console.error('견적 수정 실패:', error);
      showError('견적 수정에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditData({
      title: quote.title,
      valid_until: quote.valid_until,
      notes: quote.notes
    });
  };

  const handleDelete = async () => {
    if (!window.confirm('이 견적을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteQuote(id);
      showSuccess('견적이 삭제되었습니다.');
      navigate('/quotes');
    } catch (error) {
      console.error('견적 삭제 실패:', error);
      showError('견적 삭제에 실패했습니다.');
    }
  };

  const addProductToQuote = async (product) => {
    try {
      await addQuoteItem(id, {
        product_id: product.id,
        product_name: product.name,
        product_description: product.description,
        quantity: 1,
        unit_price: product.price || 0
      });
      await loadQuote();
      setShowProductModal(false);
      showSuccess('제품이 추가되었습니다.');
    } catch (error) {
      console.error('제품 추가 실패:', error);
      showError('제품 추가에 실패했습니다.');
    }
  };

  const updateItem = async (itemId, data) => {
    try {
      await updateQuoteItem(id, itemId, data);
      await loadQuote();
      setEditingItem(null);
      showSuccess('항목이 수정되었습니다.');
    } catch (error) {
      console.error('항목 수정 실패:', error);
      showError('항목 수정에 실패했습니다.');
    }
  };

  const removeItem = async (itemId) => {
    if (!window.confirm('이 항목을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteQuoteItem(id, itemId);
      await loadQuote();
      showSuccess('항목이 삭제되었습니다.');
    } catch (error) {
      console.error('항목 삭제 실패:', error);
      showError('항목 삭제에 실패했습니다.');
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

  const canEdit = quote && (
    quote.status === 'draft' || 
    user?.data?.role === 'admin' || 
    user?.data?.role === 'itsm_team'
  );

  if (loading) {
    return (
      <CommonLayout>
        <div className="loading">견적을 불러오는 중...</div>
      </CommonLayout>
    );
  }

  if (!quote) {
    return (
      <CommonLayout>
        <div className="error">견적을 찾을 수 없습니다.</div>
      </CommonLayout>
    );
  }

  return (
    <CommonLayout>
      <div className="quote-detail-container">
        <div className="quote-header">
          <div className="quote-title-section">
            {editing ? (
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="edit-title-input"
              />
            ) : (
              <h1>{quote.title}</h1>
            )}
            <span className={`quote-status ${getStatusClass(quote.status)}`}>
              {getStatusLabel(quote.status)}
            </span>
          </div>

          <div className="quote-actions">
            {canEdit && !editing && (
              <>
                <button onClick={handleEdit} className="btn btn-primary">
                  수정
                </button>
                <button onClick={handleDelete} className="btn btn-danger">
                  삭제
                </button>
              </>
            )}
            {editing && (
              <>
                <button onClick={handleSave} className="btn btn-primary">
                  저장
                </button>
                <button onClick={handleCancel} className="btn btn-secondary">
                  취소
                </button>
              </>
            )}
            <Link to="/quotes" className="btn btn-secondary">
              목록으로
            </Link>
          </div>
        </div>

        <div className="quote-layout">
          <div className="quote-main-content">
            {/* 견적 정보 */}
            <div className="quote-info-section">
              <h2>견적 정보</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>요청자</label>
                  <span>{quote.customer_name}</span>
                </div>
                <div className="info-item">
                  <label>이메일</label>
                  <span>{quote.customer_email}</span>
                </div>
                <div className="info-item">
                  <label>회사</label>
                  <span>{quote.customer_company || '-'}</span>
                </div>
                <div className="info-item">
                  <label>요청일</label>
                  <span>{formatDateTime(quote.created_at)}</span>
                </div>
                <div className="info-item">
                  <label>유효기간</label>
                  <span>
                    {editing ? (
                      <input
                        type="date"
                        value={editData.valid_until || ''}
                        onChange={(e) => setEditData({ ...editData, valid_until: e.target.value })}
                        className="edit-input"
                      />
                    ) : (
                      quote.valid_until ? formatDateTime(quote.valid_until) : '-'
                    )}
                  </span>
                </div>
                <div className="info-item">
                  <label>총 금액</label>
                  <span className="total-amount">{formatPrice(quote.total_amount)}</span>
                </div>
              </div>

              {quote.notes && (
                <div className="notes-section">
                  <label>비고</label>
                  {editing ? (
                    <textarea
                      value={editData.notes || ''}
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                      className="edit-textarea"
                      rows="3"
                    />
                  ) : (
                    <p>{quote.notes}</p>
                  )}
                </div>
              )}
            </div>

            {/* 견적 항목 */}
            <div className="quote-items-section">
              <div className="section-header">
                <h2>견적 항목</h2>
                {canEdit && (
                  <button
                    onClick={() => {
                      loadProducts();
                      setShowProductModal(true);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    제품 추가
                  </button>
                )}
              </div>

              {quote.items && quote.items.length > 0 ? (
                <div className="items-table-wrapper">
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>제품명</th>
                        <th>수량</th>
                        <th>단가</th>
                        <th>소계</th>
                        {canEdit && <th>액션</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {quote.items.map(item => (
                        <tr key={item.id}>
                          <td>
                            <div className="product-info">
                              <div className="product-name">{item.product_name}</div>
                              {item.product_description && (
                                <div className="product-description">{item.product_description}</div>
                              )}
                            </div>
                          </td>
                          <td>
                            {editingItem === item.id ? (
                              <input
                                type="number"
                                min="1"
                                value={editingItem.quantity}
                                onChange={(e) => setEditingItem({ ...editingItem, quantity: parseInt(e.target.value) || 0 })}
                                className="edit-input"
                              />
                            ) : (
                              item.quantity
                            )}
                          </td>
                          <td>
                            {editingItem === item.id ? (
                              <input
                                type="number"
                                min="0"
                                step="1000"
                                value={editingItem.unit_price}
                                onChange={(e) => setEditingItem({ ...editingItem, unit_price: parseInt(e.target.value) || 0 })}
                                className="edit-input"
                              />
                            ) : (
                              formatPrice(item.unit_price)
                            )}
                          </td>
                          <td>{formatPrice(item.quantity * item.unit_price)}</td>
                          {canEdit && (
                            <td>
                              {editingItem === item.id ? (
                                <>
                                  <button
                                    onClick={() => updateItem(item.id, editingItem)}
                                    className="btn btn-primary btn-sm"
                                  >
                                    저장
                                  </button>
                                  <button
                                    onClick={() => setEditingItem(null)}
                                    className="btn btn-secondary btn-sm"
                                  >
                                    취소
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setEditingItem({
                                      id: item.id,
                                      quantity: item.quantity,
                                      unit_price: item.unit_price
                                    })}
                                    className="btn btn-secondary btn-sm"
                                  >
                                    수정
                                  </button>
                                  <button
                                    onClick={() => removeItem(item.id)}
                                    className="btn btn-danger btn-sm"
                                  >
                                    삭제
                                  </button>
                                </>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-items">
                  <p>견적 항목이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 제품 선택 모달 */}
        {showProductModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>제품 선택</h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="modal-close"
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="product-list">
                  {products.map(product => (
                    <div key={product.id} className="product-item">
                      <div className="product-details">
                        <h4>{product.name}</h4>
                        <p>{product.description}</p>
                        <div className="product-meta">
                          <span className="category">{product.category}</span>
                          <span className="price">{formatPrice(product.price)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => addProductToQuote(product)}
                        className="btn btn-primary btn-sm"
                      >
                        추가
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CommonLayout>
  );
};

export default QuoteDetailPage;