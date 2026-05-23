-- Демо-категории для ленты на главной (идемпотентно)
INSERT INTO "categories" ("id", "name", "slug", "parentId", "sortOrder", "createdAt", "updatedAt")
VALUES
  ('cat_audio', 'Аудио', 'audio', NULL, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_shoes', 'Обувь', 'shoes', NULL, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_accessories', 'Аксессуары', 'accessories', NULL, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_sport', 'Спорт', 'sport', NULL, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_home', 'Дом', 'home', NULL, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_appliances', 'Бытовая техника', 'appliances', NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sortOrder" = EXCLUDED."sortOrder",
  "updatedAt" = CURRENT_TIMESTAMP;
