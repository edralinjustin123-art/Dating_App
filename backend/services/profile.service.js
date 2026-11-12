const { withTransaction } = require('../utils/transaction');
const { badRequest, notFound } = require('../utils/errors');
const { getProfileRow, listPhotoRows } = require('../models/profile.model');

const intentionAliases = new Map([
  ['long-term relationship', 'long_term'], ['long term relationship', 'long_term'], ['long_term', 'long_term'],
  ['something casual', 'casual'], ['casual', 'casual'], ['new friends', 'friendship'], ['friendship', 'friendship'],
  ['still figuring it out', 'exploring'], ['exploring', 'exploring'],
]);

function createProfileService({ pool, storage }) {
  async function serializeProfile(row) {
    if (!row) return null;
    const photoUrl = row.photoKey ? await storage.signedUrl(row.photoKey) : null;
    const prompt = row.prompts?.[0] || null;
    return {
      id: row.id, name: row.name, age: row.age, gender: row.gender, pronouns: row.pronouns,
      location: row.location, occupation: row.occupation, bio: row.bio, description: row.bio,
      intention: row.intention, interests: row.interests || [], prompts: row.prompts || [],
      prompt, photoUrl, updatedAt: row.updatedAt,
    };
  }

  async function resolveIntention(client, value) {
    if (!value) return null;
    const key = intentionAliases.get(value.trim().toLowerCase()) || value.trim().toLowerCase();
    const { rows } = await client.query('SELECT id FROM dating_intentions WHERE slug = $1 OR lower(label) = $2', [key, value.trim().toLowerCase()]);
    if (!rows[0]) throw badRequest('Choose one of the supported dating intentions.');
    return rows[0].id;
  }

  async function updateInterests(client, userId, names) {
    if (!names) return;
    const unique = [...new Set(names.map((name) => name.trim().toLowerCase()))];
    const { rows } = await client.query('SELECT id, lower(name) AS name FROM interests WHERE lower(name) = ANY($1::text[])', [unique]);
    if (rows.length !== unique.length) throw badRequest('One or more selected interests are not in the DateMate interest catalog.');
    await client.query('DELETE FROM user_interests WHERE user_id = $1', [userId]);
    if (rows.length) await client.query(
      'INSERT INTO user_interests (user_id, interest_id) SELECT $1, unnest($2::smallint[])',
      [userId, rows.map((row) => row.id)],
    );
  }

  async function updatePrompts(client, userId, input) {
    if (input.prompts === undefined && input.prompt === undefined) return;
    const prompts = input.prompt !== undefined ? (input.prompt ? [input.prompt] : []) : input.prompts || [];
    await client.query('DELETE FROM profile_prompts WHERE user_id = $1', [userId]);
    for (const [index, prompt] of prompts.entries()) {
      await client.query(
        'INSERT INTO profile_prompts (user_id, question, answer, sort_order) VALUES ($1, $2, $3, $4)',
        [userId, prompt.question, prompt.answer, index],
      );
    }
  }

  async function save(userId, input) {
    await withTransaction(pool, async (client) => {
      const currentResult = await client.query('SELECT * FROM profiles WHERE user_id = $1 FOR UPDATE', [userId]);
      const current = currentResult.rows[0];
      const name = input.name ?? current?.name;
      const age = input.age ?? current?.age;
      if (!name || !age) throw badRequest('Name and age are required to create a profile.');
      const intentionValue = input.intention === undefined ? undefined : await resolveIntention(client, input.intention);
      const bio = input.bio ?? input.description ?? current?.bio ?? '';
      await client.query(
        `INSERT INTO profiles (user_id, name, age, gender, pronouns, location, occupation, bio, intention_id, latitude, longitude, discoverable)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (user_id) DO UPDATE SET
           name=EXCLUDED.name, age=EXCLUDED.age, gender=EXCLUDED.gender, pronouns=EXCLUDED.pronouns,
           location=EXCLUDED.location, occupation=EXCLUDED.occupation, bio=EXCLUDED.bio,
           intention_id=EXCLUDED.intention_id, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
           discoverable=EXCLUDED.discoverable, updated_at=now()`,
        [userId, name, age, input.gender === undefined ? current?.gender || null : input.gender,
          input.pronouns === undefined ? current?.pronouns || null : input.pronouns,
          input.location === undefined ? current?.location || null : input.location,
          input.occupation === undefined ? current?.occupation || null : input.occupation,
          bio, intentionValue === undefined ? current?.intention_id || null : intentionValue,
          input.latitude === undefined ? current?.latitude ?? null : input.latitude,
          input.longitude === undefined ? current?.longitude ?? null : input.longitude,
          input.discoverable ?? current?.discoverable ?? true],
      );
      await client.query(
        `INSERT INTO user_preferences (user_id) VALUES ($1)
         ON CONFLICT (user_id) DO NOTHING`, [userId],
      );
      if (input.interests !== undefined) await updateInterests(client, userId, input.interests);
      await updatePrompts(client, userId, input);
      await client.query('UPDATE users SET updated_at = now() WHERE id = $1', [userId]);
    });
    return serializeProfile(await getProfileRow(pool, userId, true));
  }

  async function getPreferences(client, userId) {
    const { rows } = await client.query(
      `SELECT up.min_age AS "minAge", up.max_age AS "maxAge", up.max_distance_km AS "maxDistance",
              up.location, up.latitude, up.longitude,
              COALESCE((SELECT jsonb_agg(di.slug ORDER BY di.slug) FROM preference_intentions pi JOIN dating_intentions di ON di.id = pi.intention_id WHERE pi.user_id = up.user_id), '[]'::jsonb) AS intentions,
              COALESCE((SELECT jsonb_agg(pg.gender ORDER BY pg.gender) FROM preference_genders pg WHERE pg.user_id = up.user_id), '[]'::jsonb) AS genders
         FROM user_preferences up WHERE up.user_id = $1`, [userId],
    );
    return rows[0] || { minAge: 21, maxAge: 35, maxDistance: 25, location: null, latitude: null, longitude: null, intentions: [], genders: [] };
  }

  async function savePreferences(userId, input) {
    await withTransaction(pool, async (client) => {
      const profile = await client.query('SELECT age FROM profiles WHERE user_id = $1', [userId]);
      if (!profile.rows[0]) throw notFound('Profile');
      const old = await getPreferences(client, userId);
      const next = {
        minAge: input.minAge ?? old.minAge, maxAge: input.maxAge ?? old.maxAge,
        maxDistance: input.maxDistance ?? old.maxDistance, location: input.location === undefined ? old.location : input.location,
        latitude: input.latitude === undefined ? old.latitude : input.latitude,
        longitude: input.longitude === undefined ? old.longitude : input.longitude,
      };
      if (next.minAge > next.maxAge) throw badRequest('Minimum age must not exceed maximum age.');
      await client.query(
        `INSERT INTO user_preferences (user_id,min_age,max_age,max_distance_km,location,latitude,longitude)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (user_id) DO UPDATE SET min_age=EXCLUDED.min_age,max_age=EXCLUDED.max_age,
           max_distance_km=EXCLUDED.max_distance_km,location=EXCLUDED.location,latitude=EXCLUDED.latitude,
           longitude=EXCLUDED.longitude,updated_at=now()`,
        [userId,next.minAge,next.maxAge,next.maxDistance,next.location,next.latitude,next.longitude],
      );
      if (input.intentions !== undefined) {
        const ids = [];
        for (const intention of input.intentions) ids.push(await resolveIntention(client, intention));
        await client.query('DELETE FROM preference_intentions WHERE user_id=$1', [userId]);
        if (ids.length) await client.query('INSERT INTO preference_intentions (user_id,intention_id) SELECT $1,unnest($2::smallint[])', [userId, ids]);
      }
      if (input.genders !== undefined) {
        await client.query('DELETE FROM preference_genders WHERE user_id=$1', [userId]);
        if (input.genders.length) await client.query('INSERT INTO preference_genders (user_id,gender) SELECT $1,unnest($2::text[])', [userId,input.genders]);
      }
    });
    return getPreferences(pool, userId);
  }

  async function addPhoto(userId, { buffer, mimeType }) {
    const key = await storage.uploadProfilePhoto({ userId, buffer, mimeType });
    try {
      const photo = await withTransaction(pool, async (client) => {
        const profile = await client.query('SELECT 1 FROM profiles WHERE user_id=$1 FOR UPDATE', [userId]);
        if (!profile.rowCount) throw notFound('Profile');
        const count = await client.query('SELECT count(*)::int AS total FROM profile_photos WHERE user_id=$1', [userId]);
        if (count.rows[0].total >= 6) throw badRequest('A profile can have up to 6 photos.');
        const order = count.rows[0].total;
        await client.query('UPDATE profile_photos SET is_primary=false WHERE user_id=$1 AND is_primary=true', [userId]);
        const inserted = await client.query(
          `INSERT INTO profile_photos (user_id,storage_key,sort_order,is_primary)
           VALUES ($1,$2,$3,$4) RETURNING id, storage_key AS "storageKey", sort_order AS "sortOrder", is_primary AS "isPrimary"`,
          [userId,key,order,order===0],
        );
        return inserted.rows[0];
      });
      return { id: photo.id, photoUrl: await storage.signedUrl(photo.storageKey), sortOrder: photo.sortOrder, isPrimary: photo.isPrimary };
    } catch (error) {
      await storage.deleteObject(key).catch((cleanupError) => console.error('Profile photo cleanup failed:', cleanupError.message));
      throw error;
    }
  }

  async function getPhotos(userId) {
    const rows = await listPhotoRows(pool, userId);
    return Promise.all(rows.map(async (photo) => ({ ...photo, photoUrl: await storage.signedUrl(photo.storageKey), storageKey: undefined })));
  }

  async function deletePhoto(userId, photoId) {
    await withTransaction(pool, async (client) => {
      const result = await client.query('DELETE FROM profile_photos WHERE user_id=$1 AND id=$2 RETURNING storage_key,is_primary', [userId,photoId]);
      if (!result.rows[0]) throw notFound('Profile photo');
      await client.query('INSERT INTO storage_cleanup_jobs (storage_key) VALUES ($1) ON CONFLICT (storage_key) DO NOTHING', [result.rows[0].storage_key]);
      if (result.rows[0].is_primary) {
        await client.query(
          `UPDATE profile_photos SET is_primary=true
            WHERE id=(SELECT id FROM profile_photos WHERE user_id=$1 ORDER BY sort_order LIMIT 1)`, [userId],
        );
      }
    });
    return { deleted: true };
  }

  async function block(userId, targetId) {
    if (userId === targetId) throw badRequest('You cannot block your own account.');
    await withTransaction(pool, async (client) => {
      const target = await client.query('SELECT 1 FROM users WHERE id=$1 AND deleted_at IS NULL', [targetId]);
      if (!target.rowCount) throw notFound('Profile');
      await client.query('INSERT INTO user_blocks (blocker_id,blocked_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [userId,targetId]);
      const ended = await client.query(
        `UPDATE matches SET status='unmatched',ended_at=now()
          WHERE status='active' AND ((user_low=$1 AND user_high=$2) OR (user_low=$2 AND user_high=$1)) RETURNING id`, [userId,targetId],
      );
      if (ended.rows.length) await client.query('UPDATE conversations SET archived_at=now() WHERE match_id=ANY($1::uuid[])', [ended.rows.map((row)=>row.id)]);
    });
    return { blocked: true };
  }

  async function unblock(userId, targetId) {
    const result = await pool.query('DELETE FROM user_blocks WHERE blocker_id=$1 AND blocked_id=$2', [userId,targetId]);
    return { unblocked: result.rowCount > 0 };
  }

  async function deleteProfile(userId) {
    await withTransaction(pool, async (client) => {
      await client.query(`INSERT INTO storage_cleanup_jobs (storage_key)
        SELECT storage_key FROM profile_photos WHERE user_id=$1 ON CONFLICT (storage_key) DO NOTHING`, [userId]);
      const ended = await client.query(`UPDATE matches SET status='unmatched',ended_at=now() WHERE status='active' AND (user_low=$1 OR user_high=$1) RETURNING id`, [userId]);
      if (ended.rows.length) await client.query('UPDATE conversations SET archived_at=now() WHERE match_id=ANY($1::uuid[])', [ended.rows.map((row)=>row.id)]);
      await client.query('DELETE FROM likes WHERE actor_id=$1 OR target_id=$1', [userId]);
      await client.query('DELETE FROM user_blocks WHERE blocker_id=$1 OR blocked_id=$1', [userId]);
      await client.query('DELETE FROM profiles WHERE user_id=$1', [userId]);
      await client.query(`UPDATE users SET email='deleted+' || id || '@invalid.datemate',password_hash='!revoked!',google_subject=NULL,apple_subject=NULL,deleted_at=now(),updated_at=now() WHERE id=$1`, [userId]);
      await client.query('UPDATE auth_sessions SET revoked_at=now(),refresh_token_hash=NULL WHERE user_id=$1 AND revoked_at IS NULL', [userId]);
    });
    return { deleted: true };
  }

  async function getPublicProfile(viewerId,targetId) {
    if(viewerId===targetId) return serializeProfile(await getProfileRow(pool,targetId,true));
    const blocked=await pool.query('SELECT 1 FROM user_blocks WHERE (blocker_id=$1 AND blocked_id=$2) OR (blocker_id=$2 AND blocked_id=$1)',[viewerId,targetId]);
    if(blocked.rowCount) throw notFound('Profile');
    const result=await serializeProfile(await getProfileRow(pool,targetId,false));
    if(!result) throw notFound('Profile');
    return result;
  }

  return { serializeProfile, storageSignedUrl: (key) => storage.signedUrl(key), save, getProfile: async (id, hidden = false) => serializeProfile(await getProfileRow(pool,id,hidden)), getPublicProfile, getUserPreferences: (userId) => getPreferences(pool,userId), savePreferences, addPhoto, getPhotos, deletePhoto, block, unblock, deleteProfile };
}

module.exports = { createProfileService };
