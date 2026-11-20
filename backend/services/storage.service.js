const crypto = require('node:crypto');
const { unavailable } = require('../utils/errors');
const { withTransaction } = require('../utils/transaction');

function createStorageService(config) {
  const ready = Boolean(config.CLOUDINARY_CLOUD_NAME && config.CLOUDINARY_API_KEY && config.CLOUDINARY_API_SECRET);
  function assertReady() {
    if (!ready) throw unavailable('Profile photo storage is not configured. Set Cloudinary credentials in backend/.env.');
  }
  function signature(params) {
    const canonical = Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join('&');
    return crypto.createHash('sha1').update(canonical + config.CLOUDINARY_API_SECRET).digest('hex');
  }
  return {
    isConfigured: ready,
    async uploadProfilePhoto({ userId, buffer, mimeType }) {
      assertReady();
      const timestamp = Math.floor(Date.now() / 1000);
      const publicId = `datemate/profiles/${userId}/${crypto.randomUUID()}`;
      const params = { folder: `datemate/profiles/${userId}`, public_id: publicId.split('/').pop(), timestamp };
      const body = new FormData();
      body.append('file', new Blob([buffer], { type: mimeType }), 'profile-photo');
      body.append('api_key', config.CLOUDINARY_API_KEY);
      body.append('timestamp', String(timestamp));
      body.append('folder', params.folder);
      body.append('public_id', params.public_id);
      body.append('signature', signature(params));
      const response = await fetch(`https://api.cloudinary.com/v1_1/${config.CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.secure_url || !result.public_id) throw new Error(result.error?.message || 'Cloudinary could not store this photo.');
      return { publicId: result.public_id, url: result.secure_url };
    },
    async deleteObject(publicId) {
      assertReady();
      const timestamp = Math.floor(Date.now() / 1000);
      const params = { public_id: publicId, timestamp };
      const body = new URLSearchParams({ ...params, api_key: config.CLOUDINARY_API_KEY, signature: signature(params) });
      const response = await fetch(`https://api.cloudinary.com/v1_1/${config.CLOUDINARY_CLOUD_NAME}/image/destroy`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !['ok', 'not found'].includes(result.result)) throw new Error(result.error?.message || 'Cloudinary could not delete this photo.');
    },
    async signedUrl(url) { return url || null; },
    async processCleanupJobs(pool, batchSize = 20) {
      if (!ready) return 0;
      const jobs = await withTransaction(pool, async (client) => {
        const { rows } = await client.query(`WITH ready AS (SELECT id FROM storage_cleanup_jobs WHERE next_attempt_at<=now() AND (locked_at IS NULL OR locked_at<now()-interval '5 minutes') ORDER BY id FOR UPDATE SKIP LOCKED LIMIT $1) UPDATE storage_cleanup_jobs j SET locked_at=now() FROM ready WHERE j.id=ready.id RETURNING j.id,j.storage_key AS "storageKey",j.attempts`, [batchSize]);
        return rows;
      });
      for (const job of jobs) try {
        await this.deleteObject(job.storageKey);
        await pool.query('DELETE FROM storage_cleanup_jobs WHERE id=$1', [job.id]);
      } catch (error) {
        const attempts = Math.min(job.attempts + 1, 10);
        await pool.query("UPDATE storage_cleanup_jobs SET attempts=$2,next_attempt_at=now()+($3 * interval '1 second'),locked_at=NULL,last_error=$4 WHERE id=$1", [job.id, attempts, Math.min(3600, 30 * 2 ** attempts), String(error.message).slice(0, 500)]);
      }
      return jobs.length;
    },
    async close() {},
  };
}

module.exports = { createStorageService };
