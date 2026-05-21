import { ALLOWED_DOMAINS } from './constants';

export function validateEmail(email) {
  if (!email || !email.includes('@')) return 'Enter a valid email address.';
  const lower = email.toLowerCase();
  const valid = ALLOWED_DOMAINS.some(d => lower.endsWith(d));
  if (!valid) return 'Use your official organization email address.';
  return null;
}

export function validatePassword(password) {
  if (!password || password.length < 6) return 'Password must be at least 6 characters.';
  return null;
}

export function validatePasswordMatch(password, confirm) {
  if (password !== confirm) return 'Passwords do not match.';
  return null;
}

export function validateRequired(value, fieldName) {
  if (!value || !value.trim()) return `${fieldName} is required.`;
  return null;
}
