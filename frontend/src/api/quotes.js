import API from './api';

// 견적 목록 조회
export const getQuotes = (params = {}) => API.get('/quotes', { params });

// 견적 상세 조회
export const getQuote = (id) => API.get(`/quotes/${id}`);

// 견적 생성
export const createQuote = (data) => API.post('/quotes', data);

// 견적 수정
export const updateQuote = (id, data) => API.put(`/quotes/${id}`, data);

// 견적 삭제
export const deleteQuote = (id) => API.delete(`/quotes/${id}`);

// 견적 항목 추가
export const addQuoteItem = (quoteId, data) => API.post(`/quotes/${quoteId}/items`, data);

// 견적 항목 수정
export const updateQuoteItem = (quoteId, itemId, data) => API.put(`/quotes/${quoteId}/items/${itemId}`, data);

// 견적 항목 삭제
export const deleteQuoteItem = (quoteId, itemId) => API.delete(`/quotes/${quoteId}/items/${itemId}`);

// 관리자용: 견적 요청 목록 조회
export const getQuoteRequests = (params = {}) => API.get('/quotes/admin/requests', { params });

// 관리자용: 견적 요청 승인
export const approveQuoteRequest = (id) => API.post(`/quotes/admin/requests/${id}/approve`);

// 관리자용: 견적 요청 거부
export const rejectQuoteRequest = (id, reason) => API.post(`/quotes/admin/requests/${id}/reject`, { reason });




