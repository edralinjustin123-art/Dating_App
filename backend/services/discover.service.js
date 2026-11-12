const { discoverProfiles } = require('../models/discover.model');
const { badRequest } = require('../utils/errors');

function createDiscoverService({ pool, profileService, config }) {
  return {
    async list(viewerId, filters) {
      if (filters.minAge != null && filters.maxAge != null && filters.minAge > filters.maxAge) {
        throw badRequest('Minimum age must not exceed maximum age.');
      }
      const { rows } = await pool.query(
        `SELECT p.age,p.gender,COALESCE(up.location,p.location) AS location,
                COALESCE(up.latitude,p.latitude) AS latitude,COALESCE(up.longitude,p.longitude) AS longitude,
                COALESCE(up.min_age,18) AS min_age,COALESCE(up.max_age,99) AS max_age,
                COALESCE(up.max_distance_km,100) AS max_distance_km
           FROM profiles p LEFT JOIN user_preferences up ON up.user_id=p.user_id WHERE p.user_id=$1`, [viewerId],
      );
      const viewer = rows[0];
      if (!viewer) throw new Error('Authenticated account has not completed its profile.');
      const profiles = await discoverProfiles(pool, viewerId, { ...viewer, excludeDemo: config.NODE_ENV === 'production' }, filters);
      const result = await Promise.all(profiles.map(async (profile) => {
        const { photoKey, distance, ...publicProfile } = profile;
        return {
          ...publicProfile,
          description: profile.bio,
          distance: distance == null ? null : Math.round(Number(distance) * 10) / 10,
          photoUrl: photoKey ? await profileService.storageSignedUrl(photoKey) : null,
        };
      }));
      const nextCursor = profiles.length === filters.limit ? profiles[profiles.length - 1].id : null;
      return { profiles: result, nextCursor };
    },
  };
}

module.exports = { createDiscoverService };
