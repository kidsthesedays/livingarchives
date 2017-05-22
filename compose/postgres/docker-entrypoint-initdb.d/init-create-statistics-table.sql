DROP TABLE IF EXISTS statisticsFindingAlberta;
DROP TABLE IF EXISTS statisticsBitterAndSweet;

CREATE TABLE statisticsFindingAlberta (
    id SERIAL PRIMARY KEY,
    guid INTEGER,
    location INTEGER,
    type VARCHAR,
    created DATE,
    UNIQUE (guid, location, type)
);

CREATE TABLE statisticsBitterAndSweet (
    id SERIAL PRIMARY KEY,
    guid INTEGER,
    location INTEGER,
    type VARCHAR,
    created DATE,
    UNIQUE (guid, location, type)
);
