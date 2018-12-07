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
 * forms.js
 * 
 * dependencies: namespace.js, const.js, utils.js, frames.js 
 * 
 * @author dimabresky
 * @copyright (c) 2017, travelsoft 
 */

/**
 * @param {Object} Travelsoft
 * @param {jQuery} $
 * @returns {undefined}
 */
(function (Travelsoft, $) {

    "use strict";



    function __hideAllFrames() {

        var frames = parent.document.querySelectorAll(".iframe-plugin");
        var span = document.querySelectorAll(".span-plugin");
        for (var i = 0; i < frames.length; i++) {
            frames[i].style.display = "none";
        }

        for (var i = 0; i < span.length; i++) {

            span[i].innerHTML = __screenCloser(span[i].innerHTML);
        }
    }

    function __closer() {
        return `<span class="iframe-closer">&times;</span>`;
    }

    /**
     * @param {String} text
     * @returns {String}
     */
    function __screenCloser(text) {
        return text.replace(/<span class="iframe-closer">(.*)<\/span>/, "");
    }

    /**
     * Инициализация форм на вкладках
     * @param {$} tab
     * @param {Object} options
     * @returns {undefined}
     */
    function __init(tab, options) {

        var tabArea = $(tab.attr("href"));

        // create select
        __initSelectPlugin(tabArea, options.selectIframeCss, options.parent_iframe_id);

        // create datepicker
        __createDatepicker(tabArea, options.datepickerIframeCss, options.parent_iframe_id);

        // create children iframe
        __initChildrenPlugin(tabArea, options.childrenIframeCss, options.parent_iframe_id);

        // go to search page
        tabArea.find("form").find("button").each(function () {

            $(this).on("click", function (e) {
                window.parent.open($(this).data("url") + "?" + $(this).closest("form").serialize(), '__blank');
                e.preventDefault();
            });

        });
    }

    /**
     * Общая инициализация плагина
     * @param {Element} self
     * @param {Object} data
     * @param {Boolean} scrolling
     * @param {String} defValue
     * @param {String} pluginName
     * @param {String} css
     * @param {String} parentIframeId
     * @returns {Object}
     */
    function __commonPluginInit(self, data, scrolling, defValue, pluginName, css, parentIframeId) {
        var iframe_id = "iframe-plugin-" + self.id;

        var span = __initPluginSpan(self.id, defValue, iframe_id);

        var iframe = Travelsoft.frames.render.forms[pluginName](__commonIframeOptions({
            iframe_id: iframe_id,
            self: self,
            data: data,
            scrolling: scrolling,
            css: css,
            parentIframeId: parentIframeId
        }));

        self.style.display = "none";

        self.parentNode.insertBefore(span, self);

        return {iframe: iframe, span: span};
    }

    /**
     * Инициализация плагина
     * @param {Element} self
     * @param {String} pluginName
     * @param {Boolean} scrolling
     * @param {String} css
     * @param {String} parentIframeId
     * @returns {Object}
     */
    function __initPlugin(self, pluginName, scrolling, css, parentIframeId) {

        var data = (function (select) {
            var data = [];
            for (var i = 0; i < select.children.length; i++) {
                data.push({
                    selected: select.children[i].selected || false,
                    value: select.children[i].value,
                    span_text: select.children[i].dataset.spanText,
                    text: select.children[i].innerText}
                );
            }
            return data;
        })(self);

        var defValue = (function (select) {

            for (var i = 0; i < select.children.length; i++) {

                if (select.children[i].selected) {
                    return select.children[i].dataset.spanText;
                }
            }

            return select.children[0].dataset.spanText;

        })(self);

        return __commonPluginInit(self, data, scrolling, defValue, pluginName, css, parentIframeId);
    }

    /**
     * @param {String} id
     * @param {String} defValue
     * @param {String} iframeLink
     * @returns {Element}
     */
    function __initPluginSpan(id, defValue, iframeLink) {
        var span = document.createElement("span");
        span.id = "span-for-" + id;
        span.className = "form-control span-plugin";
        span.innerText = defValue;
        span.style.cursor = "pointer";
        span.style.overflow = "hidden";
        span.style["white-space"] = "nowrap";
        span.style["text-overflow"] = "ellipsis";
        span.style.display = "inline-block";
        span.style["padding-right"] = "22px";
        span.style["line-height"] = "22px";
        if (iframeLink) {
            span.dataset.iframeLink = iframeLink;
        }

        return span;
    }

    /**
     * @param {Object} options
     * @returns {Obejct}
     */
    function __commonIframeOptions(options) {
        return {
            iframe_id: options.iframe_id,
            top: $(options.self).offset().top + $(parent.document.getElementById(options.parentIframeId)).offset().top + 31,
            left: $(options.self).offset().left + $(parent.document.getElementById(options.parentIframeId)).offset().left,
            width: $(options.self).outerWidth(),
            without: options.self.dataset.without === "yes",
            height: options.self.dataset.iframeSelectHeight ? options.self.dataset.iframeSelectHeight : 500,
            data: options.data,
            select_id: options.self.id,
            scrolling: options.self.scrolling ? "yes" : "no",
            css: options.css
        };
    }

    /**
     * Инициализация plugin select (like autocomplete or select2)
     * @param {$} tab
     * @param {String} css
     * @param {String} parentIframeId
     * @returns {Array}
     */
    function __initSelectPlugin(tab, css, parentIframeId) {

        var plugins = [];

        tab.find('select[data-need-create-iframe-select=yes]').each(function () {

            var self = this, old, pluginParts = __initPlugin(self, "select", true, css, parentIframeId);
            // watch for frame dataset
            setInterval(function () {

                if (pluginParts.iframe.dataset.value && pluginParts.iframe.dataset.value !== old) {
                    self.value = pluginParts.iframe.dataset.value;
                    pluginParts.span.innerHTML = pluginParts.iframe.dataset.text;
                    old = self.value;
                    self.dispatchEvent(new Event("change"));
                }

            }, 200);

            plugins.push(pluginParts);

        });

        return plugins;
    }

    function __addAge(s, age) {

        var inputs = ``;
        if (age.length) {
            for (var i = 0; i < age.length; i++) {
                inputs += `<input type="hidden" name="tpm_params[children_age][]" value="${age[i]}">`;
            }
        }

        s.innerHTML = inputs;
    }

    /**
     * Инициализация plugin children
     * @param {$} tab
     * @param {Object} css
     * @param {String} parentIframeId
     * @returns {Array}
     */
    function __initChildrenPlugin(tab, css, parentIframeId) {

        var plugins = [];

        tab.find('select[data-need-create-iframe-children=yes]').each(function () {

            var self = this, pluginParts = __initPlugin(self, "children", false, css, parentIframeId);

            var span = document.createElement("span");

            var oldChildren = "", oldAge = "";

            span.dataset.def_age = self.dataset.def_age;

            pluginParts.span.parentNode.insertBefore(span, pluginParts.span);

            if (self.dataset.def_age.length) {
                __addAge(span, (function (def_age) {

                    var age = [];

                    for (var i = 0; i < def_age.length; i++) {
                        age.push(def_age[i]);
                    }
                    return age;
                })(self.dataset.def_age.split(";")));
            }

            pluginParts.iframe.dataset.children = "";
            pluginParts.iframe.dataset.age = "";

            // watch for frame dataset
            setInterval(function (self, pluginParts) {

                if (pluginParts.iframe.dataset.children !== oldChildren) {
                    oldChildren = pluginParts.iframe.dataset.children;
                    pluginParts.span.innerHTML = pluginParts.iframe.dataset.children + __closer();
                    self.value = oldChildren;
                    self.dispatchEvent(new Event("change"));
                }

                if (pluginParts.iframe.dataset.age !== oldAge) {
                    oldAge = pluginParts.iframe.dataset.age;
                    __addAge(span, pluginParts.iframe.dataset.age !== "" ? pluginParts.iframe.dataset.age.split(";") : []);
                }

            }, 200, self, pluginParts);

            plugins.push(pluginParts);

        });

        return plugins;
    }

    /**
     * Инициализация работы календаря в форме поиска
     * @param {$} tab
     * @param {Object} css
     * @param {String} parentIframeId
     * @returns {undefined}
     */
    function __createDatepicker(tab, css, parentIframeId) {

        var plugins = [];

        tab.find('input[data-need-create-iframe-datepicker=yes]').each(function () {

            var self = this, pluginParts = __commonPluginInit(self, {
                start_date: $(self).data("start-date") || null,
                end_date: $(self).data("end-date") || null,
                format: $(self).data("format"),
                date_separator: $(self).data("date-separator"),
                defValue: self.value || null
            }, false, self.value || null, "datepicker", css, parentIframeId);

            var old;

            pluginParts.iframe.dataset.daterange = self.value;

            // watch for frame dataset
            setInterval(function () {

                if (pluginParts.iframe.dataset.daterange !== old) {
                    old = pluginParts.iframe.dataset.daterange;
                    pluginParts.span.innerHTML = pluginParts.iframe.dataset.daterange;
                    self.value = pluginParts.iframe.dataset.daterange;
                }

            }, 200);

            plugins.push(pluginParts);

        });

    }


    /**
     * Отрисовка форм поиска
     * @param {Object} data
     * @returns {undefined}
     */
    function __render(data) {

        var __screen = Travelsoft.utils.screen;
        document.body.innerHTML += `<div class="container" id="container">
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
                                                                                        <div class="col-md-3 col-sm-6 col-xs-6">
                                                                                            <div class="form-group">
                                                                                                <label>
                                                                                                    ${__screen(data[key].objects.title)}
                                                                                                </label>
                                                                                                <select data-need-create-iframe-select="yes" name="tpm_params[id][]" id="${key_}-objects" class="form-control objects">
                                                                                                    ${(function (objects) {
                    var html = "";
                    for (var i = 0; i < objects.length; i++) {
                        html += `<option data-span-text="${__screen(objects[i].source_name)}" ${objects[i].isSelected ? 'selected=""' : ''} value="${__screen(objects[i].id)}">${__screen(objects[i].name)}</option>`;
                    }
                    return html;
                })(data[key].objects.forSelect)
                        }
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div class="col-md-3 col-sm-6 col-xs-6">
                                                                    <div class="form-group">
                                                                        <label>
                                                                            ${__screen(data[key].dates.title)}
                                                                        </label>
                                                                        <input data-need-create-iframe-datepicker="yes"  data-format="${__screen(data[key].dates.format)}" data-date-separator="${__screen(data[key].dates.separator)}" data-duration-title="${__screen(data[key].dates.durationTitle)}" value="${__screen(data[key].dates.defValue)}" name="tpm_params[date_range]" id="${key_}-datepicker" type="text" class="datepicker form-control" >
                                                                    </div>
                                                                </div>
                                                                <div class="col-md-2 col-sm-6 col-xs-6">
                                                                    <div class="form-group">
                                                                        <label>
                                                                            ${__screen(data[key].adults.title)}
                                                                        </label>
                                                                        <select ${""/*data-without="yes" data-iframe-select-height="200" data-need-create-iframe-select="yes"*/} id="${key_}-adults-select" name="tpm_params[adults]" class="form-control select2">
                                                                            <option data-span-text="1" ${Number(data[key].adults.defValue) === 1 ? `selected=""` : ``} value="1">1</option>
                                                                            <option data-span-text="2" ${Number(data[key].adults.defValue) === 2 ? `selected=""` : ``} value="2">2</option>
                                                                            <option data-span-text="3" ${Number(data[key].adults.defValue) === 3 ? `selected=""` : ``} value="3">3</option>
                                                                            <option data-span-text="4" ${Number(data[key].adults.defValue) === 4 ? `selected=""` : ``} value="4">4</option>
                                                                            <option data-span-text="5" ${Number(data[key].adults.defValue) === 5 ? `selected=""` : ``} value="5">5</option>
                                                                            <option data-span-text="6" ${Number(data[key].adults.defValue) === 6 ? `selected=""` : ``} value="6">6</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div class="col-md-2 col-sm-6 col-xs-6">
                                                                    <div class="form-group">
                                                                        <label>
                                                                            ${__screen(data[key].children.title)}
                                                                        </label>
                                                                        <select data-def_age='${data[key].children_age.defValue.join(";")}' data-iframe-select-height="100" data-need-create-iframe-children="yes" name="tpm_params[children]" class="form-control" id="${key_}-children">
                                                                            <option data-span-text="0" ${data[key].children.defValue === 0 ? `selected=""` : ``} value="0">0</option>
                                                                            <option data-span-text="1" ${data[key].children.defValue === 1 ? `selected=""` : ``} value="1">1</option>
                                                                            <option data-span-text="2" ${data[key].children.defValue === 2 ? `selected=""` : ``} value="2">2</option>
                                                                            <option data-span-text="3" ${data[key].children.defValue === 3 ? `selected=""` : ``} value="3">3</option>
                                                                            <option data-span-text="4" ${data[key].children.defValue === 4 ? `selected=""` : ``} value="4">4</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div class="col-md-2 col-sm-6 col-xs-6">
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

    }

    Travelsoft.forms = {
        /**
         * Инициализация форм поиска
         * @param {Object} options
         * @returns {undefined}
         */
        init: function (options) {

            var utils = Travelsoft.utils;

            utils.sendRequest("GetFormsRenderData", [
                "tpm_params[types]=" + options.types.join("|"),
                "tpm_params[active]=" + options.active,
                (function (options) {
                    
                    var parameters = "";
                    
                    if ($.isArray(options.def_objects)) {
                        parameters += "tpm_params[def_objects]=" + options.def_objects.join("|");
                    }
                    
                    parameters += "&" + window.parent.location.search
                            .replace("?", "")
                            .split("&")
                            .filter(function (element) {
                                return element.length > 0 && element.indexOf("tpm_params") === 0;
                            }).join("&");
                    
                    return parameters;
                })(options)
            ],
                    (function (options) {

                        // success
                        return function (resp) {

                            if (resp.isError) {
                                console.warn(resp.errorMessage);
                                return;
                            }


                            __render(
                                    // дополняем массив данных url'ами для переходов
                                            (function (data, options) {
                                                var __data = data;
                                                for (var i = 0; i < options.types.length; i++) {
                                                    __data[options.types[i]].url = options.url[i];
                                                }
                                                return __data;
                                            })(resp.data, options)
                                            );

                            Travelsoft.utils.HWatcher.__parent = window.parent.document.getElementById(options.parent_iframe_id);
                            Travelsoft.utils.HWatcher.watch(document.body);

                            setTimeout(function () {
                                // init all tabs
                                $(".nav-tabs a").each(function () {

                                    var tab = $(this);

                                    if (tab.parent().hasClass('active')) {

                                        __init(tab, options);

                                    } else {
                                        tab.one("shown.bs.tab", function () {
                                            __init(tab, options);
                                        });
                                    }
                                });

                                // off iframes plugin
                                parent.document.addEventListener("click", function () {
                                    __hideAllFrames();
                                });
                                // toggle shown iframes plugin
                                document.addEventListener("click", function (e) {

                                    var iframe, shown;

                                    if (
                                            e.target.nodeName === "SPAN" &&
                                            e.target.className.indexOf("span-plugin") > -1 &&
                                            e.target.dataset.iframeLink
                                            ) {

                                        iframe = parent.document.getElementById(e.target.dataset.iframeLink);
                                        shown = iframe.style.display === "block";
                                        __hideAllFrames();
                                        if (!shown) {
                                            iframe.style.display = "block";
                                            e.target.innerHTML = e.target.innerText + __closer();
                                        }

                                        return;
                                    }

                                    __hideAllFrames();

                                });

                            }, 100);

                        };

                    })(options));

                }
            };
        })(Travelsoft, jQuery);

