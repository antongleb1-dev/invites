/**
 * ВРЕМЕННОЕ ОТКЛЮЧЕНИЕ системы защиты форм
 * Чтобы можно было нормально редактировать блоки конструктора
 */
(function() {
  'use strict';
  
  console.log('🚫 Система защиты форм ОТКЛЮЧЕНА для редактирования блоков конструктора');
  
  // Очищаем все backups
  const clearAllBackups = () => {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('field-backup-') || key.startsWith('smart-backup-')) {
        sessionStorage.removeItem(key);
      }
    });
    console.log('🧹 Все backups очищены');
  };
  
  // Очищаем backups сразу
  clearAllBackups();
  
  // Экспортируем только функцию очистки
  window.FormProtection = {
    clearBackup: clearAllBackups,
    disabled: true
  };
  
})();