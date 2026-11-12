function buildDistance(originLat, originLon, pointLat, pointLon) {
  return `(6371 * acos(LEAST(1.0, GREATEST(-1.0,
    sin(radians(${originLat})) * sin(radians(${pointLat})) +
    cos(radians(${originLat})) * cos(radians(${pointLat})) *
    cos(radians(${pointLon}) - radians(${originLon})))))`;
}

async function discoverProfiles(pool, viewerId, viewer, filters) {
  const values = [viewerId];
  const bind = (value) => { values.push(value); return `$${values.length}`; };
  const clauses = [
    'p.user_id <> $1',
    'p.discoverable = true',
    'u.deleted_at IS NULL',
    'p.age >= $2 AND p.age <= $3',
    `NOT EXISTS (SELECT 1 FROM likes l WHERE l.actor_id = $1 AND l.target_id = p.user_id)`,
    `NOT EXISTS (SELECT 1 FROM user_blocks b WHERE (b.blocker_id = $1 AND b.blocked_id = p.user_id) OR (b.blocker_id = p.user_id AND b.blocked_id = $1))`,
    `NOT EXISTS (SELECT 1 FROM matches m WHERE m.status = 'active' AND ((m.user_low = $1 AND m.user_high = p.user_id) OR (m.user_high = $1 AND m.user_low = p.user_id)))`,
    `NOT EXISTS (SELECT 1 FROM user_preferences cp WHERE cp.user_id = p.user_id AND ($4::smallint NOT BETWEEN cp.min_age AND cp.max_age))`,
  ];
  const minAge = filters.minAge ?? viewer.min_age;
  const maxAge = filters.maxAge ?? viewer.max_age;
  values.push(minAge, maxAge);
  // Use the authenticated profile's preferences for reciprocal checks.
  const viewerAge = viewer.age;
  clauses[7] = `NOT EXISTS (SELECT 1 FROM user_preferences cp WHERE cp.user_id = p.user_id AND (${bind(viewerAge)}::smallint NOT BETWEEN cp.min_age AND cp.max_age))`;

  clauses.push(`(NOT EXISTS (SELECT 1 FROM preference_genders pg WHERE pg.user_id = $1)
    OR EXISTS (SELECT 1 FROM preference_genders pg WHERE pg.user_id = $1 AND lower(pg.gender) = lower(p.gender)))`);
  clauses.push(`(p.gender IS NULL OR NOT EXISTS (SELECT 1 FROM preference_genders pg WHERE pg.user_id = p.user_id)
    OR EXISTS (SELECT 1 FROM preference_genders pg JOIN profiles me ON me.user_id = $1 WHERE pg.user_id = p.user_id AND lower(pg.gender) = lower(me.gender)))`);

  const intention = filters.intention;
  if (intention) {
    const intentionParam = bind(intention);
    clauses.push(`(di.slug = ${intentionParam} OR lower(di.label) = lower(${intentionParam}))`);
  } else {
    clauses.push(`(NOT EXISTS (SELECT 1 FROM preference_intentions pi WHERE pi.user_id = $1)
      OR EXISTS (SELECT 1 FROM preference_intentions pi WHERE pi.user_id = $1 AND pi.intention_id = p.intention_id))`);
  }
  clauses.push(`(NOT EXISTS (SELECT 1 FROM preference_intentions pi JOIN user_preferences up ON up.user_id = $1 WHERE pi.user_id = p.user_id)
    OR EXISTS (SELECT 1 FROM preference_intentions pi WHERE pi.user_id = p.user_id AND pi.intention_id = (SELECT intention_id FROM profiles WHERE user_id = $1)))`);

  if (filters.location || viewer.location) {
    const location = bind(filters.location || viewer.location);
    clauses.push(`p.location ILIKE '%' || ${location} || '%'`);
  }
  if (filters.interests) {
    const interestNames = filters.interests.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean).slice(0, 20);
    if (interestNames.length) {
      const interestParam = bind(interestNames);
      clauses.push(`EXISTS (SELECT 1 FROM user_interests ui JOIN interests i ON i.id = ui.interest_id
        WHERE ui.user_id = p.user_id AND lower(i.name) = ANY(${interestParam}::text[]))`);
    }
  }
  if (viewer.excludeDemo) clauses.push('u.is_demo = false');

  let distance = 'NULL::double precision';
  if (viewer.latitude != null && viewer.longitude != null) {
    const maxDistance = filters.maxDistance ?? viewer.max_distance_km;
    const originLat = bind(viewer.latitude);
    const originLon = bind(viewer.longitude);
    distance = buildDistance(originLat, originLon, 'p.latitude', 'p.longitude');
    const distanceFilter = bind(maxDistance);
    clauses.push(`p.latitude IS NOT NULL AND ${distance} <= ${distanceFilter}`);
  }
  if (filters.cursor) clauses.push(`p.user_id < ${bind(filters.cursor)}::uuid`);
  const limit = bind(filters.limit);
  const { rows } = await pool.query(
    `SELECT p.user_id AS id, p.name, p.age, p.gender, p.pronouns, p.location,
            p.occupation, p.bio, di.label AS intention, ${distance} AS distance,
            (SELECT ph.storage_key FROM profile_photos ph WHERE ph.user_id = p.user_id ORDER BY ph.is_primary DESC, ph.sort_order LIMIT 1) AS "photoKey",
            COALESCE((SELECT jsonb_agg(i.name ORDER BY i.name) FROM user_interests ui JOIN interests i ON i.id = ui.interest_id WHERE ui.user_id = p.user_id), '[]'::jsonb) AS interests,
            COALESCE((SELECT jsonb_agg(jsonb_build_object('question', pr.question, 'answer', pr.answer) ORDER BY pr.sort_order) FROM profile_prompts pr WHERE pr.user_id = p.user_id), '[]'::jsonb) AS prompts
       FROM profiles p JOIN users u ON u.id = p.user_id
       LEFT JOIN dating_intentions di ON di.id = p.intention_id
      WHERE ${clauses.join(' AND ')}
      ORDER BY p.user_id DESC LIMIT ${limit}`,
    values,
  );
  return rows;
}

module.exports = { discoverProfiles };
