const { z } = require('zod');

const email = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
const password = z.string().min(12).max(128);
const id = z.uuid();
const uuidParams = z.object({ id });
const pagination = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().max(256).optional(),
});

const register = z.object({ name: z.string().trim().min(1).max(60), email, password });
const login = z.object({ email, password: z.string().min(1).max(128), remember: z.boolean().default(false) });
const refresh = z.object({ refreshToken: z.string().min(40).max(200) });
const forgotPassword = z.object({ email });
const resetPassword = z.object({ token: z.string().min(40).max(200), password });
const oauthStart = z.object({ redirectUri: z.string().url().max(500) });
const oauthCallback = z.object({ provider: z.enum(['google', 'apple']), code: z.string().min(1).max(4096), redirectUri: z.string().url().max(500), state: z.string().min(32).max(512) });

const profileUpdate = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  age: z.coerce.number().int().min(18).max(120).optional(),
  gender: z.string().trim().max(40).nullable().optional(),
  pronouns: z.string().trim().max(40).nullable().optional(),
  location: z.string().trim().max(120).nullable().optional(),
  occupation: z.string().trim().max(100).nullable().optional(),
  bio: z.string().trim().max(500).optional(),
  description: z.string().trim().max(500).optional(),
  intention: z.string().trim().max(80).nullable().optional(),
  interests: z.array(z.string().trim().min(1).max(50)).max(30).optional(),
  prompt: z.object({ question: z.string().trim().min(1).max(180), answer: z.string().trim().min(1).max(300) }).nullable().optional(),
  prompts: z.array(z.object({ question: z.string().trim().min(1).max(180), answer: z.string().trim().min(1).max(300) })).max(10).optional(),
  latitude: z.coerce.number().min(-90).max(90).nullable().optional(),
  longitude: z.coerce.number().min(-180).max(180).nullable().optional(),
  discoverable: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0, 'At least one profile field is required.')
  .refine((value) => (value.latitude === undefined) === (value.longitude === undefined), 'Latitude and longitude must be provided together.');

const preferencesUpdate = z.object({
  minAge: z.coerce.number().int().min(18).max(120).optional(),
  maxAge: z.coerce.number().int().min(18).max(120).optional(),
  maxDistance: z.coerce.number().int().min(1).max(500).optional(),
  location: z.string().trim().max(120).nullable().optional(),
  latitude: z.coerce.number().min(-90).max(90).nullable().optional(),
  longitude: z.coerce.number().min(-180).max(180).nullable().optional(),
  intentions: z.array(z.string().trim().min(1).max(80)).max(10).optional(),
  genders: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
}).refine((value) => Object.keys(value).length > 0, 'At least one preference is required.')
  .refine((value) => (value.latitude === undefined) === (value.longitude === undefined), 'Latitude and longitude must be provided together.');

const discoverQuery = pagination.extend({
  minAge: z.coerce.number().int().min(18).max(120).optional(),
  maxAge: z.coerce.number().int().min(18).max(120).optional(),
  maxDistance: z.coerce.number().int().min(1).max(500).optional(),
  location: z.string().trim().max(120).optional(),
  intention: z.string().trim().max(80).optional(),
  interests: z.string().max(500).optional(),
});

const like = z.object({ profileId: id, direction: z.enum(['like', 'pass', 'dislike']) });
const message = z.object({ conversationId: id, text: z.string().trim().min(1).max(4000) });
const messagePage = pagination.extend({ before: z.string().datetime().optional() });

module.exports = {
  id, uuidParams, pagination, register, login, refresh, forgotPassword, resetPassword,
  oauthStart, oauthCallback, profileUpdate, preferencesUpdate, discoverQuery, like,
  message, messagePage,
};
