// Utilities for translations used in renderer. Pure functions for unit tests.

function getFallbackTranslations(lang) {
  if (lang === 'ru') {
    return {
      nav: {
        main: "Главная",
        install: "Установка",
        remove: "Удаление",
        customize: "Настройка",
        backup: "Резервная копия",
        tools: "Инструменты",
        info: "Информация",
        components: "Компоненты",
        tools_group: "Инструменты"
      },
      models: { k1: "K1", "k1-max": "K1 Max", k1c: "K1C", k1se: "K1SE", k1s: "K1S", "ender-3-v3": "Ender-3 V3", "ender-3-v3-se": "Ender-3 V3 SE", "ender-3-v3-ke": "Ender-3 V3 KE", e5m: "Ender 5 Max" },
    };
  }
  return {
    nav: { main: "Main", install: "Install", remove: "Remove", customize: "Customize", backup: "Backup", tools: "Tools", info: "Info" },
    models: { k1: "K1", "k1-max": "K1 Max", k1c: "K1C", k1se: "K1SE", k1s: "K1S", "ender-3-v3": "Ender-3 V3", "ender-3-v3-se": "Ender-3 V3 SE", "ender-3-v3-ke": "Ender-3 V3 KE", e5m: "Ender 5 Max" },
  };
}

function createTranslator(translations, lang) {
  return function t(key) {
    const keys = key.split('.');
    let value = translations[lang];
    for (const k of keys) {
      if (value && Object.prototype.hasOwnProperty.call(value, k)) {
        value = value[k];
      } else {
        return key;
      }
    }
    return value;
  };
}

module.exports = {
  getFallbackTranslations,
  createTranslator,
};


