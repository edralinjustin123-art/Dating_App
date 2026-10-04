export function getPasswordError(password) {
  if (password.length < 8) return 'Use at least 8 characters.';
  if (password.length > 10) return 'Use no more than 10 characters.';
  if (!/[a-z]/i.test(password) || !/[\d\W_]/.test(password)) {
    return '8–10 characters, with a letter and a number or symbol.';
  }
  return '';
}
