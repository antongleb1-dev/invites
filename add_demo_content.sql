-- Добавление wishlist, галереи и пожеланий для демо-страниц

-- Получаем ID свадеб
SET @aigerim_id = (SELECT id FROM weddings WHERE slug = 'demo-aigerim-nurlan');
SET @anna_id = (SELECT id FROM weddings WHERE slug = 'demo-anna-dmitry');
SET @asel_id = (SELECT id FROM weddings WHERE slug = 'demo-asel-erlan');

-- Wishlist для Aigerim & Nurlan
INSERT INTO wishlist_items (weddingId, name, nameKz, description, descriptionKz, link, `order`, createdAt, updatedAt) VALUES
(@aigerim_id, 'Сервиз для чая', 'Шай сервизі', 'Красивый фарфоровый сервиз на 6 персон', 'Алты адамға арналған әдемі фарфор сервиз', 'https://kaspi.kz', 1, NOW(), NOW()),
(@aigerim_id, 'Ковер ручной работы', 'Қол жұмысы кілем', 'Традиционный казахский ковер', 'Дәстүрлі қазақ кілемі', 'https://kaspi.kz', 2, NOW(), NOW()),
(@aigerim_id, 'Постельное белье', 'Төсек-орын', 'Качественное постельное белье из хлопка', 'Мақтадан жасалған сапалы төсек-орын', 'https://kaspi.kz', 3, NOW(), NOW());

-- Wishlist для Anna & Dmitry
INSERT INTO wishlist_items (weddingId, name, nameKz, description, descriptionKz, link, `order`, createdAt, updatedAt) VALUES
(@anna_id, 'Кофемашина', 'Кофе машинасы', 'Автоматическая кофемашина для дома', 'Үйге арналған автоматты кофе машинасы', 'https://kaspi.kz', 1, NOW(), NOW()),
(@anna_id, 'Набор бокалов', 'Бокалдар жиынтығы', 'Хрустальные бокалы для вина', 'Шарап үшін хрустальды бокалдар', 'https://kaspi.kz', 2, NOW(), NOW()),
(@anna_id, 'Фоторамки', 'Фото рамкалар', 'Набор современных фоторамок', 'Заманауи фото рамкаларының жиынтығы', 'https://kaspi.kz', 3, NOW(), NOW());

-- Wishlist для Asel & Erlan
INSERT INTO wishlist_items (weddingId, name, nameKz, description, descriptionKz, link, `order`, createdAt, updatedAt) VALUES
(@asel_id, 'Ваза для цветов', 'Гүл вазасы', 'Красивая ваза из богемского стекла', 'Богемия әйнегінен жасалған әдемі ваза', 'https://kaspi.kz', 1, NOW(), NOW()),
(@asel_id, 'Свечи ароматные', 'Хош иісті шамдар', 'Набор ароматических свечей', 'Хош иісті шамдардың жиынтығы', 'https://kaspi.kz', 2, NOW(), NOW()),
(@asel_id, 'Плед', 'Жамылғы', 'Мягкий плед для уютных вечеров', 'Жайлы кештерге арналған жұмсақ жамылғы', 'https://kaspi.kz', 3, NOW(), NOW());

-- Галерея для демо-страниц
INSERT INTO gallery_images (weddingId, imageUrl, caption, captionKz, `order`, createdAt, updatedAt) VALUES
(@aigerim_id, 'https://picsum.photos/600/400?random=11', 'Помолвка', 'Құда түсу', 1, NOW(), NOW()),
(@aigerim_id, 'https://picsum.photos/600/400?random=12', 'Свадебная фотосессия', 'Той фотосессиясы', 2, NOW(), NOW()),
(@aigerim_id, 'https://picsum.photos/600/400?random=13', 'Традиционные наряды', 'Дәстүрлі киімдер', 3, NOW(), NOW()),
(@anna_id, 'https://picsum.photos/600/400?random=21', 'Предложение', 'Ұсыныс', 1, NOW(), NOW()),
(@anna_id, 'https://picsum.photos/600/400?random=22', 'Романтическая прогулка', 'Романтикалық серуен', 2, NOW(), NOW()),
(@anna_id, 'https://picsum.photos/600/400?random=23', 'Вместе навсегда', 'Мәңгілік бірге', 3, NOW(), NOW()),
(@asel_id, 'https://picsum.photos/600/400?random=31', 'Первое свидание', 'Алғашқы кездесу', 1, NOW(), NOW()),
(@asel_id, 'https://picsum.photos/600/400?random=32', 'Цветы и романтика', 'Гүлдер мен романтика', 2, NOW(), NOW()),
(@asel_id, 'https://picsum.photos/600/400?random=33', 'Наша любовь', 'Біздің сүйіспеншілік', 3, NOW(), NOW());

-- Пожелания для демо-страниц
INSERT INTO wishes (weddingId, guestName, message, isApproved, createdAt, updatedAt) VALUES
(@aigerim_id, 'Асылхан', 'Жас отбасыға бақыт пен берекет тілейміз! Махаббатыңыз мәңгі жалғассын!', 1, NOW(), NOW()),
(@aigerim_id, 'Гульмира', 'Қымбатты достарым, сіздерге ұзақ және бақытты ғомыр тілеймін. Махаббат пен келісімде өмір сүріңіздер!', 1, NOW(), NOW()),
(@aigerim_id, 'Ерлан', 'Жаңа отбасына жақсылық пен амандық тілейміз. Балапандарыңыз көп болсын!', 1, NOW(), NOW()),
(@anna_id, 'Елена', 'Дорогие Анна и Дмитрий! Желаем вам крепкой любви, взаимопонимания и счастья на долгие годы!', 1, NOW(), NOW()),
(@anna_id, 'Александр', 'Пусть ваш союз будет крепким как алмаз и нежным как шелк. Поздравляю!', 1, NOW(), NOW()),
(@anna_id, 'Мария', 'Любите друг друга, цените каждый момент вместе. Счастья вам, молодожены!', 1, NOW(), NOW()),
(@asel_id, 'Айгуль', 'Әсел мен Ерланға шын жүректен қуаныш пен бақыт тілейміз! Махаббатыңыз мәңгі гүлденсін!', 1, NOW(), NOW()),
(@asel_id, 'Нурлан', 'Қымбатты достарыма ұзақ ғұмыр, бақытты ғумыр тілеймін. Бір-біріңізді қадірлеңіздер!', 1, NOW(), NOW()),
(@asel_id, 'Динара', 'Жас отбасыға берекет пен бақыт тілейміз. Тәтті балапандарыңыз көп болсын!', 1, NOW(), NOW());