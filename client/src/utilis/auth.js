// Authentication utility functions

export const loginUser = async (email, password, userType) => {
  try {
    // Attempt backend login first. If backend is missing or returns non-JSON
    // we'll fall back to localStorage-based auth so the app works without a backend.
    let response;
    try {
      response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, userType }),
      });
    } catch (networkError) {
      // Network error (server not running) - fallthrough to local fallback below
      response = null;
    }

    // Normalize inputs for local lookup
    const emailNorm = (email || '').trim().toLowerCase();
    const userTypeNorm = (userType || '').toLowerCase();

    if (!response) {
      // No response - backend unreachable -> local fallback
      const usersJson = localStorage.getItem('localUsers');
      const users = usersJson ? JSON.parse(usersJson) : [];
      const found = users.find(u => u.email === emailNorm && u.password === password && u.userType === userTypeNorm);
      if (!found) throw new Error('No backend available and no matching local user found.');
      const token = 'local-' + Date.now();
      const userObj = { name: found.name, email: found.email, userType: found.userType };
      localStorage.setItem('userToken', token);
      localStorage.setItem('userType', userTypeNorm);
      localStorage.setItem('userData', JSON.stringify(userObj));
      return { token, user: userObj };
    }

    // We have a response from backend. Read headers and body safely.
    const raw = await response.text();
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    let data = null;
    if (isJson) {
      try { data = raw ? JSON.parse(raw) : null; } catch (e) { data = null; }
    }

    const looksLikeHtml = raw && raw.trim().startsWith('<');
    if (looksLikeHtml || !isJson) {
      // Backend responded with HTML/plain text (likely dev server). Use local fallback.
      const usersJson = localStorage.getItem('localUsers');
      const users = usersJson ? JSON.parse(usersJson) : [];
      const found = users.find(u => u.email === emailNorm && u.password === password && u.userType === userTypeNorm);
      if (!found) throw new Error('No backend available and no matching local user found.');
      const token = 'local-' + Date.now();
      const userObj = { name: found.name, email: found.email, userType: found.userType };
      localStorage.setItem('userToken', token);
      localStorage.setItem('userType', userTypeNorm);
      localStorage.setItem('userData', JSON.stringify(userObj));
      return { token, user: userObj };
    }

    // If response was not OK bubble up the backend error
    if (!response.ok) {
      const msg = (data && data.message) || raw || 'Login failed';
      throw new Error(msg);
    }

    // Successful backend login
    if (!data) data = {};
    localStorage.setItem('userToken', data.token);
    localStorage.setItem('userType', userTypeNorm);
    localStorage.setItem('userData', JSON.stringify(data.user));
    return data;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (name, email, password, userType) => {
  try {
    // Attempt backend registration first. If backend is missing we'll register locally.
    let response;
    try {
      response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, userType }),
      });
    } catch (networkError) {
      response = null;
    }

    const emailNorm = (email || '').trim().toLowerCase();
    const userTypeNorm = (userType || '').toLowerCase();

    if (!response) {
      // No backend - register locally
      const usersJson = localStorage.getItem('localUsers');
      const users = usersJson ? JSON.parse(usersJson) : [];
      const exists = users.find(u => u.email === emailNorm);
      if (exists) throw new Error('User already exists (local). Please login.');
      const newUser = { name, email: emailNorm, password, userType: userTypeNorm };
      users.push(newUser);
      localStorage.setItem('localUsers', JSON.stringify(users));
      const token = 'local-' + Date.now();
      const userObj = { name, email: emailNorm, userType: userTypeNorm };
      localStorage.setItem('userToken', token);
      localStorage.setItem('userType', userTypeNorm);
      localStorage.setItem('userData', JSON.stringify(userObj));
      return { token, user: userObj };
    }

    const raw = await response.text();
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    let data = null;
    if (isJson) {
      try { data = raw ? JSON.parse(raw) : null; } catch (e) { data = null; }
    }

    const looksLikeHtml = raw && raw.trim().startsWith('<');
    if (looksLikeHtml || !isJson) {
      // Backend returned HTML/plain text - fallback to local registration
      const usersJson = localStorage.getItem('localUsers');
      const users = usersJson ? JSON.parse(usersJson) : [];
      const exists = users.find(u => u.email === emailNorm);
      if (exists) throw new Error('User already exists (local). Please login.');
      const newUser = { name, email: emailNorm, password, userType: userTypeNorm };
      users.push(newUser);
      localStorage.setItem('localUsers', JSON.stringify(users));
      const token = 'local-' + Date.now();
      const userObj = { name, email: emailNorm, userType: userTypeNorm };
      localStorage.setItem('userToken', token);
      localStorage.setItem('userType', userTypeNorm);
      localStorage.setItem('userData', JSON.stringify(userObj));
      return { token, user: userObj };
    }

    if (!response.ok) {
      const msg = (data && data.message) || raw || 'Registration failed';
      throw new Error(msg);
    }

    if (!data) data = {};
    localStorage.setItem('userToken', data.token);
    localStorage.setItem('userType', userTypeNorm);
    localStorage.setItem('userData', JSON.stringify(data.user));
    return data;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userType');
  localStorage.removeItem('userData');
};

export const getUserData = () => {
  const userDataString = localStorage.getItem('userData');
  return userDataString ? JSON.parse(userDataString) : null;
};

export const getUserType = () => {
  return localStorage.getItem('userType');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('userToken');
};