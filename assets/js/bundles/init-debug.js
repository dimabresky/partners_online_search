/**
 * namespace.js
 * @author dimabresky
 */

/**
 * Пространство имен модуля travelsoft.pm
 * @type Object
 */
var Travelsoft = Travelsoft || {};

/**
 * const.js
 * 
 * dependencies: namespace.js
 * 
 * @author dimabresky
 * @copyright (c) 2017, travelsoft 
 */

/**
 * @param {Object} Travelsoft
 * @returns {undefined}
 */
(function (Travelsoft) {

    "use strict";
    
    /**
     * Адрес сайта запросов модуля
     * @type String
     */
    Travelsoft.SITE_ADDRESS = "https://vetliva.ru";
    
    /**
     * Адресс видео хостинга
     * @type String
     */
    Travelsoft.VIDEO_URL = "https://www.youtube.com/embed/";

    /**
     * Адрес запроса модуля
     * @type String
     */
    Travelsoft.REQUEST_URL = Travelsoft.SITE_ADDRESS + "/travelsoft.pm";

    /**
     * Адрес загрузки js
     * @type String
     */
    Travelsoft.JS_URL = Travelsoft.REQUEST_URL + "/assets/js";

    /**
     * Адрес загрузки css
     * @type String
     */
    Travelsoft.CSS_URL = Travelsoft.REQUEST_URL + "/assets/css";

})(Travelsoft);

/**
 * utils.js
 * 
 * dependencies: namespace.js
 * 
 * @author dimabresky
 * @copyright (c) 2017, travelsoft 
 */

/**
 * @param {Object} Travelsoft
 * @returns {undefined}
 */
(function (Travelsoft) {

    "use strict";

    /**
     * Контейнер утилит
     * @type Object
     */
    Travelsoft.utils = {
        /**
         * Контейнер callback - функций для jsonp
         * @type Object
         */
        callbacks: {},
        
        /**
         * Генератор уникальноый строки
         * @returns {String}
         */
        makeid: function () {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (var i = 0; i < 5; i++)
              text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;
          },
        
        /**
         * Отправление заропса jsonp
         * @param {String} method - название метода, который будет вызван на сервере 
         * @param {Array} parameters - объект параметров запроса
         * @param {String} success - имя функции обработчика
         * @returns {undefined}
         */
        sendRequest: function (method, parameters, success) {

            var isOk = false;
            var callbackName = 'cb' + String(Math.random()).slice(-6);
            var url = Travelsoft.REQUEST_URL + "/?";
            var queryParts = parameters;
            var script;

            queryParts.push("callback=Travelsoft.utils.callbacks." + callbackName);
            queryParts.push("method=" + method);

            url += queryParts.join("&");

            // динамический сallback для обработки ответа
            Travelsoft.utils.callbacks[callbackName] = function (resp) {

                isOk = true;
                delete Travelsoft.utils.callbacks[callbackName];
                success(resp);
            };

            // проверка состояния ответа
            function checkResponse() {

                if (isOk) {
                    return;
                }
                delete Travelsoft.utils.callbacks[callbackName];
                console.warn("Query error " + url);
            }

            script = document.createElement('script');
            script.type = "text/javascript";
            script.onload = checkResponse;
            script.onerror = checkResponse;
            script.src = url;

            document.body.appendChild(script);
        },

        /**
         * Экранирование спец. символов
         * @param {String} text
         * @returns {String}
         */
        screen: function (text) {

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

        },

        HWatcher: {
            __prev: null,
            __id: null,
            __parent: null,
            watch: function (object) {
                var __this = this;
                __this.unwatch(object);
                __this.__id = setInterval(function () {

                    if (__this.__prev !== object.scrollHeight) {
                        if (__this.__parent) {
                            __this.__parent.style.height = object.scrollHeight + 10 + "px";
                        }
                        __this.__prev = object.scrollHeight;
                    }
                }, 100);
            },
            unwatch: function (object) {
                if (this.__id) {
                    clearInterval(this.__id);
                    this.__id = null;
                    this.__prev = null;
                    object.style.height = 0;
                }
            }
        }
    };

})(Travelsoft);

/**
 * frames.js
 * 
 * dependencies: namespace.js, const.js, utils.js
 * 
 * @author dimabresky
 * @copyright (c) 2017, travelsoft 
 */

/**
 * @param {Object} Travelsoft
 * @returns {undefined}
 */
