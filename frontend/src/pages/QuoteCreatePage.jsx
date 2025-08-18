import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonLayout from '../components/CommonLayout';
import { createQuote, addQuoteItem } from '../api/quotes';
import { fetchProducts } from '../api/products';
import { useUser } from '../contexts/UserContext';
import '../css/QuoteCreatePage.css';

const QuoteCreatePage = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [formData, setFormData] = useState({
    title: '',
    customer_name: user?.data?.name || '',
    customer_email: user?.data?.email || '',
    customer_company: user?.data?.company || '',
    valid_until: '',
    notes: ''
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productFilters, setProductFilters] = useState({
    category: '',
    search: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [productFilters]);

  useEffect(() => {
    // 기본 유효기간을 30일 후로 설정
    const defaultValidUntil = new Date();
    defaultValidUntil.setDate(defaultValidUntil.getDate() + 30);
    setFormData(prev => ({
      ...prev,
      valid_until: defaultValidUntil.toISOString().split('T')[0]
    }));
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetchProducts({
        limit: 100,
        active_only: true,
        ...productFilters
      });
      const items = response.data.items || [];
      setProducts(items);

      // 카테고리 목록 추출
      const uniqueCategories = [...new Set(items.map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('제품 목록 로드 실패:', error);
    }
  };

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    
    if (!isDraft && !formData.title.trim()) {
      alert('견적 제목을 입력해주세요.');
      return;
    }

    if (!isDraft && selectedItems.length === 0) {
      alert('최소 1개 이상의 제품을 선택해주세요.');
      return;
    }

    try {
      setLoading(true);

      // 견적서 생성 (임시저장인 경우 status를 'draft'로 설정)
      const quoteData = isDraft ? { ...formData, status: 'draft' } : formData;
      const quoteResponse = await createQuote(quoteData);
      const quoteId = quoteResponse.data.id;

      // 견적 항목들 추가 (임시저장인 경우에도 항목이 있으면 추가)
      if (selectedItems.length > 0) {
        for (const item of selectedItems) {
          await addQuoteItem(quoteId, {
            product_id: item.product_id,
            product_name: item.product_name,
            product_description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price
          });
        }
      }

      alert(isDraft ? '견적이 임시저장되었습니다.' : '견적이 성공적으로 생성되었습니다.');
      navigate(`/quotes/${quoteId}`);
    } catch (error) {
      console.error('견적 생성 실패:', error);
      alert('견적 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const addProductToQuote = (product) => {
    const existingItem = selectedItems.find(item => item.product_id === product.id);
    
    if (existingItem) {
      setSelectedItems(prev => prev.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setSelectedItems(prev => [...prev, {
        product_id: product.id,
        product_name: product.name,
        description: product.description,
        quantity: 1,
        unit_price: product.price || 0
      }]);
    }
  };

  const updateItemQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setSelectedItems(prev => prev.filter(item => item.product_id !== productId));
    } else {
      setSelectedItems(prev => prev.map(item => 
        item.product_id === productId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const updateItemPrice = (productId, price) => {
    setSelectedItems(prev => prev.map(item => 
      item.product_id === productId 
        ? { ...item, unit_price: price }
        : item
    ));
  };

  const removeItem = (productId) => {
    setSelectedItems(prev => prev.filter(item => item.product_id !== productId));
  };

  const getTotalPrice = () => {
    return selectedItems.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  };

  const formatPrice = (price) => {
    if (!price) return '₩0';
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <CommonLayout>
      <div className="quote-create-container">
        <div className="quote-create-header">
          <h1>새 견적 요청</h1>
          <p>제품을 선택하여 견적을 요청하세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="quote-create-form">
          {/* 기본 정보 */}
          <div className="form-section">
            <h2>기본 정보</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="title">견적 제목 *</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="견적 제목을 입력하세요"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="valid_until">유효기간</label>
                <input
                  type="date"
                  id="valid_until"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="customer_name">요청자명</label>
                <input
                  type="text"
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="요청자명"
                />
              </div>

              <div className="form-group">
                <label htmlFor="customer_email">이메일</label>
                <input
                  type="email"
                  id="customer_email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  placeholder="이메일"
                />
              </div>

              <div className="form-group">
                <label htmlFor="customer_company">회사명</label>
                <input
                  type="text"
                  id="customer_company"
                  value={formData.customer_company}
                  onChange={(e) => setFormData({ ...formData, customer_company: e.target.value })}
                  placeholder="회사명"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="notes">비고</label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="추가 요청사항이나 비고를 입력하세요"
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* 제품 선택 */}
          <div className="form-section">
            <div className="section-header">
              <h2>제품 선택</h2>
              <button
                type="button"
                onClick={() => setShowProductModal(true)}
                className="btn btn-secondary"
              >
                제품 추가
              </button>
            </div>

            {selectedItems.length === 0 ? (
              <div className="empty-state">
                <p>선택된 제품이 없습니다. 제품 추가 버튼을 클릭하여 제품을 선택하세요.</p>
              </div>
            ) : (
              <div className="selected-items">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>제품명</th>
                      <th>수량</th>
                      <th>단가</th>
                      <th>소계</th>
                      <th>액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.map(item => (
                      <tr key={item.product_id}>
                        <td>
                          <div className="product-info">
                            <div className="product-name">{item.product_name}</div>
                            <div className="product-description">{item.description}</div>
                          </div>
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(item.product_id, parseInt(e.target.value) || 0)}
                            className="quantity-input"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={item.unit_price}
                            onChange={(e) => updateItemPrice(item.product_id, parseInt(e.target.value) || 0)}
                            className="price-input"
                          />
                        </td>
                        <td>₩{formatPrice(item.quantity * item.unit_price)}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => removeItem(item.product_id)}
                            className="btn btn-danger btn-sm"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="total-label">총 금액</td>
                      <td className="total-amount">₩{formatPrice(getTotalPrice())}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div className="form-actions">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
              className="btn btn-secondary"
            >
              임시저장
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? '처리 중...' : '견적 요청'}
            </button>
          </div>
        </form>

        {/* 제품 선택 모달 */}
        {showProductModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>제품 선택</h3>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="modal-close"
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="product-filters">
                  <select
                    value={productFilters.category}
                    onChange={(e) => setProductFilters({ ...productFilters, category: e.target.value })}
                    className="filter-select"
                  >
                    <option value="">모든 카테고리</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  
                  <input
                    type="text"
                    placeholder="제품명으로 검색..."
                    value={productFilters.search}
                    onChange={(e) => setProductFilters({ ...productFilters, search: e.target.value })}
                    className="search-input"
                  />
                </div>

                <div className="product-list">
                  {products.map(product => (
                    <div key={product.id} className="product-item">
                      <div className="product-details">
                        <h4>{product.name}</h4>
                        <p>{product.description}</p>
                        <div className="product-meta">
                          <span className="category">{product.category}</span>
                          <span className="price">₩{formatPrice(product.price)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
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

export default QuoteCreatePage;