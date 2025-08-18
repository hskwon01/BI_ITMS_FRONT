import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { fetchProducts, createProduct, updateProduct, deleteProduct, fetchCategories } from '../api/products';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';
import '../css/AdminProductsPage.css';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    base_price: '',
    unit: '개'
  });
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    active_only: true
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;
  const { user } = useUser();
  const { showSuccess, showError, showConfirm } = useToast();

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [page, filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * pageSize;
      const response = await fetchProducts({
        limit: pageSize,
        offset,
        ...filters
      });
      setProducts(response.data.items || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('제품 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetchCategories();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('카테고리 로드 실패:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.base_price) {
      showError('제품명, 카테고리, 가격을 모두 입력해주세요.');
      return;
    }

    const price = Number(formData.base_price);
    if (price < 0 || price > 9999999999999.99) {
      showError('가격은 0 이상 9,999,999,999,999.99원 이하여야 합니다.');
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
        showSuccess('제품이 수정되었습니다.');
      } else {
        await createProduct(formData);
        showSuccess('제품이 등록되었습니다.');
      }
      
      setShowModal(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        category: '',
        description: '',
        base_price: '',
        unit: '개'
      });
      loadProducts();
      loadCategories();
    } catch (error) {
      console.error('제품 저장 실패:', error);
      showError('저장에 실패했습니다.');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description || '',
      base_price: product.base_price,
      unit: product.unit
    });
    setShowModal(true);
  };

  const handleDelete = async (product) => {
    showConfirm(
      `"${product.name}" 제품을 비활성화하시겠습니까?`,
      async () => {
        try {
          await deleteProduct(product.id);
          showSuccess('제품이 비활성화되었습니다.');
          loadProducts();
        } catch (error) {
          console.error('제품 삭제 실패:', error);
          showError('삭제에 실패했습니다.');
        }
      }
    );
  };

  const handleToggleActive = async (product) => {
    try {
      await updateProduct(product.id, { is_active: !product.is_active });
      showSuccess(`제품이 ${!product.is_active ? '활성화' : '비활성화'}되었습니다.`);
      loadProducts();
    } catch (error) {
      console.error('상태 변경 실패:', error);
      showError('상태 변경에 실패했습니다.');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  // 권한 확인
  if (!user?.data || (user.data.role !== 'admin' && user.data.role !== 'itsm_team')) {
    return (
      <div className="admin-products-container">
        <div className="access-denied">
          <h2>접근 권한이 없습니다</h2>
          <p>이 페이지는 관리자만 접근할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
      <div className="admin-products-container">
        <div className="admin-products-header">
          <p>견적 시스템에서 사용할 제품을 관리합니다.</p>
        </div>

        <div className="admin-products-toolbar">
          <div className="filters">
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="filter-select"
            >
              <option value="">모든 카테고리</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <input
              type="text"
              placeholder="제품명 또는 설명으로 검색..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="search-input"
            />
            
            <label className="active-filter">
              <input
                type="checkbox"
                checked={filters.active_only}
                onChange={(e) => setFilters({ ...filters, active_only: e.target.checked })}
              />
              활성 제품만 보기
            </label>
          </div>

          <button
            onClick={() => {
              setEditingProduct(null);
              setFormData({
                name: '',
                category: '',
                description: '',
                base_price: '',
                unit: '개'
              });
              setShowModal(true);
            }}
            className="btn btn-primary"
          >
            새 제품 추가
          </button>
        </div>

        {loading ? (
          <div className="loading">제품 목록을 불러오는 중...</div>
        ) : (
          <>
            <div className="products-table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>제품명</th>
                    <th>카테고리</th>
                    <th>가격</th>
                    <th>단위</th>
                    <th>상태</th>
                    <th>등록일</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className={!product.is_active ? 'inactive' : ''}>
                      <td>
                        <div className="product-name">
                          {product.name}
                          {product.description && (
                            <div className="product-description">{product.description}</div>
                          )}
                        </div>
                      </td>
                      <td>{product.category}</td>
                      <td className="price">₩{formatPrice(product.base_price)}</td>
                      <td>{product.unit}</td>
                      <td>
                        <span className={`status ${product.is_active ? 'active' : 'inactive'}`}>
                          {product.is_active ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td>{new Date(product.created_at).toLocaleDateString('ko-KR')}</td>
                      <td>
                        <div className="actions">
                          <button
                            onClick={() => handleEdit(product)}
                            className="btn btn-sm btn-secondary"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleToggleActive(product)}
                            className={`btn btn-sm ${product.is_active ? 'btn-warning' : 'btn-success'}`}
                          >
                            {product.is_active ? '비활성화' : '활성화'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

        {/* 제품 추가/수정 모달 */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingProduct ? '제품 수정' : '새 제품 추가'}</h2>
                <button onClick={() => setShowModal(false)} className="modal-close">×</button>
              </div>
              
              <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-group">
                  <label htmlFor="name">제품명 *</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="제품명을 입력하세요"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">카테고리 *</label>
                  <input
                    type="text"
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    placeholder="카테고리를 입력하세요"
                    list="categories"
                  />
                  <datalist id="categories">
                    {categories.map(category => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>

                <div className="form-group">
                  <label htmlFor="description">설명</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="제품 설명을 입력하세요"
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="base_price">가격 *</label>
                    <input
                      type="number"
                      id="base_price"
                      value={formData.base_price}
                      onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="unit">단위</label>
                    <input
                      type="text"
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="개"
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                    취소
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingProduct ? '수정' : '추가'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
};

export default AdminProductsPage;
