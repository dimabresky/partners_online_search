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
 * datapicker.js
 * 
 * dependencies: namespace.js, const.js, utils.js
 * 
 * use daterangepicker from Dan Grossman https://github.com/dangrossman/bootstrap-daterangepicker
 * 
 * @author dimabresky
 * @copyright (c) 2017, travelsoft 
 */

/**
 * @param {Travelsoft} Travelsoft
 * @param {moment} moment
 * @param {jQuery} $
 * @returns {undefined}
 */
(function (Travelsoft, moment, $) {

    "use strict";

    Travelsoft.datepicker = {

        init: function (options) {

            var div = document.createElement("div");
            
            var divNotice = document.createElement("div");
            
            var iframe = window.parent.document.getElementById(options.iframe_id);
            
            var $div = $(div);
            
            div.id = "datepicker-shower";
            
            div.style.padding = "10px 0 0 0";
            
            // css loader
            div.innerHTML = `<div id="floatBarsG">
                                                <div id="floatBarsG_1" class="floatBarsG"></div>
                                                <div id="floatBarsG_2" class="floatBarsG"></div>
                                                <div id="floatBarsG_3" class="floatBarsG"></div>
                                                <div id="floatBarsG_4" class="floatBarsG"></div>
                                                <div id="floatBarsG_5" class="floatBarsG"></div>
                                                <div id="floatBarsG_6" class="floatBarsG"></div>
                                                <div id="floatBarsG_7" class="floatBarsG"></div>
                                                <div id="floatBarsG_8" class="floatBarsG"></div>
                                        </div>`;
            
            divNotice.id = "datepicker-notice";
            divNotice.innerText = "Выберите две даты";
            
            // set russian locale of date staff 
            moment.locale("ru");

            document.body.appendChild(div);

            var __options = {
                minDate: new Date(),
                startDate: options.start_date,
                endDate: options.end_date,
                linkedCalendars: false,
                alwaysShowCalendars: true,
                autoApply: true,
                locale: {
                    format: options.format,
                    separator: options.date_separator,
                    daysOfWeek: moment.weekdaysMin(),
                    monthNames: moment.monthsShort(),
                    firstDay: moment.localeData().firstDayOfWeek(),
                }
            };

            if (options.defValue) {
                __options.startDate = options.defValue.split(options.date_separator)[0];
                __options.endDate = options.defValue.split(options.date_separator)[1];
            }

            $div.daterangepicker(__options, function (start, end) {

                iframe.style.display = "none";
                iframe.dataset.daterange = [moment(start).format(options.format), moment(end).format(options.format)].join(options.date_separator);
                setTimeout(function ($div) {
                    $div.trigger("click");
                }, 500, $div);
            }).on("show.daterangepicker", function (ev, picker) {

                var calendars = picker.container.find('.calendars');
                var textDuration = calendars.find('.text-duration');
                var momentStartDate = moment(picker.startDate._d);
                var momentEndDate = moment(picker.endDate._d);
                var days = momentEndDate.diff(momentStartDate, 'days') + 1;

                if (!textDuration.length) {

                    calendars.append('<div class="clearfix"></div><div class="text-center text-duration-area"><b>Продолжительность (дней): <span class="text-duration">0<span></b></div>');
                    textDuration = calendars.find('.text-duration');

                    calendars.on('mouseenter.daterangepicker', 'td.available', function () {

                        if (!$(this).hasClass('available'))
                            return;

                        var title = $(this).attr('data-title');
                        var row = title.substr(1, 1);
                        var col = title.substr(3, 1);
                        var cal = $(this).parents('.calendar');
                        var date = cal.hasClass('left') ? picker.leftCalendar.calendar[row][col] : picker.rightCalendar.calendar[row][col];
                        var tmpEndDate = moment(date._d);
                        var tmpDays = tmpEndDate.diff(momentStartDate, 'days') + 1;
                        textDuration.text(tmpDays > 0 ? tmpDays : 0);

                    }).on('mouseleave.daterangepicker', 'td.available', function () {

                        if (!momentEndDate) {
                            days = 0;
                        } else {
                            days = momentEndDate.diff(momentStartDate, 'days') + 1;
                        }

                        textDuration.text(days);

                    }).on('mousedown.daterangepicker', 'td.available', function () {

                        var title = $(this).attr('data-title');
                        var row = title.substr(1, 1);
                        var col = title.substr(3, 1);
                        var cal = $(this).parents('.calendar');
                        var date = cal.hasClass('left') ? picker.leftCalendar.calendar[row][col] : picker.rightCalendar.calendar[row][col];
                        momentStartDate = moment(date._d);
                        momentEndDate = null;
                    });
                }

                textDuration.text(days);

            });

            $div.one("show.daterangepicker", function (ev, picker) {
                $(picker.container).find(".end-date").removeClass(".end-date");
            });
            
            setTimeout(function (div) {
                div.style.padding = 0;
                div.style.margin = 0;
                div.style.display = "none";
                div.innerHTML = "";
                document.body.insertBefore(divNotice, div);
                div.dispatchEvent(new Event("click"));
            }, 1500, div);
            
            Travelsoft.utils.HWatcher.__parent = iframe;
            Travelsoft.utils.HWatcher.watch(document.body);
        }
    };

})(Travelsoft, moment, jQuery);
