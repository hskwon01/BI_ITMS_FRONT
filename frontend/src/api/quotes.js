import API from './api';

// 견적 관련 API
export const fetchQuotes = (params = {}) => API.get('/quotes', { params });
export const fetchQuote = (id) => API.get(`/quotes/${id}`);
export const createQuote = (data) => API.post('/quotes', data);
export const updateQuote = (id, data) => API.put(`/quotes/${id}`, data);
export const deleteQuote = (id) => API.delete(`/quotes/${id}`);

// 견적 항목 관련 API
export const addQuoteItem = (quoteId, data) => API.post(`/quotes/${quoteId}/items`, data);
export const updateQuoteItem = (quoteId, itemId, data) => API.put(`/quotes/${quoteId}/items/${itemId}`, data);
export const deleteQuoteItem = (quoteId, itemId) => API.delete(`/quotes/${quoteId}/items/${itemId}`);

