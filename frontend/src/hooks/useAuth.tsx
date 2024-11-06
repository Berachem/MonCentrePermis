import { useState, useEffect } from 'react';

function useAuth() {
  const [userRole, setUserRole] = useState('visitor');

  useEffect(() => {
    const token = sessionStorage.getItem('jwtToken');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1])); // décode le token JWT
      setUserRole(decodedToken.user || 'visitor'); // Utilise la valeur user (visitor, student, teacher) contenue dans le token
    }
  }, []);
  console.log('user role : ', userRole);
  return { userRole };
}

export default useAuth;
