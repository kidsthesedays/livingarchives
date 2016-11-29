DROP TABLE IF EXISTS statistics;

CREATE TABLE statistics (
    id SERIAL PRIMARY KEY,
    guid INTEGER,
    location INTEGER,
    type VARCHAR,
    created DATE,
    UNIQUE (guid, location, type)
);
