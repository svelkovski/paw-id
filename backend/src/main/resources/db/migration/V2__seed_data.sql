-- V2 - Seed data
-- Sample dogs using the correct column names from V1.

INSERT INTO dog (name, size, color, description, photo_filename, initial_health_status, initial_area_label, initial_latitude, initial_longitude) VALUES
    ('Buddy',  'MEDIUM', 'brown',  'Friendly brown dog, always wagging tail. Missing left ear.',            NULL, 'HEALTHY',         'Old Bazaar, Skopje',    41.9973, 21.4280),
    ('Luna',   'SMALL',  'white',  'White and black spotted female. Limping on front right leg.',           NULL, 'NEEDS_ATTENTION', 'City Park, Skopje',     41.9938, 21.4072),
    (NULL,     'LARGE',  'black',  'Large black dog seen near dumpsters. Seems hungry but not aggressive.', NULL, 'HEALTHY',         'Aerodrom, Skopje',      41.9761, 21.4326),
    ('Rex',    'LARGE',  'tan',    'Old German Shepherd mix. Friendly with kids.',                          NULL, 'HEALTHY',         'Kisela Voda, Skopje',   41.9580, 21.4529),
    ('Mila',   'SMALL',  'beige',  'Small fluffy beige dog. Appears to be a former house pet.',             NULL, 'HEALTHY',         'Gazi Baba, Skopje',     42.0067, 21.4706),
    (NULL,     'MEDIUM', 'grey',   'Medium grey dog, shy and skittish. Runs away when approached.',         NULL, 'HEALTHY',         'Karpos, Skopje',        42.0047, 21.3930),
    ('Zuco',   'MEDIUM', 'yellow', 'Yellow stray, well-known in the neighbourhood. Very friendly.',         NULL, 'HEALTHY',         'Old Bazaar, Skopje',    41.9973, 21.4280),
    ('Cica',   'SMALL',  'brown',  'Small injured female, visible wound on back leg. Needs urgent care.',   NULL, 'INJURED',         'Chair, Skopje',         42.0150, 21.4350),
    (NULL,     'LARGE',  'white',  'Large white dog with black patches. Calm temperament.',                 NULL, 'HEALTHY',         'City Park, Skopje',     41.9938, 21.4072),
    ('Tara',   'MEDIUM', 'orange', 'Young female, possibly 1 year old. Very playful.',                      NULL, 'HEALTHY',         'Butel, Skopje',         42.0265, 21.4372);