(function (Travelsoft) {

    "use strict";

    /**
     * @param {Object} options
     * @returns {Element}
     */
    function __createPluginIframe(options) {
        var iframe = __createFrame(__commonIframesOptions(options));

        window.parent.document.body.appendChild(iframe);

        return iframe;
    }

    /**
     * @param {Object} options
     * @returns {Object}
     */
    function __commonIframesOptions(options) {

        return {
            styles: {
                position: "absolute",
                display: "none",
                top: (options.top + 6) + "px",
                left: options.left + "px",
                width: options.width + "px",
                height: options.height + "px",
                border: "1px solid #ccc",
                "box-sizing": "border-box",
                "z-index": 10,
                "padding-right": "1px"
            },
            attributes: {
                src: "about:blank",
                id: options.iframe_id,
                scrolling: options.scrolling ? "yes" : "no",
                className: "iframe-plugin"
            },
            iframeContent: ``,
            iframeStylesheets: (function () {

                return [
                    '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">',
                    '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">'
                ].join("") + [

                    Travelsoft.CSS_URL + `/forms/${options.plugin_name}.min.css?` + Math.random() * 100000

                ].map(function (link) {
                    return `<link rel="stylesheet" href="${link}">`;
                }).join("") + `<style>${Travelsoft.utils.screen(options.css)}</style>`;

            })(),

            iframeScripts: (function () {

                return [
                    
                    Travelsoft.JS_URL + `/bundles/${options.plugin_name}.js`
                ].map(function (src) {
                    return `<script type="text/javascript" src="${src}"></script>`;
                }).join("") + `<script>Travelsoft.${options.plugin_name}.init(${JSON.stringify({
                    iframe_id: options.iframe_id, // iframe id
                    data: options.data,
                    without: options.without
                })})</script>`;

            })()
        };

    }
    
    /**
     * Контейнер методов для отрисовки iframes
     * @type Object
     */
    Travelsoft.frames = {

        template: `<!DOCTYPE html>
                        <html>
                            <head>
                                <title>travelsoft partner module</title>
                                <meta charset="UTF-8">
                                {{stylesheets}}
                            </head>
                            <body>
                                {{content}}
                                {{scripts}}
                            </body>
                        </html>`,

        render: {

            /**
             * Детали формы поиска
             * @type Object
             */
            forms: {

                /**
                 * Отрисовка фрейма формы
                 * @param {Object} options
                 * @returns {Element}
                 */
                form: function (options) {
                    
                    var iframe_id = "search-forms-" + Math.ceil(Math.random()*1000);
                    
                    var iframe = __createFrame({
                        styles: {
                            width: "100%",
                            border: "none"
                        },
                        attributes: {
                            src: "about:blank",
                            id: iframe_id,
                            scrolling: "yes"
                        },
                        iframeContent: ``,
                        iframeStylesheets: (function () {

                            return [
                                '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">',
                                '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">'
                            ].join("") + [

                                Travelsoft.CSS_URL + "/select2.min.css",
                                Travelsoft.CSS_URL + "/daterangepicker.min.css",
                                Travelsoft.CSS_URL + "/forms/styles.min.css?" + Math.random() * 100000

                            ].map(function (link) {
                                return `<link rel="stylesheet" href="${link}">`;
                            }).join("") + `<style>${Travelsoft.utils.screen(options.mainIframeCss)}</style>`;

                        })(),

                        iframeScripts: (function () {

                            options.parent_iframe_id = iframe_id;

                            return [

                                Travelsoft.JS_URL + "/jquery-3.2.1.min.js",
                                Travelsoft.JS_URL + "/bootstrap.min.js",
                                Travelsoft.JS_URL + "/bundles/forms.js"
                            ].map(function (src) {
                                return `<script type="text/javascript" src="${src}"></script>`;
                            }).join("") + `<script>Travelsoft.forms.init(${JSON.stringify(options)})</script>`;

                        })()
                    });

                    document.getElementById(options.insertion_id).replaceChild(
                            iframe, document.getElementById(options.insertion_id).querySelector("span"));

                    return iframe;
                },

                /**
                 * Возвращает объект фрейма select (like autocomplete or select2)
                 * @param {Object} options
                 * @returns {Element}
                 */
                select: function (options) {

                    options.plugin_name = "select";

                    return __createPluginIframe(options);
                },

                /**
                 * Возвращает отбъект фрейма calendar
                 * @param {Object} options
                 * @returns {Element}
                 */
                children: function (options) {

                    options.plugin_name = "children";

                    return __createPluginIframe(options);
                },

                /**
                 * Возвращает отбъект фрейма datepicker
                 * @param {Object} options
                 * @returns {Element}
                 */
                datepicker: function (options) {

                    var iframe, __options, left = options.left - 303 + options.width;

                    options.plugin_name = "datepicker";

                    __options = __commonIframesOptions(options);
                    
                    __options.styles.width = "303px";
                    __options.styles.left = left + "px"; 
                    
                    __options.iframeStylesheets += `<link rel="stylesheet" href="${Travelsoft.CSS_URL + "/daterangepicker.min.css"}">` + __options.iframeStylesheets; 
                    __options.iframeScripts = (function (options) {

                        return [
                            Travelsoft.JS_URL + `/jquery-3.2.1.min.js`,
                            Travelsoft.JS_URL + `/moment.min.js`,
                            Travelsoft.JS_URL + `/moment_locales.min.js`,
                            Travelsoft.JS_URL + `/daterangepicker.min.js`,
                            Travelsoft.JS_URL + `/bundles/${options.plugin_name}.js`
                        ].map(function (src) {
                            return `<script type="text/javascript" src="${src}"></script>`;
                        }).join("") + `<script>Travelsoft.${options.plugin_name}.init(${JSON.stringify({
                            iframe_id: options.iframe_id, // iframe id
                            start_date: options.data.start_date,
                            end_date: options.data.end_date,
                            format: options.data.format,
                            date_separator: options.data.date_separator,
                            defValue: options.data.defValue
                        })})</script>`;

                    })(options);

                    iframe = __createFrame(__options);

                    window.parent.document.body.appendChild(iframe);

                    return iframe;

                }

            },

            /**
             * Отрисовка результатов поиска
             * @param {Object} options
             * @returns {Element}
             */
            searchResult: function (options) {

                var opt = options;

                opt.page = 1;

                var iframe = __createFrame({
                    styles: {
                        width: "100%",
                        border: "none",
                        "z-index": 10
                    },
                    attributes: {
                        src: "about:blank",
                        id: "search-result_" + options.insertion_id,
                        scrolling: "no"
                    },
                    iframeContent: ``,
                    iframeStylesheets: (function () {

                        return [
                            '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">',
                            '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">'
                        ].join("") + [

                            Travelsoft.CSS_URL + "/responsiveslides.min.css",
                            Travelsoft.CSS_URL + "/search-result/styles.min.css"

                        ].map(function (href) {
                            return `<link rel="stylesheet" href="${href}">`;
                        }).join("") + `<style>${Travelsoft.utils.screen(options.mainIframeCss)}</style>`;

                    })(),

                    iframeScripts: (function () {

                        return [

                            "https://api-maps.yandex.ru/2.1/?lang=ru_RU",
                            Travelsoft.JS_URL + "/jquery-3.2.1.min.js",
                            Travelsoft.JS_URL + "/bootstrap.min.js",
                            Travelsoft.JS_URL + "/responsiveslides.min.js",
                            Travelsoft.JS_URL + "/pagenavigator.min.js",
                            Travelsoft.JS_URL + "/bundles/search_result.js"
                        ].map(function (src) {
                            return `<script type="text/javascript" src="${src}"></script>`;
                        }).join("") + `<script>Travelsoft.searchResult.init(${JSON.stringify(opt)})</script>`;

                    })()
                });

                document.getElementById(options.insertion_id).replaceChild(
                        iframe, document.getElementById(options.insertion_id).querySelector("span"));

                return iframe;

            }
        }
    };

    /**
     * Возвращает созданный фрейм
     * @param {Object} options
     * @returns {Element}
     */
    function __createFrame(options) {

        var iframe = document.createElement("iframe");

        for (var property in options.styles) {
            iframe.style[property] = options.styles[property];
        }

        for (var attribute in options.attributes) {
            iframe[attribute] = options.attributes[attribute];
        }

        iframe.onload = function () {
            iframe.contentDocument.write(
                    Travelsoft.frames.template.replace("{{stylesheets}}", options.iframeStylesheets)
                    .replace("{{content}}", options.iframeContent)
                    .replace("{{scripts}}", options.iframeScripts));
        };

        return iframe;

    }

})(Travelsoft);

