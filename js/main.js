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
 * Адрес сайта запросов модуля
 * @type String
 */
TravelsoftPartnersModule.SITE_ADDRESS = "https://vetliva.ru";

/**
 * Адрес запроса модуля
 * @type String
 */
TravelsoftPartnersModule.REQUEST_URL = TravelsoftPartnersModule.SITE_ADDRESS + "/travelsoft.pm";

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

TravelsoftPartnersModule.IFRAME_CONTENT_TEMPLATE = `<!DOCTYPE html>
                                                                                                    <html>
                                                                                                        <head>
                                                                                                            <title>Поиск</title>
                                                                                                            <meta charset="UTF-8">
                                                                                                            {{stylesheets}}
                                                                                                        </head>
                                                                                                        <body>
                                                                                                            {{content}}
                                                                                                            {{scripts}}
                                                                                                        </body>
                                                                                                    </html>`;

/**
 * Контейнер callback - функций для jsonp
 * @type Object
 */
TravelsoftPartnersModule.__callbacks = {};

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
    var url = this.REQUEST_URL + "/?";
    var queryParts = parameters;
    var script;

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
        console.warn(TravelsoftPartnersModule.MESSAGES[2].replace("#url#", url));
    }

    script = document.createElement('script');
    script.type = "text/javascript";
    script.onload = checkResponse;
    script.onerror = checkResponse;
    script.src = url;

    document.body.appendChild(script);
};

/**
 * Экранирование спец. символов
 * @param {String} text
 * @returns {String}
 */
