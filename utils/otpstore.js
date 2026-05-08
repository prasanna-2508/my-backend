// In-memory OTP store (use Redis in production)
const otpStore = new Map();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const storeOTP = (key, otp, expiryMinutes = 10) => {
  const expiryTime = Date.now() + expiryMinutes * 60 * 1000;
  otpStore.set(key, { otp, expiryTime });
  
  // Auto cleanup after expiry
  setTimeout(() => {
    otpStore.delete(key);
  }, expiryMinutes * 60 * 1000);
};

const verifyOTP = (key, otp) => {
  const data = otpStore.get(key);
  if (!data) return { valid: false, message: 'OTP expired or not found' };
  
  if (Date.now() > data.expiryTime) {
    otpStore.delete(key);
    return { valid: false, message: 'OTP has expired' };
  }
  
  if (data.otp !== otp) {
    return { valid: false, message: 'Invalid OTP' };
  }
  
  otpStore.delete(key);
  return { valid: true, message: 'OTP verified successfully' };
};

const getOTP = (key) => {
  return otpStore.get(key);
};

module.exports = {
  generateOTP,
  storeOTP,
  verifyOTP,
  getOTP
};