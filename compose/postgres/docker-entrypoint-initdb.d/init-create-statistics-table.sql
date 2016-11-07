DROP TABLE IF EXISTS statistics;

CREATE TABLE statistics (
    id SERIAL PRIMARY KEY,
    guid VARCHAR,
    type VARCHAR,
    location VARCHAR,
    created DATE
);
