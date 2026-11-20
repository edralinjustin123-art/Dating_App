ALTER TABLE profile_photos RENAME COLUMN storage_key TO cloudinary_public_id;
ALTER TABLE profile_photos RENAME COLUMN sort_order TO position;
ALTER TABLE profile_photos ADD COLUMN photo_url text NOT NULL DEFAULT '';
ALTER TABLE profile_photos DROP CONSTRAINT profile_photos_sort_order_check;
ALTER TABLE profile_photos DROP CONSTRAINT profile_photos_user_id_sort_order_key;
ALTER TABLE profile_photos ADD CONSTRAINT profile_photos_user_position_key UNIQUE (user_id, position) DEFERRABLE INITIALLY DEFERRED;
DROP INDEX IF EXISTS profile_photos_user_order_idx;
CREATE INDEX profile_photos_user_order_idx ON profile_photos (user_id, position);
