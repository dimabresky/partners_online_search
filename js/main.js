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
var TravelsoftPartnersModule = {};

/**
 * Адрес запроса модуля
 * @type String
 */
TravelsoftPartnersModule.REQUEST_URL = "https://vetliva.ru/online";

/**
 * Адрес загрузки js
 * @type String
 */
TravelsoftPartnersModule.JS_URL = TravelsoftPartnersModule.REQUEST_URL + "/js";

/**
 * Адрес загрузки css
 * @type String
 */
TravelsoftPartnersModule.CSS_URL = TravelsoftPartnersModule.REQUEST_URL + "/css";

/**
 * Массив языковых фраз
 * @type Array
 */
TravelsoftPartnersModule.MESSAGES = [
    // 0
    "Не указаны параметры инициализации модуля",
    // 1
    "Не указаны параметры для загрузки контента (ключ display параметров инициализации)",
    // 2
    "Ошибка запроса (#url#)"
];

/**
 * Контейнер callback - функций для jsonp
 * @type Object
 */
TravelsoftPartnersModule.__callbacks = {};

/**
 * Показ предупреждения в консоле браузера
 * @param {String} message
 * @returns {undefined}
 */
TravelsoftPartnersModule.__warning = function (message) {

    console.warning(message);

};

/**
 * Отправление заропса jsonp
 * @param {String} method - название метода, который будет вызван на сервере 
 * @param {Array} parameters - объект параметров запроса
 * @param {String} success - имя функции обработчика
 * @returns {undefined}
 */
TravelsoftPartnersModule.__sendRequest = function (method, parameters, success) {

    var isOk = false;
    var callbackName = 'cb' + String(Math.random()).slice(-6);
    var url = this.REQUEST_URL + "?";
    var queryParts = [];
    var script;

    for (var i in parameters) {

        if (parameters.hasOwnProperty(i)) {
            queryParts.push("params[" + i + "]=" + parameters[i]);
        }
    }

    queryParts.push("callback=TravelsoftPartnersModule.__callbacks." + callbackName);
    queryParts.push("method=" + method);

    url += queryParts.join("&");

    // динамический сallback для обработки ответа
    this.__callbacks[callbackName] = function (data) {

        isOk = true;
        delete TravelsoftPartnersModule.__callbacks[callbackName];
        success(data);
    };

    // проверка состояния ответа
    function checkResponse() {

        if (isOk) {
            return;
        }
        delete TravelsoftPartnersModule.__callbacks[callbackName];
        TravelsoftPartnersModule.__warning(TravelsoftPartnersModule.MESSAGES[2].replace("#url#", url));
    }

    script = document.createElement('script');
    script.onload = script.onerror = checkResponse;
    script.src = url;

    document.body.appendChild(script);
};

/**
 * Контейнер методов и свойств для работы с формой поиска
 * @type Object
 */
TravelsoftPartnersModule.__forms = {};

/**
 * Обработка ответа сервера
 * @param {Object} resp
 * @returns {undefined}
 */
TravelsoftPartnersModule.__forms.success = function (resp) {
    
    if (resp.isError) {
        TravelsoftPartnersModule.__warning(resp.errorMessage);
        return;
    }
    
    TravelsoftPartnersModule.__forms.render(resp.data);
};

TravelsoftPartnersModule.__forms.render = function (data) {
    
    var iframeContent = "";
    
    
    
};

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
 *      },
 *      
 *      // ID партнера в системе
 *      partner: "",
 *      
 *      // Подпись ID партнера
 *      partnerSignature: ""
 * }
 * 
 * @returns {undefined}
 */
TravelsoftPartnersModule.init = function (parameters) {

    if (typeof parameters !== "object" || !parameters) {
        this.__warning(this.MESSAGES[0]);
        return;
    }

    if (typeof parameters.display !== "object" || !parameters.display) {
        this.__warning(this.MESSAGES[1]);
        return;
    }

    if (typeof parameters.display.forms === "object" && parameters.display.forms) {

        // запрос данных для отображения формы
        this.__sendRequest("GetFormsRenderData", [
            "tpm_params[types]=" + (function () {
                var types = [];
                for (var i in parameters.display.forms.types) {
                    if (parameters.display.forms.types.hasOwnProperty(i)) {
                        types.push(i);
                    }
                }
                return types.join("|");
            })()
        ], TravelsoftPartnersModule.__forms.success);
    }

    if (typeof parameters.display.searchResult === "object" && parameters.display.searchResult) {

        // запрос данных для отображения результата поиска
        this.__sendRequest("GetFormsRenderSearchResult", (function () {

            var queryParts = window.location.search
                    .replace("?", "")
                    .split("&")
                    .filter(function (element) {
                        return element.length > 0 && element.indexOf("tpm_params") === 0;
                    })
                    .map(function (value) {
                        return value.replace("tpm_params", "tpm_params[request]");
                    });

            queryParts.push("tpm_params[type]=" + parameters.display.searchResult.type);
            queryParts.push("tpm_params[number_per_page]=" + parameters.display.searchResult.numberPerPage);

            return queryParts.join("&");

        })(), TravelsoftPartnersModule.__searchResult.success);

    }

};

