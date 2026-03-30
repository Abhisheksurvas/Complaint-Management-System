import { toast } from 'react-hot-toast';

export const logout = (navigate) => {
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  toast.success('Logged out successfully!');
  navigate('/', { replace: true });
};