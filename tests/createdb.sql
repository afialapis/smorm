DROP TABLE IF EXISTS minorm_test;

CREATE TABLE minorm_test (
  id           serial,
  name         TEXT NOT NULL,
  description  TEXT NULL,
  counter      INTEGER
);