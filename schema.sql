DROP TABLE IF EXISTS information;
DROP table if EXISTS weathers;
DROP table if EXISTS yelps;
DROP table if EXISTS movies;
CREATE TABLE information (
    id SERIAL PRIMARY KEY,
    city VARCHAR(255),
    latitude VARCHAR(255),
    longitude VARCHAR(255)

);
