INSERT INTO dating_intentions (slug, label) VALUES
  ('long_term', 'Long-term relationship'),
  ('casual', 'Something casual'),
  ('friendship', 'New friends'),
  ('exploring', 'Still figuring it out')
ON CONFLICT (slug) DO UPDATE SET label = EXCLUDED.label;

INSERT INTO interests (slug, name) VALUES
  ('coffee', 'Coffee'), ('travel', 'Travel'), ('music', 'Music'),
  ('food', 'Food'), ('art', 'Art'), ('hiking', 'Hiking'),
  ('books', 'Books'), ('movies', 'Movies'), ('fitness', 'Fitness'),
  ('dogs', 'Dogs'), ('cooking', 'Cooking'), ('nature', 'Nature'),
  ('photography', 'Photography'), ('reading', 'Reading'),
  ('gaming', 'Gaming'), ('socializing', 'Socializing'),
  ('outdoors', 'Outdoors')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
