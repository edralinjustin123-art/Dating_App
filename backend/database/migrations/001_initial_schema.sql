CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  email_verified_at timestamptz,
  password_hash text,
  google_subject text UNIQUE,
  apple_subject text UNIQUE,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT users_email_nonempty CHECK (length(trim(email)) BETWEEN 3 AND 254),
  CONSTRAINT users_auth_method_required CHECK (password_hash IS NOT NULL OR google_subject IS NOT NULL OR apple_subject IS NOT NULL)
);
CREATE UNIQUE INDEX users_email_lower_unique ON users (lower(email));
CREATE INDEX users_active_created_idx ON users (created_at DESC) WHERE deleted_at IS NULL;

CREATE TABLE dating_intentions (
  id smallserial PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  label text NOT NULL UNIQUE
);

CREATE TABLE profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name varchar(60) NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 60),
  age smallint NOT NULL CHECK (age BETWEEN 18 AND 120),
  gender varchar(40),
  pronouns varchar(40),
  location varchar(120),
  occupation varchar(100),
  bio varchar(500) NOT NULL DEFAULT '',
  intention_id smallint REFERENCES dating_intentions(id),
  latitude double precision CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  longitude double precision CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
  discoverable boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profile_coordinates_together CHECK ((latitude IS NULL) = (longitude IS NULL))
);
CREATE INDEX profiles_discovery_age_idx ON profiles (age, user_id) WHERE discoverable = true;
CREATE INDEX profiles_location_idx ON profiles (lower(location)) WHERE discoverable = true;
CREATE INDEX profiles_intention_idx ON profiles (intention_id) WHERE discoverable = true;

CREATE TABLE profile_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  storage_key text NOT NULL UNIQUE,
  sort_order smallint NOT NULL DEFAULT 0 CHECK (sort_order BETWEEN 0 AND 9),
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, sort_order)
);
CREATE UNIQUE INDEX profile_photos_one_primary_idx ON profile_photos (user_id) WHERE is_primary = true;
CREATE INDEX profile_photos_user_order_idx ON profile_photos (user_id, sort_order);

CREATE TABLE storage_cleanup_jobs (
  id bigserial PRIMARY KEY,
  storage_key text NOT NULL UNIQUE,
  attempts smallint NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  locked_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX storage_cleanup_ready_idx ON storage_cleanup_jobs (next_attempt_at, id) WHERE locked_at IS NULL;

CREATE TABLE interests (
  id smallserial PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name varchar(50) NOT NULL UNIQUE
);
CREATE TABLE user_interests (
  user_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  interest_id smallint NOT NULL REFERENCES interests(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, interest_id)
);
CREATE INDEX user_interests_interest_user_idx ON user_interests (interest_id, user_id);

CREATE TABLE profile_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  question varchar(180) NOT NULL CHECK (length(trim(question)) BETWEEN 1 AND 180),
  answer varchar(300) NOT NULL CHECK (length(trim(answer)) BETWEEN 1 AND 300),
  sort_order smallint NOT NULL DEFAULT 0 CHECK (sort_order BETWEEN 0 AND 9),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, sort_order)
);
CREATE INDEX profile_prompts_user_idx ON profile_prompts (user_id, sort_order);

CREATE TABLE user_preferences (
  user_id uuid PRIMARY KEY REFERENCES profiles(user_id) ON DELETE CASCADE,
  min_age smallint NOT NULL DEFAULT 21 CHECK (min_age BETWEEN 18 AND 120),
  max_age smallint NOT NULL DEFAULT 35 CHECK (max_age BETWEEN 18 AND 120),
  max_distance_km smallint NOT NULL DEFAULT 25 CHECK (max_distance_km BETWEEN 1 AND 500),
  location varchar(120),
  latitude double precision CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  longitude double precision CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT preference_age_range CHECK (min_age <= max_age),
  CONSTRAINT preference_coordinates_together CHECK ((latitude IS NULL) = (longitude IS NULL))
);
CREATE TABLE preference_intentions (
  user_id uuid NOT NULL REFERENCES user_preferences(user_id) ON DELETE CASCADE,
  intention_id smallint NOT NULL REFERENCES dating_intentions(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, intention_id)
);
CREATE TABLE preference_genders (
  user_id uuid NOT NULL REFERENCES user_preferences(user_id) ON DELETE CASCADE,
  gender varchar(40) NOT NULL,
  PRIMARY KEY (user_id, gender)
);

CREATE TABLE likes (
  actor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action varchar(10) NOT NULL CHECK (action IN ('like', 'dislike')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (actor_id, target_id),
  CONSTRAINT likes_not_self CHECK (actor_id <> target_id)
);
CREATE INDEX likes_target_action_idx ON likes (target_id, action, actor_id);
CREATE INDEX likes_actor_time_idx ON likes (actor_id, created_at DESC);

CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_low uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_high uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status varchar(12) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unmatched')),
  matched_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  CONSTRAINT matches_distinct_users CHECK (user_low < user_high),
  CONSTRAINT matches_unmatched_timestamp CHECK ((status = 'active' AND ended_at IS NULL) OR (status = 'unmatched' AND ended_at IS NOT NULL)),
  UNIQUE (user_low, user_high)
);
CREATE INDEX matches_low_active_idx ON matches (user_low, matched_at DESC) WHERE status = 'active';
CREATE INDEX matches_high_active_idx ON matches (user_high, matched_at DESC) WHERE status = 'active';

CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);
CREATE INDEX conversations_active_idx ON conversations (created_at DESC) WHERE archived_at IS NULL;

CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content varchar(4000) NOT NULL CHECK (length(trim(content)) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);
CREATE INDEX messages_conversation_page_idx ON messages (conversation_id, created_at DESC, id DESC);
CREATE INDEX messages_unread_idx ON messages (conversation_id, sender_id, created_at) WHERE read_at IS NULL;

CREATE TABLE user_blocks (
  blocker_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CONSTRAINT user_blocks_not_self CHECK (blocker_id <> blocked_id)
);
CREATE INDEX user_blocks_blocked_idx ON user_blocks (blocked_id, blocker_id);

CREATE TABLE auth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_jti uuid NOT NULL UNIQUE,
  refresh_token_hash text UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX auth_sessions_user_active_idx ON auth_sessions (user_id, expires_at DESC) WHERE revoked_at IS NULL;

CREATE TABLE password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX password_reset_expiry_idx ON password_reset_tokens (expires_at) WHERE used_at IS NULL;

CREATE TABLE oauth_states (
  state_hash text PRIMARY KEY,
  provider varchar(10) NOT NULL CHECK (provider IN ('google', 'apple')),
  nonce text NOT NULL,
  code_verifier text NOT NULL,
  redirect_uri text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX oauth_states_expiry_idx ON oauth_states (expires_at);

CREATE TABLE api_rate_limits (
  key varchar(255) PRIMARY KEY,
  window_started_at timestamptz NOT NULL,
  hits integer NOT NULL CHECK (hits >= 0)
);
CREATE INDEX api_rate_limits_window_idx ON api_rate_limits (window_started_at);
