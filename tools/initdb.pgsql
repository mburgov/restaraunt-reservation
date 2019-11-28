DROP TABLE IF EXISTS reservations;

CREATE TABLE IF NOT EXISTS reservations(
  id SERIAL PRIMARY KEY,
  booking_time TIMESTAMP, 
  username VARCHAR(20),
  available BOOLEAN DEFAULT true
);

-- CREATE 8 TABLES FOR THE RESTAURANT
INSERT INTO reservations(username)
VALUES(''),
      (''),
      (''),
      (''),
      (''),
      (''),
      (''),
      ('');

