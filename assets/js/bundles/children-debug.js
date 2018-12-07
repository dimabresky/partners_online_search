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
 * children.js
 * 
 * dependencies:
 *      namespace.js
 *      const.js
 *      utils.js
 * 
 * @author dimabresky
 * @copyright (c) 2017, travelsoft
 */

/**
 * @param {Travelsoft} Travelsoft
 * @returns {undefined}
 */
(function (Travelsoft) {

    "use strict";
    
    var __defAge = 8;
    
    /**
     * @returns {Element}
     */
    function __createContainer () {
        var container = document.createElement("div");
        container.id = "container";
        container.className = "container";
        return container;
    }
    
    /**
     * @param {String} id
     * @returns {Element}
     */
    function __createFormGroup (id) {
        
        var form_group = document.createElement("div");
        form_group.className = "form-group";
        if (id) {
            form_group.id = id;
        }
        
        return form_group;
    }
    
    /**
     * @param {Object} data
     * @returns {Element}
     */
    function __createSelect(data) {
        var select = document.createElement('select');
        select.className = "form-control";
        var options = ``;
        for (var i = 0; i < data.length; i++) {
            options += `<option ${data[i].selected ? 'selected=""' : ''}  value="${data[i].value}">${data[i].text}</option>`;
        }
        select.innerHTML = options;
        return select;
    }
    
    /**
     * @param {String} text
     * @returns {Element}
     */
    function __createLabel(text) {
        var label = document.createElement("label");
        label.innerText = text;
        return label;
    }
    
    /**
     * @returns {Element}
     */
    function __createRow () {
        var row = document.createElement("div");
        row.className = "row";
        return row;
    }
    
    /**
     * @returns {Element}
     */
    function __createCol () {
        var col = document.createElement("div");
        col.className = "col-md-12";
        return col;
    }

    function __createAgeBlock(parent, cnt, iframe) {

        var form_group = __createFormGroup("children-age");
        var label, select;
        form_group.style["margin-top"] = "10px";
        parent.appendChild(form_group);
        for (var i = 1; i <= cnt; i++) {
            label = __createLabel(`Возраст ребенка ${i}`);
            label.style["margin-top"] = "10px";
            select = __createSelect((function () {
                var data = [];
                for (var i = 0; i < 17; i++) {
                    data.push({selected: i === __defAge, value: i, text: i});
                }
                return data;
            })());
            
            select.className += " select-age";
            
            select.onchange = function () {
                
                var age = [];
                var selectAges = document.querySelectorAll(".select-age");
                for (var i = 0; i < selectAges.length; i++) {
                    age.push(selectAges[i].value);
                }
                
                iframe.dataset.age = age.join(";");
            };
            
            form_group.appendChild(label);
            form_group.appendChild(select);
        }
    }

    function __destroyAgeBlock() {

        var ageBlock = document.getElementById('children-age');
        if (ageBlock) {
            ageBlock.remove();
        }

    }

    Travelsoft.children = {

        init: function (options) {
            
            var data = options.data;
            var iframe = parent.document.getElementById(options.iframe_id);
            var container = __createContainer();
            var row = __createRow();
            var col = __createCol();
            var form_group = __createFormGroup();
            //var label = __createLabel("Сколько ?");
            var select = __createSelect(data);
            form_group.style["margin-top"] = "20px";
            //form_group.appendChild(label);
            form_group.appendChild(select);
            
            select.onchange = function () {

                __destroyAgeBlock();
                iframe.dataset.children = this.value;
                iframe.dataset.age = "";
                if (this.value > 0) {
                    __createAgeBlock(this.parentNode, this.value, iframe);
                    iframe.dataset.age = (function (cnt) {

                        var arr_age = [];
                        for (var i = 0; i < cnt; i++) {
                            arr_age.push(__defAge);
                        }
                        return arr_age.join(";");
                    })(this.value);
                }

            };

            col.appendChild(form_group);
            row.appendChild(col);
            container.appendChild(row);
            document.body.innerHTML = "";
            document.body.appendChild(container);
            Travelsoft.utils.HWatcher.__parent = window.parent.document.getElementById(options.iframe_id);
            Travelsoft.utils.HWatcher.watch(document.body);
        }

    };

})(Travelsoft);
