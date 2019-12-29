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
CREATE table weathers (
    id serial primary key,
    forecast varchar(255),
    time varchar(255)
);

CREATE table yelps (
    id serial primary key,
    name varchar(255),
    image_url varchar(255),
    price int,
    rating numeric(2,1),
    url varchar(255)
);

CREATE table movies (
    id serial primary key,
    title varchar(255),
    overview varchar(255),
    average_votes numeric (8,2),
    total_votes numeric(8,0),
    image_url varchar(255),
    popularity numeric(6,4),
    released_on varchar(255)
);
