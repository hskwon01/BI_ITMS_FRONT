import API from './api';

export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
export const getMe = () => API.get('/auth/me');
export const sendVerificationCode = (email) => API.post('/auth/send-verification', { email });
export const verifyEmail = (email, verificationCode) => API.post('/auth/verify-email', { email, verificationCode });
