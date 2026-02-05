/**
 * Улучшенная система защиты полей формы
 * Работает совместно с React вместо конфликта с ним
 */
(function() {
  'use strict';
  
  const PROTECTED_FIELDS = [
    '#title', 
    '#titleKz', 
    '#description', 
    '#descriptionKz', 
    '#location', 
    '#locationKz', 
    '#mapUrl', 
    '#slug'
  ];
  
  let formData = {};
  let isFormDirty = false;
  let saveInProgress = false;
  
  const protectFormFields = () => {
    // Проверяем, что мы на странице редактирования
    if (!window.location.pathname.includes('/edit/')) {
      return;
    }
    
    let protectedCount = 0;
    
    PROTECTED_FIELDS.forEach(selector => {
      const field = document.querySelector(selector);
      
      // Защищаем только новые поля
      if (field && !field.dataset.smartProtected) {
        setupSmartProtection(field, selector);
        protectedCount++;
      }
    });
    
    if (protectedCount > 0) {
      console.log(`🛡️ Умная защита активна для ${protectedCount} полей`);
    }
  };
  
  const setupSmartProtection = (field, selector) => {
    // Помечаем поле как защищенное
    field.dataset.smartProtected = 'true';
    
    const fieldId = selector.substring(1);
    
    // Сохраняем первоначальное значение
    if (!formData[fieldId]) {
      formData[fieldId] = field.value;
    }
    
    // Более умное отслеживание изменений
    const handleInput = (e) => {
      const newValue = e.target.value;
      
      // Обновляем наши данные
      formData[fieldId] = newValue;
      isFormDirty = true;
      
      // Сохраняем в localStorage
      const backupKey = `smart-backup-${fieldId}`;
      localStorage.setItem(backupKey, newValue);
      
      console.log(`📝 Сохранено: ${fieldId} = "${newValue.substring(0, 30)}${newValue.length > 30 ? '...' : ''}"`);
      
      // Устанавливаем флаг что это пользовательское изменение
      field.dataset.userModified = 'true';
      field.dataset.lastUserValue = newValue;
      
      // Очищаем предыдущий таймер автосохранения
      clearTimeout(window.autoSaveTimer);
      
      // Автосохранение через 2 секунды бездействия
      window.autoSaveTimer = setTimeout(() => {
        if (isFormDirty && !saveInProgress) {
          saveFormData();
        }
      }, 2000);
    };
    
    // Отслеживание изменений от пользователя
    field.addEventListener('input', handleInput);
    field.addEventListener('change', handleInput);
    field.addEventListener('paste', (e) => {
      setTimeout(() => handleInput(e), 10);
    });
    
    // Защита от перезаписи React'ом только если поле было изменено пользователем
    const observer = new MutationObserver(() => {
      // Проверяем только если поле было изменено пользователем
      if (field.dataset.userModified === 'true' && 
          field.dataset.lastUserValue && 
          field.value !== field.dataset.lastUserValue &&
          !saveInProgress) {
        
        console.log(`🛡️ Восстанавливаю ${fieldId}: "${field.dataset.lastUserValue}"`);
        field.value = field.dataset.lastUserValue;
        
        // Триггерим событие для React
        const event = new Event('input', { bubbles: true });
        field.dispatchEvent(event);
      }
    });
    
    observer.observe(field, { 
      attributes: true, 
      attributeFilter: ['value'],
      childList: false,
      subtree: false
    });
    
    // Восстанавливаем из localStorage при инициализации
    const backupKey = `smart-backup-${fieldId}`;
    const savedValue = localStorage.getItem(backupKey);
    if (savedValue && savedValue !== field.value) {
      console.log(`🔄 Восстанавливаю ${fieldId} из backup`);
      field.value = savedValue;
      field.dataset.userModified = 'true';
      field.dataset.lastUserValue = savedValue;
      formData[fieldId] = savedValue;
      
      // Уведомляем React об изменении
      setTimeout(() => {
        const event = new Event('input', { bubbles: true });
        field.dispatchEvent(event);
        const changeEvent = new Event('change', { bubbles: true });
        field.dispatchEvent(changeEvent);
      }, 100);
    }
    
    // Очистка при удалении элемента
    const cleanup = () => {
      observer.disconnect();
      clearTimeout(window.autoSaveTimer);
    };
    
    // Отслеживаем удаление элемента из DOM
    const parentObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (node === field || (node.contains && node.contains(field))) {
            cleanup();
            parentObserver.disconnect();
          }
        });
      });
    });
    
    parentObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  };
  
  // Функция автосохранения через API
  const saveFormData = async () => {
    if (saveInProgress || !isFormDirty) {
      return;
    }
    
    saveInProgress = true;
    console.log('💾 Автосохранение...');
    
    try {
      // Ищем кнопку сохранения и имитируем её нажатие
      const saveButton = document.querySelector('button[type="submit"]');
      if (saveButton) {
        // Программно нажимаем кнопку сохранения
        saveButton.click();
        console.log('✅ Форма сохранена автоматически');
        
        // Очищаем backup после успешного сохранения
        setTimeout(() => {
          PROTECTED_FIELDS.forEach(selector => {
            const fieldId = selector.substring(1);
            localStorage.removeItem(`smart-backup-${fieldId}`);
          });
          console.log('🧹 Backup очищен после сохранения');
        }, 3000);
        
        isFormDirty = false;
      }
    } catch (error) {
      console.error('❌ Ошибка автосохранения:', error);
    } finally {
      setTimeout(() => {
        saveInProgress = false;
      }, 1000);
    }
  };
  
  // Обработчик перед закрытием страницы
  const handleBeforeUnload = (e) => {
    if (isFormDirty && !saveInProgress) {
      // Сохраняем данные в localStorage
      PROTECTED_FIELDS.forEach(selector => {
        const field = document.querySelector(selector);
        if (field && field.dataset.userModified === 'true') {
          const fieldId = selector.substring(1);
          const backupKey = `smart-backup-${fieldId}`;
          localStorage.setItem(backupKey, field.value);
        }
      });
      
      e.preventDefault();
      e.returnValue = 'У вас есть несохранённые изменения. Покинуть страницу?';
      return e.returnValue;
    }
  };
  
  // Инициализация системы защиты
  const initSmartProtection = () => {
    protectFormFields();
    
    // Обработчик перед уходом со страницы
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Обработчик смены видимости страницы
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && isFormDirty && !saveInProgress) {
        // Сохраняем данные при переключении вкладок
        PROTECTED_FIELDS.forEach(selector => {
          const field = document.querySelector(selector);
          if (field && field.dataset.userModified === 'true') {
            const fieldId = selector.substring(1);
            const backupKey = `smart-backup-${fieldId}`;
            localStorage.setItem(backupKey, field.value);
          }
        });
        console.log('💾 Данные сохранены при переключении вкладки');
      } else if (!document.hidden) {
        // Восстанавливаем защиту при возврате на страницу
        setTimeout(initSmartProtection, 200);
      }
    });
  };
  
  // Запускаем защиту когда DOM готов
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmartProtection);
  } else {
    initSmartProtection();
  }
  
  // Переактивируем защиту при переходах между страницами (для SPA)
  let lastPathname = window.location.pathname;
  const navigationWatcher = setInterval(() => {
    if (window.location.pathname !== lastPathname) {
      lastPathname = window.location.pathname;
      // Сбрасываем состояние при переходе
      isFormDirty = false;
      saveInProgress = false;
      formData = {};
      setTimeout(initSmartProtection, 500);
    }
  }, 100);
  
  // Отладочная информация
  console.log('🧠 Умная система защиты полей формы инициализирована');
  
  // API для внешнего управления
  window.SmartFormProtection = {
    protect: protectFormFields,
    init: initSmartProtection,
    save: saveFormData,
    isDirty: () => isFormDirty,
    getData: () => ({ ...formData }),
    clearBackup: () => {
      PROTECTED_FIELDS.forEach(selector => {
        const fieldId = selector.substring(1);
        localStorage.removeItem(`smart-backup-${fieldId}`);
      });
    }
  };
  
})();