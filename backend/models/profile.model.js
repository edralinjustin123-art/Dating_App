async function getProfileRow(client, userId, includeHidden = false) {
  const { rows } = await client.query(
    `SELECT p.user_id AS id, p.name, p.age, p.gender, p.pronouns, p.location, p.occupation,
            p.bio, p.latitude, p.longitude, p.discoverable, p.updated_at AS "updatedAt",
            di.slug AS "intentionSlug", di.label AS intention,
            (SELECT ph.storage_key FROM profile_photos ph WHERE ph.user_id = p.user_id ORDER BY ph.is_primary DESC, ph.sort_order LIMIT 1) AS "photoKey",
            COALESCE((SELECT jsonb_agg(i.name ORDER BY i.name) FROM user_interests ui JOIN interests i ON i.id = ui.interest_id WHERE ui.user_id = p.user_id), '[]'::jsonb) AS interests,
            COALESCE((SELECT jsonb_agg(jsonb_build_object('id', pr.id, 'question', pr.question, 'answer', pr.answer) ORDER BY pr.sort_order) FROM profile_prompts pr WHERE pr.user_id = p.user_id), '[]'::jsonb) AS prompts
       FROM profiles p JOIN users u ON u.id = p.user_id AND u.deleted_at IS NULL
       LEFT JOIN dating_intentions di ON di.id = p.intention_id
      WHERE p.user_id = $1 AND ($2::boolean OR p.discoverable = true)`,
    [userId, includeHidden],
  );
  return rows[0] || null;
}

async function listPhotoRows(client, userId) {
  const { rows } = await client.query(
    `SELECT id, storage_key AS "storageKey", sort_order AS "sortOrder", is_primary AS "isPrimary", created_at AS "createdAt"
       FROM profile_photos WHERE user_id = $1 ORDER BY is_primary DESC, sort_order`, [userId],
  );
  return rows;
}

module.exports = { getProfileRow, listPhotoRows };
