import API from './api';

export const login = (loginData) => API.post('/auth/login', loginData);
export const register = (registerData) => API.post('/auth/register', registerData);
export const getMe = () => API.get('/auth/me');
export const sendVerificationCode = (email) => API.post('/auth/send-verification', { email });
export const verifyEmail = (email, verificationCode) => {
  return API.post('/auth/verify-email', {
    email: email,
    verificationCode: verificationCode
  }, {
    headers: {
      'Content-Type': 'application/json'
      }
    }).catch(error => {
      throw error;
    });
};
  