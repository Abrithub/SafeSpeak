// Form validation utilities

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const isValidPhone = (phone) =>
  /^(\+251|0)[0-9]{9}$/.test(phone.replace(/\s/g, ''));

export const isValidUsername = (username) =>
  /^[a-zA-Z0-9_]{3,30}$/.test(username.trim());

export const isValidDate = (date) =>
  /^\d{4}-\d{2}-\d{2}$/.test(date);

export const isValidTime = (time) =>
  /^\d{2}:\d{2}$/.test(time);

export const isValidCode = (code) =>
  /^\d{6}$/.test(code.trim());

export const validateSignUp = ({ username, email, password, confirm }) => {
  if (!username.trim()) return 'Username is required';
  if (!isValidUsername(username)) return 'Username must be 3-30 characters, letters/numbers/underscore only';
  if (!email.trim()) return 'Email is required';
  if (!isValidEmail(email)) return 'Please enter a valid email address';
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (password !== confirm) return 'Passwords do not match';
  return null;
};

export const validateLogin = ({ username, password }) => {
  if (!username.trim()) return 'Username is required';
  if (!password) return 'Password is required';
  return null;
};

export const validateReport = ({ description, consentToShare }) => {
  if (!description.trim()) return 'Please describe what happened so our AI can classify your case';
  if (description.trim().length < 20) return 'Please provide more detail (at least 20 characters)';
  if (!consentToShare) return 'Please agree to share this report with authorized organizations';
  return null;
};

export const validateForgotPassword = ({ email }) => {
  if (!email.trim()) return 'Email is required';
  if (!isValidEmail(email)) return 'Please enter a valid email address';
  return null;
};

export const validateResetPassword = ({ code, newPassword, confirmPassword }) => {
  if (!code.trim()) return 'Reset code is required';
  if (!isValidCode(code)) return 'Reset code must be 6 digits';
  if (!newPassword) return 'New password is required';
  if (newPassword.length < 6) return 'Password must be at least 6 characters';
  if (newPassword !== confirmPassword) return 'Passwords do not match';
  return null;
};

export const validateAppointment = ({ date, time, location }) => {
  if (!date) return 'Date is required';
  if (!isValidDate(date)) return 'Date must be in YYYY-MM-DD format';
  if (!time) return 'Time is required';
  if (!isValidTime(time)) return 'Time must be in HH:MM format';
  if (!location.trim()) return 'Location is required';
  return null;
};