TravelsoftPartnersModule.__screen = function (text) {

    var text_ = '';
    if (typeof (text) === "string") {
        text_ = text.replace(/&/g, "&amp;");
        text_ = text.replace(/</g, "&lt;");
        text_ = text.replace(/"/g, "&quot;");
        text_ = text.replace(/>/g, "&gt;");
        text_ = text.replace(/'/g, "&#039;");
        text_ = text.replace(/script/g, "");
        text_ = text.replace(/onclick/g, "");
        text_ = text.replace(/onchange/g, "");
        text_ = text.replace(/onkeydown/g, "");
        text_ = text.replace(/onkeypress/g, "");
        text_ = text.replace(/onmouseout/g, "");
        text_ = text.replace(/onmouseover/g, "");
    }

    return text_;

};

/**
 * Установка высоты фрейма
 * @param {DOMNode} id
 * @returns {undefined}
 */
TravelsoftPartnersModule.__setIframeHeight = function (iframe) {
    setTimeout(function () {
        
        var doc = iframe.contentDocument ? iframe.contentDocument :
                iframe.contentWindow.document;
        iframe.style.visibility = 'hidden';
        iframe.style.height = doc.scrollingElement.scrollHeight + 4 + "px";
        iframe.style.visibility = 'visible';
    }, 100);

}

/**
 * Контейнер методов и свойств для работы с результами поиска
 * @type Object
 */
TravelsoftPartnersModule.__searchResult = {};

/**
 * Обработка ответа сервера
 * @param {Object} resp
 * @returns {undefined}
 */
TravelsoftPartnersModule.__searchResult.success = function (resp) {

    if (resp.isError) {
        console.warn(resp.errorMessage);
        return;
    }

    TravelsoftPartnersModule.__searchResult.render(resp.data);

};

/**
 * Отрисовка результатов поиска на сайте партнера
 * @param {Object} data
 * @returns {undefined}
 */
TravelsoftPartnersModule.__searchResult.render = function (data) {

    var __screen = TravelsoftPartnersModule.__screen;

    var iframe = document.createElement("iframe");

    var iframeBodyContent = `<div class="container">
                                                    ${(function (items) {

        return items.map(function (item) {
            return `<div class="row">
                                                                                <div class="thumbnail row-flex row-flex-wrap mrtb-10">
                                                                                    <div class="col-lg-4 col-md-4 col-sm-4 col-xs-12">
                                                                                            <img class="main-img" src="${__screen(TravelsoftPartnersModule.SITE_ADDRESS + item.imgSrc)}">
                                                                                    </div>
                                                                                    <div class="col-lg-8 col-md-8 col-sm-8 col-xs-12 flex-col">

                                                                                        <div class="name">${__screen(item.name)}</div>
                                                                                        <div class="stars-block">
                                                                                            ${(function (stars) {
                var html = ``;
                for (var i = 1; i <= stars; i++) {
                    html += `<span class="glyphicon glyphicon-star" aria-hidden="true"></span>`;
                }
                return html;
            })(item.stars)}
                                                                                        </div>
                                                                                        <ul>
                                                                                            <li><span class="glyphicon glyphicon-map-marker" aria-hidden="true"></span> ${__screen(item.address)}</li>
                                                                                            <li><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> ${__screen(item.text.distance.center)}</li>
                                                                                            <li><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> ${__screen(item.text.distance.airport)}</li>
                                                                                        </ul>
                                                                                        <div class="show-details-block flex-grow">
                                                                                            <button class="btn btn-primary show-details" type="button">От 56 BYN/ночь <span class="glyphicon glyphicon-chevron-down" aria-hidden="true"></button>
                                                                                        </div>

                                                                                    </div>
                                                                                </div>
                                                                            </div>`;
        }).join("");

    })(data.items)}
                                                    
                                            </div>`;

    var iframeStylesheets = (function () {

        return [

            TravelsoftPartnersModule.CSS_URL + "/bootstrap.min.css",
            TravelsoftPartnersModule.CSS_URL + "/bootstrap-theme.min.css",
            TravelsoftPartnersModule.CSS_URL + "/search-result/styles.css"

        ].map(function (link) {
            return `<link rel="stylesheet" href="${link}">`;
        }).join("");

    })();

    var iframeScripts = (function () {
        return "";
//        return [
//
//            TravelsoftPartnersModule.JS_URL + "/jquery-3.2.1.min.js",
//            TravelsoftPartnersModule.JS_URL + "/bootstrap.min.js",
//            TravelsoftPartnersModule.JS_URL + "/select2.full.min.js",
//            TravelsoftPartnersModule.JS_URL + "/moment.min.js",
//            TravelsoftPartnersModule.JS_URL + "/moment_locales.min.js",
//            TravelsoftPartnersModule.JS_URL + "/daterangepicker.min.js",
//            TravelsoftPartnersModule.JS_URL + "/forms/main.js?" + Math.random() * 100000
//        ].map(function (src) {
//            return `<script type="text/javascript" src="${src}"></script>`;
//        }).join("");

    })();

    var iframeContent = (function () {

        var html = TravelsoftPartnersModule.IFRAME_CONTENT_TEMPLATE;

        return html.replace("{{stylesheets}}", iframeStylesheets)
                .replace("{{content}}", iframeBodyContent)
                .replace("{{scripts}}", iframeScripts);

    })();

    iframe.id = "search-result";

    iframe.src = "about:blank";

    iframe.style.width = "100%";

    iframe.style.border = "none";

    document.getElementById("search-result-iframe-block").replaceChild(
            iframe, document.getElementById("search-result-iframe-block").querySelector("span"));

    setTimeout(function () {
        iframe.contentDocument.write(iframeContent);
        TravelsoftPartnersModule.__setIframeHeight(iframe);
    }, 100);


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
        console.warn(resp.errorMessage);
        return;
    }

    TravelsoftPartnersModule.__forms.render(resp.data);
};

/**
 * Отрисовка формы поиска на сайте партнера
 * @param {Object} data
 * @returns {undefined}
 */
TravelsoftPartnersModule.__forms.render = function (data) {

    var __screen = TravelsoftPartnersModule.__screen;

    var iframe = document.createElement("iframe");

    var iframeBodyContent = `<div class="container">
                                            <div class="row">
                                                
                                                <ul class="nav nav-tabs">
                                                    ${(function (data) {

        var html = "";

        for (var key in data) {

            if (data.hasOwnProperty(key)) {
                html += `<li ${data[key].tabIsActive ? 'class="active"' : ''}><a data-toggle="tab" href="#${__screen(key)}-form-area">${__screen(data[key].tabTitle)}</a></li>`;
            }

        }

        return html;
    })(data)}
                                                </ul>

                                                <div class="tab-content clearfix">
                                                    ${(function () {

        var html = "", key_;

        for (var key in data) {

            if (!data.hasOwnProperty(key)) {
                continue;
            }

            key_ = __screen(key);

            html += `<div class="tab-pane ${data[key].tabIsActive ? 'active' : ''}" id="${key_}-form-area">
                                                            <form id="${key}-form">
                                                                <div class="col-md-3 col-sm-6">
                                                                    <div class="form-group">
                                                                        <label>
                                                                            ${__screen(data[key].objects.title)}
                                                                        </label>
                                                                        <select name="tpm_params[id][]" class="form-control select2">
                                                                            ${(function (objects) {

                var html = "";

                for (var i = 0; i < objects.length; i++) {

                    html += `<option ${objects[i].isSelected ? 'selected=""' : ''} value="${__screen(objects[i].id)}">${__screen(objects[i].name)}</option>`;
                }

                return html;

            })(data[key].objects.forSelect)}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div class="col-md-3 col-sm-6">
                                                                    <div class="form-group">
                                                                        <label>
                                                                            ${__screen(data[key].dates.title)}
                                                                        </label>
                                                                        <input data-format="${__screen(data[key].dates.format)}" data-date-separator="${__screen(data[key].dates.separator)}" data-duration-title="${__screen(data[key].dates.durationTitle)}" value="${__screen(data[key].dates.inputValue)}" name="date_range" type="text" class="datepicker form-control" >
                                                                    </div>
                                                                </div>
                                                                <div class="col-md-2 col-sm-6">
                                                                    <div class="form-group">
                                                                        <label>
                                                                            ${__screen(data[key].adults.title)}
                                                                        </label>
                                                                        <select name="tpm_params[adults]" class="form-control select2">
                                                                            <option value="1">1</option>
                                                                            <option value="2">2</option>
                                                                            <option value="3">3</option>
                                                                            <option value="4">4</option>
                                                                            <option value="5">5</option>
                                                                            <option value="6">6</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div class="col-md-2 col-sm-6">
                                                                    <div class="form-group">
                                                                        <label>
                                                                            ${__screen(data[key].children.title)}
                                                                        </label>
                                                                        <select data-onselect-handler-name="childCountChoosing" name="tpm_params[children]" class="form-control select2">
                                                                            <option value="0">${__screen(data[key].children.withoutChildrenTitle)}</option>
                                                                            <option value="1">1</option>
                                                                            <option value="2">2</option>
                                                                            <option value="3">3</option>
                                                                            <option value="4">4</option>
                                                                        </select>
                                                                        <div data-age-select-title-template="${__screen(data[key].children.ageSelectTitleTemplate)}" class="age-wrapper">

                                                                            <span class="age-title">${__screen(data[key].children.ageTitle)}</span>
                                                                            <hr>
                                                                            <div class="age-closer">×</div>

                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="col-md-2 col-sm-12">

                                                                    <div class="form-group btn-search-area">
                                                                        <button data-url="${__screen(data[key].url)}" data-onclick-handler-name="search" type="button" class="btn btn-primary">${__screen(data[key].button.title)}</button>
                                                                    </div>
                                                                </div>
                                                            </form>
                                                        </div>`;

        }

        return html;
    })()}
                                                </div>
                                            </div>
                                        </div>`;

    var iframeStylesheets = (function () {

        return [

            TravelsoftPartnersModule.CSS_URL + "/bootstrap.min.css",
            TravelsoftPartnersModule.CSS_URL + "/select2.min.css",
            TravelsoftPartnersModule.CSS_URL + "/daterangepicker.min.css",
            TravelsoftPartnersModule.CSS_URL + "/forms/styles.css"

        ].map(function (link) {
            return `<link rel="stylesheet" href="${link}">`;
        }).join("");

    })();

    var iframeScripts = (function () {

        return [

            TravelsoftPartnersModule.JS_URL + "/jquery-3.2.1.min.js",
            TravelsoftPartnersModule.JS_URL + "/bootstrap.min.js",
            TravelsoftPartnersModule.JS_URL + "/select2.full.min.js",
            TravelsoftPartnersModule.JS_URL + "/moment.min.js",
            TravelsoftPartnersModule.JS_URL + "/moment_locales.min.js",
            TravelsoftPartnersModule.JS_URL + "/daterangepicker.min.js",
            TravelsoftPartnersModule.JS_URL + "/forms/main.js?" + Math.random() * 100000
        ].map(function (src) {
            return `<script type="text/javascript" src="${src}"></script>`;
        }).join("");

    })();

    var iframeContent = (function () {

        var html = TravelsoftPartnersModule.IFRAME_CONTENT_TEMPLATE;

        return html.replace("{{stylesheets}}", iframeStylesheets)
                .replace("{{content}}", iframeBodyContent)
                .replace("{{scripts}}", iframeScripts);

    })();

    iframe.id = "search-forms";

    iframe.src = "about:blank";

    iframe.style.width = "100%";

    iframe.style.border = "none";

    document.getElementById("search-forms-iframe-block").replaceChild(
            iframe, document.getElementById("search-forms-iframe-block").querySelector("span"));

    setTimeout(function () {
        iframe.contentDocument.write(iframeContent);
        TravelsoftPartnersModule.__setIframeHeight(iframe);
    }, 100);

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
 *              type: excursion || placement || sanatorium,
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

    /**
     * Попытка запуска отрисовки результатов поиска
     * @param {Object} parameters
     * @returns {undefined}
     */
    var __try2RunSearchResultRender = function (parameters) {
        if (typeof parameters.display.searchResult === "object" && parameters.display.searchResult) {

            // запрос данных для отображения результата поиска
            this.__sendRequest("GetSearchResultRenderData", [(function () {

                    var queryParts = window.parent.location.search
                            .replace("?", "")
                            .split("&")
                            .filter(function (element) {
                                return element.length > 0 && element.indexOf("tpm_params") === 0;
                            });

                    queryParts.push("tpm_params[type]=" + parameters.display.searchResult.type);
                    queryParts.push("tpm_params[number_per_page]=" + parameters.display.searchResult.numberPerPage);

                    return queryParts.join("&");

                })()], TravelsoftPartnersModule.__searchResult.success);

        }
    };

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
            "tpm_params[types]=" + (function (parameters) {
                var types = [];
                for (var i in parameters.display.forms.types) {
                    if (parameters.display.forms.types.hasOwnProperty(i)) {
                        types.push(i);
                    }
                }
                return types.join("|");
            })(parameters)
        ], (function (parameters) {

            return function (data) {

                // дополняем массив данных urls для переходов
                var __data = (function (data, parameters) {
                    var __data = data;
                    for (var i in parameters.display.forms.types) {
                        if (parameters.display.forms.types.hasOwnProperty(i)) {
                            __data.data[i].url = parameters.display.forms.types[i].url;
                        }
                    }
                    return __data;
                })(data, parameters);


                TravelsoftPartnersModule.__forms.success(__data);
            };

        })(parameters));
        
        __try2RunSearchResultRender.apply(TravelsoftPartnersModule, [parameters]);
        
    } else {

        __try2RunSearchResultRender.apply(TravelsoftPartnersModule, [parameters]);
    }
};

