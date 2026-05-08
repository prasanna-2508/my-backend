const API_URL = 'http://localhost:5000/api';

let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let authToken = localStorage.getItem('token') || null;

document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  setupForms();
});

function updateAuthUI() {
  const navUser = document.getElementById('nav-user');
  if (!navUser) return;
  
  if (currentUser && authToken) {
    navUser.innerHTML = `
      <div class="user-avatar">${currentUser.name.charAt(0).toUpperCase()}</div>
      <span style="color:white;font-weight:600;">${currentUser.name}</span>
      <button class="btn-nav btn-nav-outline" onclick="logout()">Logout</button>
    `;
  } else {
    navUser.innerHTML = `
      <a href="login.html" class="btn-nav btn-nav-outline">Login</a>
      <a href="register.html" class="btn-nav btn-nav-primary">Register</a>
    `;
  }
}

function setupForms() {
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await register({
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        password: document.getElementById('password').value
      });
    });
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await login({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      });
    });
  }

  const otpForm = document.getElementById('otp-form');
  if (otpForm) {
    otpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await sendOTP(document.getElementById('phone').value);
    });
  }

  const verifyOtpForm = document.getElementById('verify-otp-form');
  if (verifyOtpForm) {
    verifyOtpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await verifyOTP(document.getElementById('verify-phone').value, document.getElementById('otp').value);
    });
  }

  const forgotForm = document.getElementById('forgot-form');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await forgotPassword(document.getElementById('email').value);
    });
  }

  const resetForm = document.getElementById('reset-form');
  if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await resetPassword({
        email: document.getElementById('reset-email').value,
        otp: document.getElementById('reset-otp').value,
        newPassword: document.getElementById('new-password').value
      });
    });
  }
}

async function register(data) {
  showLoading('Creating your account...');
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    hideLoading();
    
    if (result.success) {
      showAlert('Account created successfully! Redirecting...', 'success');
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data));
      setTimeout(() => window.location.href = 'dashboard.html', 1500);
    } else {
      showAlert(result.message || 'Registration failed', 'error');
    }
  } catch (err) {
    hideLoading();
    showAlert('Network error. Please try again.', 'error');
  }
}

async function login(data) {
  showLoading('Logging in...');
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    hideLoading();
    
    if (result.success) {
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data));
      window.location.href = 'dashboard.html';
    } else {
      showAlert(result.message || 'Login failed', 'error');
    }
  } catch (err) {
    hideLoading();
    showAlert('Network error. Please try again.', 'error');
  }
}

async function sendOTP(phone) {
  showLoading('Sending OTP...');
  try {
    const res = await fetch(`${API_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    const result = await res.json();
    hideLoading();
    
    if (result.success) {
      document.getElementById('otp-section').style.display = 'block';
      document.getElementById('verify-phone').value = phone;
      if (result.data.otp) {
        document.getElementById('demo-otp').textContent = result.data.otp;
        document.getElementById('demo-otp-display').style.display = 'block';
      }
      showAlert('OTP sent to your phone!', 'success');
    } else {
      showAlert(result.message, 'error');
    }
  } catch (err) {
    hideLoading();
    showAlert('Network error', 'error');
  }
}

async function verifyOTP(phone, otp) {
  showLoading('Verifying OTP...');
  try {
    const res = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });
    const result = await res.json();
    hideLoading();
    
    if (result.success) {
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data));
      window.location.href = 'dashboard.html';
    } else {
      showAlert(result.message, 'error');
    }
  } catch (err) {
    hideLoading();
    showAlert('Network error', 'error');
  }
}

async function forgotPassword(email) {
  showLoading('Sending reset OTP...');
  try {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const result = await res.json();
    hideLoading();
    
    if (result.success) {
      document.getElementById('reset-section').style.display = 'block';
      document.getElementById('reset-email').value = email;
      if (result.data.otp) {
        document.getElementById('reset-demo-otp').textContent = result.data.otp;
        document.getElementById('reset-demo-display').style.display = 'block';
      }
      showAlert('Reset OTP sent to your email!', 'success');
    } else {
      showAlert(result.message, 'error');
    }
  } catch (err) {
    hideLoading();
    showAlert('Network error', 'error');
  }
}

async function resetPassword(data) {
  showLoading('Resetting password...');
  try {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    hideLoading();
    
    if (result.success) {
      showAlert('Password reset successful! Redirecting to login...', 'success');
      setTimeout(() => window.location.href = 'login.html', 2000);
    } else {
      showAlert(result.message, 'error');
    }
  } catch (err) {
    hideLoading();
    showAlert('Network error', 'error');
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

function showAlert(message, type = 'info') {
  const container = document.getElementById('alert-container') || document.body;
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    <span>${message}</span>
  `;
  container.insertBefore(alert, container.firstChild);
  setTimeout(() => alert.remove(), 5000);
}

function showLoading(text = 'Loading...') {
  let overlay = document.getElementById('loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div class="spinner"></div>
      <div class="loading-text">${text}</div>
    `;
    document.body.appendChild(overlay);
  }
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.remove();
}

function requireAuth() {
  if (!authToken) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function getAuthHeaders() {
  return { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' };
}