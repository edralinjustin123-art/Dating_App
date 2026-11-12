const crypto = require('node:crypto');
const path = require('node:path');
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { unavailable } = require('../utils/errors');
const { withTransaction } = require('../utils/transaction');

function createStorageService(config) {
  const credentials = config.S3_ACCESS_KEY_ID && config.S3_SECRET_ACCESS_KEY
    ? { accessKeyId: config.S3_ACCESS_KEY_ID, secretAccessKey: config.S3_SECRET_ACCESS_KEY }
    : undefined;
  const client = new S3Client({
    region: config.S3_REGION,
    endpoint: config.S3_ENDPOINT || undefined,
    forcePathStyle: config.s3ForcePathStyle,
    credentials,
  });
  const ready = Boolean(config.S3_BUCKET);

  function assertReady() {
    if (!ready) throw unavailable('Profile photo storage is not configured. Set S3_BUCKET and storage credentials or an instance role.');
  }

  return {
    isConfigured: ready,
    async uploadProfilePhoto({ userId, buffer, mimeType }) {
      assertReady();
      const extension = mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpg';
      const key = `profile-photos/${userId}/${crypto.randomUUID()}${path.extname(extension)}`;
      await client.send(new PutObjectCommand({ Bucket: config.S3_BUCKET, Key: key, Body: buffer, ContentType: mimeType, CacheControl: 'private, max-age=3600' }));
      return key;
    },
    async deleteObject(key) {
      assertReady();
      await client.send(new DeleteObjectCommand({ Bucket: config.S3_BUCKET, Key: key }));
    },
    async signedUrl(key) {
      assertReady();
      return getSignedUrl(client, new GetObjectCommand({ Bucket: config.S3_BUCKET, Key: key }), { expiresIn: config.S3_SIGNED_URL_TTL_SECONDS });
    },
    async processCleanupJobs(pool, batchSize = 20) {
      assertReady();
      const jobs = await withTransaction(pool, async (client) => {
        const { rows } = await client.query(
          `WITH ready AS (
             SELECT id FROM storage_cleanup_jobs
              WHERE next_attempt_at <= now() AND (locked_at IS NULL OR locked_at < now() - interval '5 minutes')
              ORDER BY id FOR UPDATE SKIP LOCKED LIMIT $1
           )
           UPDATE storage_cleanup_jobs j SET locked_at=now()
            FROM ready WHERE j.id=ready.id RETURNING j.id,j.storage_key AS "storageKey",j.attempts`, [batchSize],
        );
        return rows;
      });
      for (const job of jobs) {
        try {
          await client.send(new DeleteObjectCommand({ Bucket: config.S3_BUCKET, Key: job.storageKey }));
          await pool.query('DELETE FROM storage_cleanup_jobs WHERE id=$1', [job.id]);
        } catch (error) {
          const attempts = Math.min(job.attempts + 1, 10);
          const delaySeconds = Math.min(3600, 30 * (2 ** attempts));
          await pool.query(
            `UPDATE storage_cleanup_jobs SET attempts=$2,next_attempt_at=now()+($3 * interval '1 second'),locked_at=NULL,last_error=$4 WHERE id=$1`,
            [job.id, attempts, delaySeconds, String(error.message).slice(0,500)],
          );
          console.error(`Profile photo cleanup retry scheduled for job ${job.id}:`, error.message);
        }
      }
      return jobs.length;
    },
    async close() { await client.destroy(); },
  };
}

module.exports = { createStorageService };
