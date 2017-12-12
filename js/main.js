/**
 * Модуль поиска тур. услуг на сайте партнера
 * @author dimabresky
 * @copyright (c) 2017, travelsoft 
 */

"use strict";

/**
 * Пространство имен поиска тур. услуг на сайте партнера
 * @type Object
 */
var TravelsoftPartnersOnline = {};

TravelsoftPartnersOnline.__messages = [
    // 0
    "Не указаны параметры инициализации модуля",
    // 1
    "Не указаны параметры для загрузки контента (ключ display параметров инициализации)"
];

/**
 * Инициализация поиска тур. услуг
 * @param {Object} parameters {
 *      
 *      // формирование отображений
 *      display: {
 *          
 *          // для форм поиска
 *          forms: {
 *                  
 *              // типы форм
 *              types: {
 *                      
 *                  // экскурсии
 *                  excursions: {
 *                      
 *                      // страница результатов поиска
 *                      url: ""
 *                  },
 *                      
 *                  // объекты размещений
 *                  placements: {
 *                      
 *                      url: ""
 *                  },
 *                      
 *                  // санатории
 *                  sanatorium: {
 *                      
 *                      url: ""
 *                  },
 *                      
 *                  // трансферы
 *                  tranfers: {
 *                      
 *                      url: ""
 *                  }
 *              },
 *              
 *              // применить костомные стили
 *              // задавать в виде строки
 *              customCss: ""
 *              
 *          },
 *          
 *          searchResult: {
 *              
 *              // тип объектов поиска
 *              type: excursion || placement || sanatorium || transfers,
 *              
 *              // применить костомные стили
 *              // задавать в виде строки
 *              customCss: "",
 *              
 *              // количество на страницу
 *              numberPerPage: 10
 *          }
 *      } 
 * }
 * 
 * @returns {undefined}
 */
TravelsoftPartnersOnline.init = function (parameters) {
    
    if (typeof parameters !== "object" || !parameters) {
        this.__warning(this.__messages[0]);
        return;
    }
    
    if (typeof parameters.display !== "object" || !parameters.display) {
        this.__warning(this.__messages[1]);
        return;
    }
    
    
    
};

/**
 * Показ предупреждения в консоле браузера
 * @param {String} message
 * @returns {undefined}
 */
TravelsoftPartnersOnline.__warning = function (message) {
    
    console.warning(message);
    
};