/**
 * init.js
 * 
 * dependencies: namespace.js, const.js, utils.js, frames.js
 * 
 * @author dimabresky
 * @copyright (c) 2017, travelsoft 
 */

/**
 * @param {Object} Travelsoft
 * @returns {undefined}
 */
(function (Travelsoft) {

    "use strict";

    function __init(parameters) {

        var sropt = {};

        if (typeof parameters !== "object" || !parameters) {
            console.warn("Parameters not set");
            return;
        }

        if (typeof parameters.forms === "object" && parameters.forms) {

            Travelsoft.frames.render.forms.form(parameters.forms);

        }

        if (typeof parameters.searchResult === "object" && parameters.searchResult) {

            sropt = parameters.searchResult;
            Travelsoft.frames.render.searchResult(sropt);

        }
    }

    /**
     * Инициализация поиска тур. услуг
     * @param {Object} parameters {
     *      
     *          afterLoadingPage: false||true (default true)
     *          // для форм поиска
     *          forms: {
     *                  
     *              // типы форм
     *              types: [excursions, placements, sanatorium],
     *              
     *              // URL для переходов на страницы поиска результатов
     *              urls: [],
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
     *              numberPerPage: 10,
     *              
     *              // ID партнера в системе
     *              partner: "",
     *      
     *              // Подпись ID партнера
     *              partnerSignature: ""
     *          }
     *      
     * }
     * 
     * @returns {undefined}
     */
    Travelsoft.init = function (parameters) {

        if (typeof parameters.afterLoadingPage === "boolean" && !parameters.afterLoadingPage) {

            __init(parameters);
        } else {
            window.addEventListener("load", function () {
                __init(parameters)
            });
        }

    };

})(Travelsoft);
