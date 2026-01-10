-- Seed streaming services
-- TMDB provider IDs from: https://developer.themoviedb.org/reference/watch-providers-list

insert into public.services (name, slug, default_price, tmdb_provider_id, cancel_url) values
  ('Netflix', 'netflix', 15.49, 8, 'https://www.netflix.com/cancelplan'),
  ('Amazon Prime Video', 'amazon-prime', 14.99, 9, 'https://www.amazon.com/gp/primecentral'),
  ('Disney+', 'disney-plus', 13.99, 337, 'https://www.disneyplus.com/account'),
  ('Hulu', 'hulu', 17.99, 15, 'https://secure.hulu.com/account'),
  ('HBO Max', 'hbo-max', 15.99, 384, 'https://www.max.com/account'),
  ('Apple TV+', 'apple-tv-plus', 9.99, 350, 'https://tv.apple.com/account'),
  ('Peacock', 'peacock', 13.99, 386, 'https://www.peacocktv.com/account'),
  ('Paramount+', 'paramount-plus', 11.99, 531, 'https://www.paramountplus.com/account'),
  ('Showtime', 'showtime', 10.99, 37, 'https://www.showtime.com/account'),
  ('Starz', 'starz', 9.99, 43, 'https://www.starz.com/account'),
  ('AMC+', 'amc-plus', 8.99, 526, 'https://www.amcplus.com/account'),
  ('Discovery+', 'discovery-plus', 8.99, 520, 'https://www.discoveryplus.com/account'),
  ('Crunchyroll', 'crunchyroll', 9.99, 283, 'https://www.crunchyroll.com/account'),
  ('MGM+', 'mgm-plus', 5.99, 34, 'https://www.mgmplus.com/account'),
  ('BritBox', 'britbox', 8.99, 151, 'https://www.britbox.com/account')
on conflict (slug) do nothing;
