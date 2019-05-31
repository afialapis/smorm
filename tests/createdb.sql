-- sudo -u postgres createdb smorm
-- alias dbs='psql -d smorm -U postgres -h localhost'

DROP TABLE IF EXISTS smorm_test;

CREATE TABLE smorm_test (
  id           serial,
  name         TEXT NOT NULL,
  description  TEXT NULL,
  counter      INTEGER
);