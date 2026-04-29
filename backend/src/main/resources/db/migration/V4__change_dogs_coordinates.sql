UPDATE dog SET initial_latitude = 41.9985, initial_longitude = 21.4305
WHERE name = 'Zuco';

UPDATE dog SET initial_latitude = 41.9955, initial_longitude = 21.4085
WHERE name IS NULL AND color = 'white';