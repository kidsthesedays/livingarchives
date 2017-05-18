DROP TABLE IF EXISTS statisticsFA;
DROP TABLE IF EXISTS statisticsBS;
DROP TABLE IF EXISTS statisticsSA;

CREATE TABLE statisticsFA (
    id SERIAL PRIMARY KEY,
    guid INTEGER,
    location INTEGER,
    type VARCHAR,
    created DATE,
    UNIQUE (guid, location, type)
);

CREATE TABLE statisticsBS (
    id SERIAL PRIMARY KEY,
    guid INTEGER,
    location INTEGER,
    type VARCHAR,
    created DATE,
    UNIQUE (guid, location, type)
);

CREATE TABLE statisticsSA (
    id SERIAL PRIMARY KEY,
    guid INTEGER,
    location INTEGER,
    type VARCHAR,
    created DATE,
    UNIQUE (guid, location, type)
);
