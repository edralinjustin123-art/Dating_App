import { Platform } from 'react-native';
import Constants from 'expo-constants';

function resolveApiUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, '');

  // Expo Go on a physical device must reach the computer running the API via LAN.
  // Emulator loopback aliases are handled separately because they are not LAN addresses.
  const hostUri = Constants.expoConfig?.hostUri
    || Constants.manifest2?.extra?.expoClient?.hostUri
    || Constants.manifest?.debuggerHost;
  if (hostUri && !['localhost', '127.0.0.1'].includes(hostUri)) {
    const host = hostUri.replace(/^https?:\/\//, '').split(':')[0];
    return `http://${host}:4000/api`;
  }
  if (Platform.OS === 'android') return 'http://10.0.2.2:4000/api';
  return 'http://localhost:4000/api';
}

const API_URL = resolveApiUrl();
const REFRESH_KEY = 'datemate.refresh-token';
let accessToken = null;
let refreshToken = null;
let refreshInFlight = null;

async function secureStore() {
  if (Platform.OS === 'web') return null;
  return import('expo-secure-store');
}

export function setAccessToken(token) {
  accessToken = token || null;
}

export async function saveSession(nextAccessToken, nextRefreshToken, remember = true) {
  accessToken = nextAccessToken || null;
  refreshToken = remember ? nextRefreshToken || null : null;
  const store = await secureStore();
  if (!store) return;
  if (refreshToken) await store.setItemAsync(REFRESH_KEY, refreshToken);
  else await store.deleteItemAsync(REFRESH_KEY);
}

export async function clearSession() {
  accessToken = null;
  refreshToken = null;
  const store = await secureStore();
  if (store) await store.deleteItemAsync(REFRESH_KEY);
}

export async function restoreSession() {
  if (!API_URL || Platform.OS === 'web') return false;
  const store = await secureStore();
  refreshToken = await store.getItemAsync(REFRESH_KEY);
  if (!refreshToken) return false;
  try {
    await refreshAccessToken();
    return Boolean(accessToken);
  } catch {
    await clearSession();
    return false;
  }
}

export function hasApiConfiguration() {
  return Boolean(API_URL);
}

export function hasActiveSession() {
  return Boolean(accessToken);
}

export function getAccessToken() {
  return accessToken;
}

export function getSocketUrl() {
  return API_URL?.replace(/\/api\/?$/, '') || null;
}

export function refreshCurrentSession() {
  return refreshAccessToken();
}

async function refreshAccessToken() {
  if (!refreshToken) throw new Error('Your DateMate session has expired. Please sign in again.');
  if (refreshInFlight) return refreshInFlight;
  const activeRefreshToken = refreshToken;
  refreshInFlight = (async () => {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: activeRefreshToken }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.accessToken) throw new Error(payload.error?.message || payload.message || 'Your DateMate session has expired.');
    await saveSession(payload.accessToken, payload.refreshToken, true);
  })();
  try {
    await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

async function fetchApi(path, options, retry = true) {
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body && !isForm ? { 'Content-Type': 'application/json' } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      },
      body: options.body && !isForm ? JSON.stringify(options.body) : options.body,
    });
  } catch (error) {
    const detail = error?.message ? ` (${error.message})` : '';
    throw new Error(`Could not connect to the DateMate server at ${API_URL}. Ensure the API is running and reachable from this device.${detail}`);
  }
  if (response.status === 401 && retry && refreshToken && !path.startsWith('/auth/')) {
    await refreshAccessToken();
    return fetchApi(path, options, false);
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error?.message || payload.message || 'The request could not be completed.');
  return payload;
}

export async function apiRequest(path, options = {}) {
  if (!API_URL) throw new Error('Set EXPO_PUBLIC_API_URL to connect to the DateMate backend.');
  return fetchApi(path, options);
}

export const api = {
  login: (body) => apiRequest('/auth/login', { method: 'POST', body }),
  register: (body) => apiRequest('/auth/register', { method: 'POST', body }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  forgotPassword: (email) => apiRequest('/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (token, password) => apiRequest('/auth/reset-password', { method: 'POST', body: { token, password } }),
  oauth: (provider, redirectUri) => apiRequest(`/auth/oauth/${provider}`, { method: 'POST', body: { redirectUri } }),
  exchangeOAuth: (provider, code, redirectUri, state) => apiRequest('/auth/oauth/callback', { method: 'POST', body: { provider, code, redirectUri, state } }),
  saveProfile: (body) => apiRequest('/profiles/me', { method: 'PUT', body }),
  getProfile: () => apiRequest('/profiles/me'),
  getPhotos: () => apiRequest('/profiles/photos'),
  getProfileById: (profileId) => apiRequest(`/profiles/${encodeURIComponent(profileId)}`),
  uploadPhoto: (formData) => apiRequest('/profiles/photos', { method: 'POST', body: formData }),
  deletePhoto: (photoId) => apiRequest(`/profiles/photos/${encodeURIComponent(photoId)}`, { method: 'DELETE' }),
  setPrimaryPhoto: (photoId) => apiRequest(`/profiles/photos/${encodeURIComponent(photoId)}/primary`, { method: 'PATCH' }),
  reorderPhotos: (photoIds) => apiRequest('/profiles/photos/reorder', { method: 'PATCH', body: { photoIds } }),
  getDiscover: (filters) => apiRequest(`/discover?${new URLSearchParams(filters).toString()}`),
  swipe: (profileId, direction) => apiRequest('/likes', { method: 'POST', body: { profileId, direction } }),
  undoSwipe: () => apiRequest('/likes/undo', { method: 'POST' }),
  getLikes: () => apiRequest('/likes'),
  getMatches: () => apiRequest('/matches'),
  unmatch: (matchId) => apiRequest(`/matches/${encodeURIComponent(matchId)}`, { method: 'DELETE' }),
  getConversations: () => apiRequest('/conversations'),
  getMessages: (conversationId, params = {}) => apiRequest(`/conversations/${encodeURIComponent(conversationId)}/messages?${new URLSearchParams(params).toString()}`),
  markRead: (conversationId) => apiRequest(`/conversations/${encodeURIComponent(conversationId)}/read`, { method: 'POST' }),
  sendMessage: (conversationId, text) => apiRequest('/messages', { method: 'POST', body: { conversationId, text } }),
  getPreferences: () => apiRequest('/preferences'),
  savePreferences: (body) => apiRequest('/preferences', { method: 'PUT', body }),
  getInterests: () => apiRequest('/interests'),
  block: (profileId) => apiRequest(`/profiles/${encodeURIComponent(profileId)}/block`, { method: 'POST' }),
  unblock: (profileId) => apiRequest(`/profiles/${encodeURIComponent(profileId)}/block`, { method: 'DELETE' }),
};
