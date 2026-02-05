-- Исправление кодировки демо-записей
UPDATE weddings SET 
  title = 'Айгерім & Нұрлан',
  titleKz = 'Айгерім және Нұрлан'
WHERE id = 32;

UPDATE weddings SET 
  title = 'Анна & Дмитрий',
  titleKz = 'Анна және Дмитрий'
WHERE id = 33;

UPDATE weddings SET 
  title = 'Әсел & Ерлан',
  titleKz = 'Әсел және Ерлан'
WHERE id = 34;