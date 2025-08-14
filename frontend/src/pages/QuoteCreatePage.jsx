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
    const existingIndex = selectedItems.findIndex(item => item.product_id === product.id);
    
    if (existingIndex >= 0) {
      // 이미 있는 제품이면 수량 증가
      const newItems = [...selectedItems];
      newItems[existingIndex].quantity += 1;
      newItems[existingIndex].total_price = newItems[existingIndex].quantity * newItems[existingIndex].unit_price;
      setSelectedItems(newItems);
    } else {
      // 새로운 제품 추가
      const newItem = {
        product_id: product.id,
        product_name: product.name,
        description: product.description || '',
        quantity: 1,
        unit_price: Number(product.base_price),
        unit: product.unit,
        total_price: Number(product.base_price)
      };
      setSelectedItems([...selectedItems, newItem]);
    }
    setShowProductModal(false);
  };

  const updateItemQuantity = (index, quantity) => {
    if (quantity <= 0) return;
    
    const newItems = [...selectedItems];
    newItems[index].quantity = quantity;
    newItems[index].total_price = quantity * newItems[index].unit_price;
    setSelectedItems(newItems);
  };

  const updateItemPrice = (index, price) => {
    if (price < 0) return;
    
    const newItems = [...selectedItems];
    newItems[index].unit_price = Number(price);
    newItems[index].total_price = newItems[index].quantity * Number(price);
    setSelectedItems(newItems);
  };

  const removeItem = (index) => {
    const newItems = selectedItems.filter((_, i) => i !== index);
    setSelectedItems(newItems);
  };

  const getTotalAmount = () => {
    return selectedItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  const formatPrice = (price) => {
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
                <label htmlFor="customer_company">회사명</label>
                <input
                  type="text"
                  id="customer_company"
                  value={formData.customer_company}
                  onChange={(e) => setFormData({ ...formData, customer_company: e.target.value })}
                  placeholder="회사명"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">메모</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="추가 요청사항이나 메모를 입력하세요"
                rows={3}
              />
            </div>
          </div>

          {/* 제품 선택 */}
          <div className="form-section">
            <div className="section-header">
              <h2>제품 선택</h2>
              <button
                type="button"
                onClick={() => setShowProductModal(true)}
                className="btn btn-primary"
              >
                제품 추가
              </button>
            </div>

            {selectedItems.length === 0 ? (
              <div className="empty-items">
                <p>선택된 제품이 없습니다. 제품을 추가해주세요.</p>
              </div>
            ) : (
              <div className="selected-items">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>제품명</th>
                      <th>수량</th>
                      <th>단가</th>
                      <th>합계</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="item-info">
                            <div className="item-name">{item.product_name}</div>
                            {item.description && (
                              <div className="item-description">{item.description}</div>
                            )}
                          </div>
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(index, Number(e.target.value))}
                            min="1"
                            className="quantity-input"
                          />
                          <span className="unit">{item.unit}</span>
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => updateItemPrice(index, e.target.value)}
                            min="0"
                            step="0.01"
                            className="price-input"
                          />
                        </td>
                        <td className="total-price">
                          ₩{formatPrice(item.total_price)}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="btn btn-danger btn-sm"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="total-section">
                  <div className="total-amount">
                    <strong>총 견적금액: ₩{formatPrice(getTotalAmount())}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 제출 버튼 */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/quotes')}
              className="btn btn-secondary"
            >
              취소
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
              className="btn btn-outline"
            >
              {loading ? '저장 중...' : '임시저장'}
            </button>
            <button
              type="submit"
              disabled={loading || selectedItems.length === 0}
              className="btn btn-primary"
            >
              {loading ? '생성 중...' : '견적 요청'}
            </button>
          </div>
        </form>

        {/* 제품 선택 모달 */}
        {showProductModal && (
          <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>제품 선택</h2>
                <button onClick={() => setShowProductModal(false)} className="modal-close">×</button>
              </div>
              
              <div className="modal-body">
                {/* 제품 필터 */}
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

                {/* 제품 목록 */}
                <div className="products-grid">
                  {products.map(product => (
                    <div key={product.id} className="product-card">
                      <div className="product-info">
                        <h3>{product.name}</h3>
                        <p className="product-category">{product.category}</p>
                        {product.description && (
                          <p className="product-description">{product.description}</p>
                        )}
                        <div className="product-price">
                          ₩{formatPrice(product.base_price)} / {product.unit}
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

                {products.length === 0 && (
                  <div className="no-products">
                    <p>조건에 맞는 제품이 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </CommonLayout>
  );
};

export default QuoteCreatePage;




