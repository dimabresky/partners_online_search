/**
 * jquery.mask.js
 * @version: v1.14.15
 * @author: Igor Escobar
 *
 * Created by Igor Escobar on 2012-03-10. Please report any bug at github.com/igorescobar/jQuery-Mask-Plugin
 *
 * Copyright (c) 2012 Igor Escobar http://igorescobar.com
 *
 * The MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

/* jshint laxbreak: true */
/* jshint maxcomplexity:17 */
/* global define */

// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/templates/jqueryPlugin.js
(function (factory, jQuery, Zepto) {

    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery || Zepto);
    }

}(function ($) {
    'use strict';

    var Mask = function (el, mask, options) {

        var p = {
            invalid: [],
            getCaret: function () {
                try {
                    var sel,
                        pos = 0,
                        ctrl = el.get(0),
                        dSel = document.selection,
                        cSelStart = ctrl.selectionStart;

                    // IE Support
                    if (dSel && navigator.appVersion.indexOf('MSIE 10') === -1) {
                        sel = dSel.createRange();
                        sel.moveStart('character', -p.val().length);
                        pos = sel.text.length;
                    }
                    // Firefox support
                    else if (cSelStart || cSelStart === '0') {
                        pos = cSelStart;
                    }

                    return pos;
                } catch (e) {}
            },
            setCaret: function(pos) {
                try {
                    if (el.is(':focus')) {
                        var range, ctrl = el.get(0);

                        // Firefox, WebKit, etc..
                        if (ctrl.setSelectionRange) {
                            ctrl.setSelectionRange(pos, pos);
                        } else { // IE
                            range = ctrl.createTextRange();
                            range.collapse(true);
                            range.moveEnd('character', pos);
                            range.moveStart('character', pos);
                            range.select();
                        }
                    }
                } catch (e) {}
            },
            events: function() {
                el
                .on('keydown.mask', function(e) {
                    el.data('mask-keycode', e.keyCode || e.which);
                    el.data('mask-previus-value', el.val());
                    el.data('mask-previus-caret-pos', p.getCaret());
                    p.maskDigitPosMapOld = p.maskDigitPosMap;
                })
                .on($.jMaskGlobals.useInput ? 'input.mask' : 'keyup.mask', p.behaviour)
                .on('paste.mask drop.mask', function() {
                    setTimeout(function() {
                        el.keydown().keyup();
                    }, 100);
                })
                .on('change.mask', function(){
                    el.data('changed', true);
                })
                .on('blur.mask', function(){
                    if (oldValue !== p.val() && !el.data('changed')) {
                        el.trigger('change');
                    }
                    el.data('changed', false);
                })
                // it's very important that this callback remains in this position
                // otherwhise oldValue it's going to work buggy
                .on('blur.mask', function() {
                    oldValue = p.val();
                })
                // select all text on focus
                .on('focus.mask', function (e) {
                    if (options.selectOnFocus === true) {
                        $(e.target).select();
                    }
                })
                // clear the value if it not complete the mask
                .on('focusout.mask', function() {
                    if (options.clearIfNotMatch && !regexMask.test(p.val())) {
                       p.val('');
                   }
                });
            },
            getRegexMask: function() {
                var maskChunks = [], translation, pattern, optional, recursive, oRecursive, r;

                for (var i = 0; i < mask.length; i++) {
                    translation = jMask.translation[mask.charAt(i)];

                    if (translation) {

                        pattern = translation.pattern.toString().replace(/.{1}$|^.{1}/g, '');
                        optional = translation.optional;
                        recursive = translation.recursive;

                        if (recursive) {
                            maskChunks.push(mask.charAt(i));
                            oRecursive = {digit: mask.charAt(i), pattern: pattern};
                        } else {
                            maskChunks.push(!optional && !recursive ? pattern : (pattern + '?'));
                        }

                    } else {
                        maskChunks.push(mask.charAt(i).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
                    }
                }

                r = maskChunks.join('');

                if (oRecursive) {
                    r = r.replace(new RegExp('(' + oRecursive.digit + '(.*' + oRecursive.digit + ')?)'), '($1)?')
                         .replace(new RegExp(oRecursive.digit, 'g'), oRecursive.pattern);
                }

                return new RegExp(r);
            },
            destroyEvents: function() {
                el.off(['input', 'keydown', 'keyup', 'paste', 'drop', 'blur', 'focusout', ''].join('.mask '));
            },
            val: function(v) {
                var isInput = el.is('input'),
                    method = isInput ? 'val' : 'text',
                    r;

                if (arguments.length > 0) {
                    if (el[method]() !== v) {
                        el[method](v);
                    }
                    r = el;
                } else {
                    r = el[method]();
                }

                return r;
            },
            calculateCaretPosition: function() {
                var oldVal = el.data('mask-previus-value') || '',
                    newVal = p.getMasked(),
                    caretPosNew = p.getCaret();
                if (oldVal !== newVal) {
                    var caretPosOld = el.data('mask-previus-caret-pos') || 0,
                        newValL = newVal.length,
                        oldValL = oldVal.length,
                        maskDigitsBeforeCaret = 0,
                        maskDigitsAfterCaret = 0,
                        maskDigitsBeforeCaretAll = 0,
                        maskDigitsBeforeCaretAllOld = 0,
                        i = 0;

                    for (i = caretPosNew; i < newValL; i++) {
                        if (!p.maskDigitPosMap[i]) {
                            break;
                        }
                        maskDigitsAfterCaret++;
                    }

                    for (i = caretPosNew - 1; i >= 0; i--) {
                        if (!p.maskDigitPosMap[i]) {
                            break;
                        }
                        maskDigitsBeforeCaret++;
                    }

                    for (i = caretPosNew - 1; i >= 0; i--) {
                        if (p.maskDigitPosMap[i]) {
                            maskDigitsBeforeCaretAll++;
                        }
                    }

                    for (i = caretPosOld - 1; i >= 0; i--) {
                        if (p.maskDigitPosMapOld[i]) {
                            maskDigitsBeforeCaretAllOld++;
                        }
                    }

                    // if the cursor is at the end keep it there
                    if (caretPosNew > oldValL) {
                      caretPosNew = newValL * 10;
                    } else if (caretPosOld >= caretPosNew && caretPosOld !== oldValL) {
                        if (!p.maskDigitPosMapOld[caretPosNew])  {
                          var caretPos = caretPosNew;
                          caretPosNew -= maskDigitsBeforeCaretAllOld - maskDigitsBeforeCaretAll;
                          caretPosNew -= maskDigitsBeforeCaret;
                          if (p.maskDigitPosMap[caretPosNew])  {
                            caretPosNew = caretPos;
                          }
                        }
                    }
                    else if (caretPosNew > caretPosOld) {
                        caretPosNew += maskDigitsBeforeCaretAll - maskDigitsBeforeCaretAllOld;
                        caretPosNew += maskDigitsAfterCaret;
                    }
                }
                return caretPosNew;
            },
            behaviour: function(e) {
                e = e || window.event;
                p.invalid = [];

                var keyCode = el.data('mask-keycode');

                if ($.inArray(keyCode, jMask.byPassKeys) === -1) {
                    var newVal = p.getMasked(),
                        caretPos = p.getCaret();

                    // this is a compensation to devices/browsers that don't compensate
                    // caret positioning the right way
                    setTimeout(function() {
                      p.setCaret(p.calculateCaretPosition());
                    }, $.jMaskGlobals.keyStrokeCompensation);

                    p.val(newVal);
                    p.setCaret(caretPos);
                    return p.callbacks(e);
                }
            },
            getMasked: function(skipMaskChars, val) {
                var buf = [],
                    value = val === undefined ? p.val() : val + '',
                    m = 0, maskLen = mask.length,
                    v = 0, valLen = value.length,
                    offset = 1, addMethod = 'push',
                    resetPos = -1,
                    maskDigitCount = 0,
                    maskDigitPosArr = [],
                    lastMaskChar,
                    check;

                if (options.reverse) {
                    addMethod = 'unshift';
                    offset = -1;
                    lastMaskChar = 0;
                    m = maskLen - 1;
                    v = valLen - 1;
                    check = function () {
                        return m > -1 && v > -1;
                    };
                } else {
                    lastMaskChar = maskLen - 1;
                    check = function () {
                        return m < maskLen && v < valLen;
                    };
                }

                var lastUntranslatedMaskChar;
                while (check()) {
                    var maskDigit = mask.charAt(m),
                        valDigit = value.charAt(v),
                        translation = jMask.translation[maskDigit];

                    if (translation) {
                        if (valDigit.match(translation.pattern)) {
                            buf[addMethod](valDigit);
                             if (translation.recursive) {
                                if (resetPos === -1) {
                                    resetPos = m;
                                } else if (m === lastMaskChar && m !== resetPos) {
                                    m = resetPos - offset;
                                }

                                if (lastMaskChar === resetPos) {
                                    m -= offset;
                                }
                            }
                            m += offset;
                        } else if (valDigit === lastUntranslatedMaskChar) {
                            // matched the last untranslated (raw) mask character that we encountered
                            // likely an insert offset the mask character from the last entry; fall
                            // through and only increment v
                            maskDigitCount--;
                            lastUntranslatedMaskChar = undefined;
                        } else if (translation.optional) {
                            m += offset;
                            v -= offset;
                        } else if (translation.fallback) {
                            buf[addMethod](translation.fallback);
                            m += offset;
                            v -= offset;
                        } else {
                          p.invalid.push({p: v, v: valDigit, e: translation.pattern});
                        }
                        v += offset;
                    } else {
                        if (!skipMaskChars) {
                            buf[addMethod](maskDigit);
                        }

                        if (valDigit === maskDigit) {
                            maskDigitPosArr.push(v);
                            v += offset;
                        } else {
                            lastUntranslatedMaskChar = maskDigit;
                            maskDigitPosArr.push(v + maskDigitCount);
                            maskDigitCount++;
                        }

                        m += offset;
                    }
                }

                var lastMaskCharDigit = mask.charAt(lastMaskChar);
                if (maskLen === valLen + 1 && !jMask.translation[lastMaskCharDigit]) {
                    buf.push(lastMaskCharDigit);
                }

                var newVal = buf.join('');
                p.mapMaskdigitPositions(newVal, maskDigitPosArr, valLen);
                return newVal;
            },
            mapMaskdigitPositions: function(newVal, maskDigitPosArr, valLen) {
              var maskDiff = options.reverse ? newVal.length - valLen : 0;
              p.maskDigitPosMap = {};
              for (var i = 0; i < maskDigitPosArr.length; i++) {
                p.maskDigitPosMap[maskDigitPosArr[i] + maskDiff] = 1;
              }
            },
            callbacks: function (e) {
                var val = p.val(),
                    changed = val !== oldValue,
                    defaultArgs = [val, e, el, options],
                    callback = function(name, criteria, args) {
                        if (typeof options[name] === 'function' && criteria) {
                            options[name].apply(this, args);
                        }
                    };

                callback('onChange', changed === true, defaultArgs);
                callback('onKeyPress', changed === true, defaultArgs);
                callback('onComplete', val.length === mask.length, defaultArgs);
                callback('onInvalid', p.invalid.length > 0, [val, e, el, p.invalid, options]);
            }
        };

        el = $(el);
        var jMask = this, oldValue = p.val(), regexMask;

        mask = typeof mask === 'function' ? mask(p.val(), undefined, el,  options) : mask;

        // public methods
        jMask.mask = mask;
        jMask.options = options;
        jMask.remove = function() {
            var caret = p.getCaret();
            if (jMask.options.placeholder) {
                el.removeAttr('placeholder');
            }
            if (el.data('mask-maxlength')) {
                el.removeAttr('maxlength');
            }
            p.destroyEvents();
            p.val(jMask.getCleanVal());
            p.setCaret(caret);
            return el;
        };

        // get value without mask
        jMask.getCleanVal = function() {
           return p.getMasked(true);
        };

        // get masked value without the value being in the input or element
        jMask.getMaskedVal = function(val) {
           return p.getMasked(false, val);
        };

       jMask.init = function(onlyMask) {
            onlyMask = onlyMask || false;
            options = options || {};

            jMask.clearIfNotMatch  = $.jMaskGlobals.clearIfNotMatch;
            jMask.byPassKeys       = $.jMaskGlobals.byPassKeys;
            jMask.translation      = $.extend({}, $.jMaskGlobals.translation, options.translation);

            jMask = $.extend(true, {}, jMask, options);

            regexMask = p.getRegexMask();

            if (onlyMask) {
                p.events();
                p.val(p.getMasked());
            } else {
                if (options.placeholder) {
                    el.attr('placeholder' , options.placeholder);
                }

                // this is necessary, otherwise if the user submit the form
                // and then press the "back" button, the autocomplete will erase
                // the data. Works fine on IE9+, FF, Opera, Safari.
                if (el.data('mask')) {
                  el.attr('autocomplete', 'off');
                }

                // detect if is necessary let the user type freely.
                // for is a lot faster than forEach.
                for (var i = 0, maxlength = true; i < mask.length; i++) {
                    var translation = jMask.translation[mask.charAt(i)];
                    if (translation && translation.recursive) {
                        maxlength = false;
                        break;
                    }
                }

                if (maxlength) {
                    el.attr('maxlength', mask.length).data('mask-maxlength', true);
                }

                p.destroyEvents();
                p.events();

                var caret = p.getCaret();
                p.val(p.getMasked());
                p.setCaret(caret);
            }
        };

        jMask.init(!el.is('input'));
    };

    $.maskWatchers = {};
    var HTMLAttributes = function () {
        var input = $(this),
            options = {},
            prefix = 'data-mask-',
            mask = input.attr('data-mask');

        if (input.attr(prefix + 'reverse')) {
            options.reverse = true;
        }

        if (input.attr(prefix + 'clearifnotmatch')) {
            options.clearIfNotMatch = true;
        }

        if (input.attr(prefix + 'selectonfocus') === 'true') {
           options.selectOnFocus = true;
        }

        if (notSameMaskObject(input, mask, options)) {
            return input.data('mask', new Mask(this, mask, options));
        }
    },
    notSameMaskObject = function(field, mask, options) {
        options = options || {};
        var maskObject = $(field).data('mask'),
            stringify = JSON.stringify,
            value = $(field).val() || $(field).text();
        try {
            if (typeof mask === 'function') {
                mask = mask(value);
            }
            return typeof maskObject !== 'object' || stringify(maskObject.options) !== stringify(options) || maskObject.mask !== mask;
        } catch (e) {}
    },
    eventSupported = function(eventName) {
        var el = document.createElement('div'), isSupported;

        eventName = 'on' + eventName;
        isSupported = (eventName in el);

        if ( !isSupported ) {
            el.setAttribute(eventName, 'return;');
            isSupported = typeof el[eventName] === 'function';
        }
        el = null;

        return isSupported;
    };

    $.fn.mask = function(mask, options) {
        options = options || {};
        var selector = this.selector,
            globals = $.jMaskGlobals,
            interval = globals.watchInterval,
            watchInputs = options.watchInputs || globals.watchInputs,
            maskFunction = function() {
                if (notSameMaskObject(this, mask, options)) {
                    return $(this).data('mask', new Mask(this, mask, options));
                }
            };

        $(this).each(maskFunction);

        if (selector && selector !== '' && watchInputs) {
            clearInterval($.maskWatchers[selector]);
            $.maskWatchers[selector] = setInterval(function(){
                $(document).find(selector).each(maskFunction);
            }, interval);
        }
        return this;
    };

    $.fn.masked = function(val) {
        return this.data('mask').getMaskedVal(val);
    };

    $.fn.unmask = function() {
        clearInterval($.maskWatchers[this.selector]);
        delete $.maskWatchers[this.selector];
        return this.each(function() {
            var dataMask = $(this).data('mask');
            if (dataMask) {
                dataMask.remove().removeData('mask');
            }
        });
    };

    $.fn.cleanVal = function() {
        return this.data('mask').getCleanVal();
    };

    $.applyDataMask = function(selector) {
        selector = selector || $.jMaskGlobals.maskElements;
        var $selector = (selector instanceof $) ? selector : $(selector);
        $selector.filter($.jMaskGlobals.dataMaskAttr).each(HTMLAttributes);
    };

    var globals = {
        maskElements: 'input,td,span,div',
        dataMaskAttr: '*[data-mask]',
        dataMask: true,
        watchInterval: 300,
        watchInputs: true,
        keyStrokeCompensation: 10,
        // old versions of chrome dont work great with input event
        useInput: !/Chrome\/[2-4][0-9]|SamsungBrowser/.test(window.navigator.userAgent) && eventSupported('input'),
        watchDataMask: false,
        byPassKeys: [9, 16, 17, 18, 36, 37, 38, 39, 40, 91],
        translation: {
            '0': {pattern: /\d/},
            '9': {pattern: /\d/, optional: true},
            '#': {pattern: /\d/, recursive: true},
            'A': {pattern: /[a-zA-Z0-9]/},
            'S': {pattern: /[a-zA-Z]/}
        }
    };

    $.jMaskGlobals = $.jMaskGlobals || {};
    globals = $.jMaskGlobals = $.extend(true, {}, globals, $.jMaskGlobals);

    // looking for inputs with data-mask attribute
    if (globals.dataMask) {
        $.applyDataMask();
    }

    setInterval(function() {
        if ($.jMaskGlobals.watchDataMask) {
            $.applyDataMask();
        }
    }, globals.watchInterval);
}, window.jQuery, window.Zepto));
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
 * search_result.js
 * 
 * dependencies:
 *      namespace.js
 *      const.js
 *      utils.js
 *      mask.js
 * 
 * @author dimabresky
 * @copyright (c) 2017, travelsoft 
 */

/**
 * @param {Object} Travelsoft
 * @param {jQuery} $
 * @param {PageNavigator} pagenaviagtor
 * @param {ymaps} ymaps
 * @returns {undefined}
 */
(function (Travelsoft, $, pagenavigator, ymaps) {

    "use strict";

    var __cache = {};

    function __scrollto($element, $parentBlock, delta) {
        delta = delta || 0;
        $(parent.document).find("html").animate({scrollTop: $element.offset().top + $parentBlock.offset().top - delta}, 500);
    }

    function __initSlider($parent) {

        $parent.find(".rslides").responsiveSlides({
            auto: false,
            pager: false,
            nav: true,
            speed: 500
        });

    }

    /**
     * @param {$} $target
     * @returns {undefined}
     */
    function __initMap($target) {

        var coords_data = $target.data("coords-data"),
                map = null, coords = [];

        if ($.isArray(coords_data)) {
            if (coords_data.length === 1) {
                // рисуем точку на карте
                map = new ymaps.Map($target.attr("id"), {
                    center: [Number(coords_data[0].lat), Number(coords_data[0].lng)],
                    zoom: 9,
                    controls: ['zoomControl', 'fullscreenControl']
                });
                map.geoObjects.add(new ymaps.Placemark(map.getCenter(), {
                    balloonContent: coords_data[0].content
                }));
            } else {
                // рисуем маршрут
                map = new ymaps.Map($target.attr("id"), {
                    center: [0, 0],
                    zoom: 8,
                    controls: ['zoomControl', 'fullscreenControl']
                });

                for (var i = 0; i < coords_data.length; i++) {
                    coords.push([coords_data[i].lat, coords_data[i].lng]);
                }

                ymaps.route(coords, {mapStateAutoApply: true}).then(function (route) {
                    var points = route.getWayPoints();

                    var point;

                    map.geoObjects.add(route);

                    points.options.set('preset', 'islands#blueStretchyIcon');

                    for (var i = 0; i < coords_data.length; i++) {
                        point = points.get(i);
                        point.properties.set('iconContent', coords_data[i].title);
                        point.options.set('hasBalloon', false);
                    }
                });
            }
        }


    }

    /**
     * @param {$} $parent
     */
    function __insertSpiner($parent) {

        $parent.css({opacity: 0.4});

    }

    /**
     * @param {$} $parent
     * @returns {undefined}
     */
    function __removeSpiner($parent) {
        $parent.css({opacity: 1});
    }

    /**
     * Возвращает html для схлопывающейся панели
     * @param {String} title
     * @param {String} body
     * @param {String} accordion_id
     * @param {String} collapseIn
     * @returns {String}
     */
    function __collapsePanel(title, body, accordion_id, collapseIn) {
        var collapse_id = Travelsoft.utils.makeid();
        return `<div class="panel panel-default">
                        <div class="panel-heading">
                          <h4 class="panel-title">
                                  <a class="panel-collapser" data-toggle="collapse" data-parent="#${accordion_id}" href="#collapse-${collapse_id}">
                                    ${title}
                                  </a>
                            </h4>
                        </div>
                        <div id="collapse-${collapse_id}" class="panel-collapse collapse ${collapseIn}">
                          <div class="panel-body">
                              ${body}
                          </div>
                        </div>
                    </div>`;
    }

    /**
     * @param {String} content
     * @param {String} main_container
     * @returns {undefined}
     */
    function __insert(content, main_container) {

        document.body.innerHTML = content;
        Travelsoft.utils.HWatcher.__parent = window.parent.document.getElementById("search-result_" + main_container);
        Travelsoft.utils.HWatcher.watch(document.getElementById("container"));
    }

    /**
     * Отрисовка результов поиска и сохранения отрисовки в кеш
     * @param {Object} data
     * @returns {undefined}
     */
    function __render2Cache(data) {

        var __screen = Travelsoft.utils.screen;

        __cache[data.pager.page] = `<div class="container" id="container">
                                                        ${(function (items) {
            if (!items.length) {

                return `<div class="row">
                                                                <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 not-found-text">По Вашему запросу ничего не найдено. Пожалуйста, измените параметры поиска или оставьте заявку.</div>
                                                                <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 callback-form">
                                                                <input type="hidden" name="search_item_id" value="${data.search_items_id.length === 1 ? data.search_items_id[0] : 0}">
                                                                    <div class="form-group">
                            <label for="full_name">ФИО<span class="star">*</span></label>
                            <span class="error-container"></span>
                            <input placeholder="Иван Иванович Иванов" name="full_name" value="" type="text" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="phone">Телефон</label>
                            <span class="error-container"></span>
                            <input placeholder="+375441111111" name="phone" type="tel" value="" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="email">Email<span class="star">*</span></label>
                            <span class="error-container"></span>
                            <input placeholder="example@gmail.com" name="email" type="email" value="" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="date">Дата<span class="star">*</span></label>
                            <span class="error-container"></span>
                            <input placeholder="__.__.____" name="date" type="text" value="" class="form-control">
                            
                        </div>
                        <div class="form-group">
                            <label for="comment">Текст заявки<span class="star">*</span></label>
                            <span class="error-container"></span>
                            <textarea name="comment" class="form-control"></textarea>
                        </div>
                        <div class="form-group text-right">
                            <button type="button" id="callback-sender-btn" class="btn btn-primary">Отправить</button>
                        </div>
                                                                </div>
                                                                                </div><img style="display: none;" src="" onerror="jQuery('.callback-form input[name=date]').mask('00.00.0000');">`;
            }
            return items.map(function (item) {
                return `<div class="row thumbnail mrtb-10">
                                                                                    <div class="row-flex row-flex-wrap">
                                                                                        <div class="col-lg-4 col-md-4 col-sm-4 col-xs-12">
                                                                                        ${(function (img) {
                    if (img) {
                        return `<img class="main-img" src="${__screen(Travelsoft.SITE_ADDRESS + item.imgSrc)}">`;
                    }
                    return ``;
                })(item.imgSrc)}
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
                                                                                         ${(function (text) {

                    var html = '';
                    if (text.address) {
                        html += `<li><span class="glyphicon glyphicon-map-marker" aria-hidden="true"></span> ${__screen(text.address)}</li>`;
                    }
                    if (text.route) {
                        html += `<li><span class="glyphicon glyphicon-map-marker" aria-hidden="true"></span> ${__screen(text.route)}</li>`;
                    }
                    if (text.days) {
                        html += `<li><span class="glyphicon glyphicon-time" aria-hidden="true"></span> Количество дней: ${__screen(text.days)}</li>`;
                    }
                    if (text.duration_time) {
                        html += `<li><span class="glyphicon glyphicon-time" aria-hidden="true"></span> Количество часов: ${__screen(text.duration_time)}</li>`;
                    }
                    if (item.text.distance.minsk) {
                        html += `<li><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Расстояние до Минска: ${__screen(item.text.distance.minsk)} км</li>`;
                    }
                    if (item.text.distance.center) {
                        html += `<li><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Расстояние до цента: ${__screen(item.text.distance.center)} км</li>`;
                    }
                    if (item.text.distance.airport) {
                        html += `<li><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Расстояние до аэропорта: ${__screen(item.text.distance.airport)} км</li>`;
                    }
                    return html;
                })(item.text)}
                                                                                                
                                                                                            </ul>
                                                                                            <div class="show-offers-block flex-grow">
                                                                                                <div class="details-links">
                                                                                                    <a data-request='${JSON.stringify(item.request)}' class="detail-link __desc" href="#">Описание</a>
                                                                                                    <a data-request='${JSON.stringify(item.request)}' class="detail-link __on-map" href="#">На карте</a>
                                                                                                    <a data-request='${JSON.stringify(item.request)}' class="detail-link __video" href="#">Видео</a>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="show-offers-block flex-grow">
                                                                                                    <button data-offers-request='${JSON.stringify(item.request)}' class="btn btn-primary show-offers" type="button"><span class="price-from">${item.text.price}</span> <span class="chevron glyphicon glyphicon-chevron-down" aria-hidden="true"></button>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>`;
            }).join("");
        })(data.items || [])}
                                                        <div class="row text-right">${(function (pager) {

            return new pagenavigator((function (recs) {
                var items = [];
                for (var i = 0; i < recs; i++) {
                    items.push(i);
                }
                return items;
            })(pager.records), pager.numberPerPage).page(pager.page).getHtml();

        })(data.pager)}
                                        </div>
                                                </div>`;


        __insert(__cache[data.pager.page], data.main_container);
    }

    /**
     * Получение данных и отрисовка страницы
     * @param {Object} options
     * @returns {undefined}
     */
    function __renderPage(options) {
        
        if (typeof __cache[options.page] === 'string') {
            // берем из кеша, если есть
            __insert(__cache[options.page], options.insertion_id);
        } else {
            // запрос данных для отображения результата поиска
            Travelsoft.utils.sendRequest("GetSearchResultRenderData", [(function () {

                    var queryParts = window.parent.location.search
                            .replace("?", "")
                            .split("&")
                            .filter(function (element) {
                                return element.length > 0 && element.indexOf("tpm_params") === 0;
                            });

                    queryParts.push("tpm_params[type]=" + options.type);
                    queryParts.push("tpm_params[page]=" + options.page);
                    queryParts.push("tpm_params[citizen_price]=" + options.citizen_price);
                    queryParts.push("tpm_params[currency]=" + options.currency);
                    queryParts.push("tpm_params[number_per_page]=" + options.numberPerPage);
                    queryParts.push("tpm_params[agent]=" + options.agent);
                    queryParts.push("tpm_params[hash]=" + options.hash);
                    
                    return queryParts.join("&");

                })()], (function (options) {

                // success
                return function (resp) {

                    var __resp = resp;

                    if (__resp.isError) {
                        console.warn(resp.errorMessage);
                        __render2Cache({
                            items: [],
                            pager: {
                                page: 1,
                                numberPerPage: 0
                            },
                            main_container: options.insertion_id
                        });
                        return;
                    }

                    __resp.data.pager.numberPerPage = options.numberPerPage;
                    __resp.data.main_container = options.insertion_id;
                    __resp.data.search_items_id = (function () {
                        var queryParts = window.parent.location.search
                            .replace("?", "")
                            .split("&")
                            .filter(function (element) {
                                return element.length > 0 && element.indexOf("tpm_params") === 0;
                            });
                        var id = [];
                        var id_query_parts = [];
                        var i = 0;
                        
                        if (queryParts.length > 0) {
                            for (i = 0; i < queryParts.length; i = i+1) {
                                
                                if (/tpm_params(.*)id(.*)/.test(queryParts[i])) {
                                    id_query_parts = queryParts[i].split("=");
                                    id.push(id_query_parts[1]);
                                }
                            }
                        }
                            
                        return id;
                    })();
                    __render2Cache(__resp.data);
                    
                };

            })(options));

        }

    }

    /**
     * Отрисовка конретных предложений
     * @param {Object} data
     * @param {$} $parent
     * @param {Function} cb
     * @returns {undefined}
     */
    function __renderOffer(data, $parent, cb) {

        var page = $('.pagination li.active a').data("page");

        var __screen = Travelsoft.utils.screen;

        $parent.find(".info-block").remove();

        $parent.append(`
            <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 collapsing-block offers hidden">
                <div style="width: 100%">
                    ${(function (data) {

            var html = "";

            for (var i = 0; i < data.length; i++) {
                html += `<div class="row offer-row mrtb-10">
                                <div class="col-lg-3 col-md-3 col-sm-3 col-xs-6">
                                    ${data[i].date ? `<b>${__screen(data[i].date)}</b>` : (data[i].img_src ? `<img class="main-img" src="${Travelsoft.SITE_ADDRESS + "/" + __screen(data[i].img_src)}">` : ``)}</b>
                                </div>
                                <div class="col-lg-3 col-md-3 col-sm-3 col-xs-6">
                                    ${data[i].service ? `<div class="name">${__screen(data[i].service)}</div><h5>${__screen(data[i].rate)}</h5>` : `<div class="name">${__screen(data[i].service)}</div>`}
                                </div>
                                <div class="col-lg-3 col-md-3 col-sm-3 col-xs-12 text-right">
                                    <b>${__screen(data[i].price)}</b>${data[i].citizenprice ? `<br><small>${data[i].citizenprice}</small>` : ``}
                                </div>
                                <div class="col-lg-3 col-md-3 col-sm-3 col-xs-12 text-right">
                                    <button data-add2cart="${__screen(data[i].add2cart)}" class="btn btn-primary booking" type="button">Бронировать</button>
                                    ${data[i].rate_desc.length > 0 ? `<div class="about-rate"><a role="button" href="javascript:void(0)">О тарифе</a></div>` : ``}
                                    ${typeof data[i].room_desc === "object" && !$.isArray(data[i].room_desc) ? `<div class="about-room"><a role="button" href="javascript:void(0)">О номере</a></div>` : ``}
                                </div>
                            ${data[i].rate_desc.length > 0 ? `<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 rate-desc hidden">
                                        <div class="rate-desc-text">${__screen(data[i].rate_desc)}</div>
                                </div>` : `` }
                                
                                ${typeof data[i].room_desc === "object" && !$.isArray(data[i].room_desc) ? `<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 room-desc hidden">
                                            ${data[i].room_desc.SQUARE > 0 ? `<div class="square"><b>Площадь</b>: ${__screen(data[i].room_desc.SQUARE)}</div>` : ``}
                                            ${data[i].room_desc.BAD1 > 0 ? `<div class="bad_1"><b>Количество одноместных кроватей</b>: ${__screen(data[i].room_desc.BAD1)}</div>` : ``}
                                            ${data[i].room_desc.BAD2 > 0 ? `<div class="bad_2"><b>Количество двухместных кроватей</b>: ${__screen(data[i].room_desc.BAD2)}</div>` : ``}
                                            ${data[i].room_desc.SOFA_BAD > 0 ? `<div class="sofa-bad"><b>Количество диван-кроватей</b>: ${__screen(data[i].room_desc.SOFA_BAD)}</div>` : ``}
                                            ${data[i].room_desc.PLACES_MAIN > 0 ? `<div class="main-places"><b>Количество основных мест</b>: ${__screen(data[i].room_desc.PLACES_MAIN)}</div>` : ``}
                                            ${data[i].room_desc.PLACES_ADD > 0 ? `<div class="add-places"><b>Количество дополнительных мест</b>: ${__screen(data[i].room_desc.PLACES_ADD)}</div>` : ``}
                                            ${data[i].room_desc.PEOPLE > 0 ? `<div class="people"><b>Максимальное количество человек</b>: ${__screen(data[i].room_desc.PEOPLE)}</div>` : ``}
                                            ${typeof $.isArray(data[i].room_desc.SERVICES) && data[i].room_desc.SERVICES.length > 0 ? `<div class="people"><b>Услуги</b>: ${data[i].room_desc.SERVICES.join(", ")}</div>` : ``}
                                            ${data[i].room_desc.DESC > 0 ? `<div class="room-desc-text">${__screen(data[i].room_desc.DESC)}</div>` : ``}
                                </div>`  : ``}
                                
                            </div>`;
            }

            return html;
        })(data)}
                </div>
            </div>
        `);



        $parent.find(".offers").removeClass("hidden");

        if (typeof cb === "function") {
            cb();
        }
    }

    /**
     * Информационный блок до подгрузки контента
     * @param {Object} data
     * @param {$} $parent
     * @param {Function} cb
     * @returns {undefined}
     */
    function __renderInfoBlock(data, $parent, cb) {

        $parent.find(".info-block").remove();
        $parent.append(`
            <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 collapsing-block info-block hidden">
                <div style="width: 100%">${data.message}</div>
        </div>`);



        $parent.find(".info-block").removeClass("hidden");

        if (typeof cb === "function") {
            cb();
        }
    }

    /**
     * @param {$} obj
     * @returns {undefined}
     */
    function __chevronUp(obj) {
        obj.find("span.chevron").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");
    }

    function __chevronDownAll() {
        $(".show-offers").each(function () {
            __chevronDown($(this));
        });
    }

    /**
     * @param {$} obj
     * @returns {undefined}
     */
    function __chevronDown(obj) {
        obj.find("span.chevron").removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
    }

    /**
     * @param {$} $target
     * @param {Function} cb1
     * @param {Function} cb2
     * @returns {undefined}
     */
    function __toggleCollapsingBlocks($target, cb1, cb2) {

        var hasClass__ = $target !== null ? $target.hasClass("hidden") : null;

        $(".collapsing-block").addClass("hidden");

        if (hasClass__ !== null) {

            if (hasClass__) {

                if ($target) {
                    $target.removeClass("hidden");
                }

                if (typeof cb1 === "function") {
                    cb1();
                }
            } else {

                if ($target) {
                    $target.addClass("hidden");
                }

                if (typeof cb2 === "function") {
                    cb2();
                }
            }

        } else {
            if (typeof cb1 === "function") {
                cb1();
            }
        }

    }

    /**
     * Отрисовка блока детального описания
     * @param {Object} data
     * @param {$} $parent
     * @param {Function} cb
     * @returns {undefined}
     */
    function __renderDetailDescription(data, $parent, cb) {

        var page = $('.pagination li.active a').data("page");

        var slider_id = Travelsoft.utils.makeid();

        var accordion_id = "accordion-" + Travelsoft.utils.makeid();

        var collapseIn = "in";

        $parent.find(".info-block").remove();

        $parent.append(`
            <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 collapsing-block detail-desc-block hidden">
                
                    ${(function (data) {

            var html = ``;
            if ($.isArray(data.pictures.big)) {
                html += `<section id="${slider_id}" class="detail-slider">
                                    <ul class="rslides">
                                        ${(function (big) {

                    html = "";
                    for (var i = 0; i < big.length; i++) {
                        html += `<li><img src="${Travelsoft.SITE_ADDRESS + big[i]}"></li>`;
                    }
                    return html;
                })(data.pictures.big)}
                                    </ul>
                            </section>`;


            }

            html += `<div class="panel-group" id="${accordion_id}">`;
            if (data.desc) {
                html += __collapsePanel("Описание", data.desc, accordion_id, collapseIn);
                collapseIn = "";
            }

            if (data.program) {
                html += __collapsePanel("Программа тура", data.program, accordion_id, collapseIn);
                collapseIn = "";
            }

            if (data.profiles) {
                html += __collapsePanel("Профиль", (function (services) {

                    var html = `<div class="featured-service">`;
                    for (var section_id in services.TYPE_GROUP) {
                        html += `<div class="list-service-section">${services.TYPE_SECTIONS ? (
                                `${services.TYPE_SECTIONS[section_id].PICTURE.SRC ? `<div class="icon-service" style="float:left; top:2px"><img src="${Travelsoft.SITE_ADDRESS + services.TYPE_SECTIONS[section_id].PICTURE.SRC}"></div>` : ``}
                                                                            <h4>${services.TYPE_SECTIONS[section_id].TITLE}</h4>`
                                ) : ``}
                                                                            
                                                                        </div>
                                                                        <ul class="service-accmd">
                                                                            ${(function (servicesGroup) {
                            var html = '';
                            for (var service_id in servicesGroup) {
                                html += `<li><div><img src="${Travelsoft.SITE_ADDRESS}/local/templates/travelsoft/images/icon-check.png" alt=""></div>${servicesGroup[service_id].TITLE} ${servicesGroup[service_id].PAID ? `<a data-content="За дополнительную плату">(<i class="fa fa-dollar"></i>)</a>` : ``}</li>`;
                            }
                            return html;
                        })(services.TYPE_GROUP[section_id])}
                                                                        </ul>`;
                    }
                    html += "</div>";
                    return html;
                })(data.profiles), accordion_id, collapseIn);
                collapseIn = "";
            }

            if (data.services) {
                html += __collapsePanel("Услуги", (function (services) {

                    var html = `<div class="featured-service">`;
                    for (var section_id in services.SERVICES_GROUP) {
                        html += `<div class="list-service-section">
                                                                            ${services.SERVICES_SECTIONS[section_id].PICTURE.SRC ? `<div class="icon-service" style="float:left; top:2px"><img src="${Travelsoft.SITE_ADDRESS + services.SERVICES_SECTIONS[section_id].PICTURE.SRC}"></div>` : ``}
                                                                            <h4>${services.SERVICES_SECTIONS[section_id].TITLE}</h4>
                                                                        </div>
                                                                        <ul class="service-accmd">
                                                                            ${(function (servicesGroup) {
                            var html = '';
                            for (var service_id in servicesGroup) {
                                html += `<li><div><img src="${Travelsoft.SITE_ADDRESS}/local/templates/travelsoft/images/icon-check.png" alt=""></div>${servicesGroup[service_id].TITLE}</li>`;
                            }
                            return html;
                        })(services.SERVICES_GROUP[section_id])}
                                                                        </ul>`;
                    }
                    html += "</div>";
                    return html;
                })(data.services), accordion_id, collapseIn);
                collapseIn = "";

            }

            if (data.medecine_services) {
                html += __collapsePanel("Медицинские услуги", (function (services) {

                    var html = `<div class="featured-service">`;
                    for (var section_id in services.MED_SERVICES_GROUP) {
                        html += `<div class="list-service-section">
                                                                            <h4>${services.MED_SERVICES_SECTIONS[section_id].TITLE}</h4>
                                                                        </div>
                                                                        <ul class="service-accmd">
                                                                            ${(function (servicesGroup) {
                            var html = '';
                            for (var service_id in servicesGroup) {
                                html += `<li><div><img src="${Travelsoft.SITE_ADDRESS}/local/templates/travelsoft/images/icon-check.png" alt=""></div>${servicesGroup[service_id].TITLE} ${servicesGroup[service_id].PAID ? `<a data-content="За дополнительную плату">(<i class="fa fa-dollar"></i>)</a>` : ``}</li>`;
                            }
                            return html;
                        })(services.MED_SERVICES_GROUP[section_id])}
                                                                        </ul>`;
                    }
                    html += "</div>";
                    return html;
                })(data.medecine_services), accordion_id, collapseIn);
                collapseIn = "";
            }

            if (data.children_services) {
                html += __collapsePanel("Услуги для детей", data.children_services, accordion_id, collapseIn);
                collapseIn = "";
            }

            if (data.food) {
                html += __collapsePanel("Питание", data.food, accordion_id, collapseIn);
                collapseIn = "";
            }

            if (data.rooms_base) {
                html += __collapsePanel("Номерная база", data.rooms_base, accordion_id, collapseIn);
                collapseIn = "";
            }

            if (data.addinfo) {
                html += __collapsePanel("Дополнительная информация", data.addinfo, accordion_id, collapseIn);
                collapseIn = "";
            }

            html += `</div>`;
            return html;
        })(data)}
                
            </div>
        `);

        $parent.find(".detail-desc-block").removeClass("hidden");

        if (typeof cb === "function") {
            cb();
        }

        __initSlider($("#" + slider_id));

    }

    /**
     * Отрисовка блока отображения на карте
     * @param {Object} data
     * @param {$} $parent
     * @param {Function} cb
     * @returns {undefined}
     */
    function __renderDetailMap(data, $parent, cb) {

        var page = $('.pagination li.active a').data("page");

        var mapContainerId = "map-" + Travelsoft.utils.makeid();

        $parent.find(".info-block").remove();

        $parent.append(`<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 collapsing-block show-on-map-block hidden">
                                        <div style="width: 100%">
                                            <div data-coords-data='${JSON.stringify(data)}' id="${mapContainerId}"></div>
                                        </div>
                                    </div>`);



        $parent.find(".show-on-map-block").removeClass("hidden");

        if (typeof cb === "function") {
            cb();
        }

        __initMap($(`#${mapContainerId}`));
    }

    /**
     * Отрисовка блока с видео
     * @param {Object} data
     * @param {$} $parent
     * @param {Function} cb
     * @returns {undefined}
     */
    function __renderDetailVideo(data, $parent, cb) {

        var page = $('.pagination li.active a').data("page");

        $parent.find(".info-block").remove();

        $parent.append(`<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 collapsing-block video-block hidden">
                                        <div style="width: 100%">
                                            <iframe class="video-frame" height="100%" width="100%" style="border: none;" src="${Travelsoft.VIDEO_URL + data.code}" allowfullscreen=""></iframe>
                                        </div>
                                    </div>`);



        $parent.find(".video-block").removeClass("hidden");

        if (typeof cb === "function") {
            cb();
        }
    }

    Travelsoft.searchResult = {

        /**
         * Инициализация работы страницы результатов поиска
         * @param {Object} options
         * @returns {undefined}
         */
        init: function (options) {

            var opt = options;

            __renderPage(opt);

            // show offers
            $(document).on("click", ".show-offers", function (e) {

                var $this = $(this);

                var $parent = $this.closest(".thumbnail");

                var $offers = $parent.find(".offers");

                if ($offers.length) {

                    __toggleCollapsingBlocks($offers, function () {
                        __chevronUp($this);
                    }, function () {
                        __chevronDown($this);
                    });

                } else {

                    __toggleCollapsingBlocks(null, function () {
                        __chevronDownAll();
                    });

                    __chevronUp($this);
                    __insertSpiner($this);
                    __renderInfoBlock({message: "Идет загрузка предложений. Пожалуйста, подождите..."}, $parent);

                    // get offers
                    Travelsoft.utils.sendRequest("GetOffersRenderData", [$this.data("offers-request").join("&")], (function ($parent) {

                        // success
                        return function (resp) {

                            if (resp.isError) {
                                console.warn(resp.errorMessage);
                                __renderInfoBlock({message: "Предложения отсутствуют."}, $parent, function () {
                                    __removeSpiner($this);
                                });
                                return;
                            }

                            __renderOffer(resp.data, $parent, function () {
                                __removeSpiner($this);
                            });

                        };

                    })($parent));
                }

                e.preventDefault();
            });

            // show rate description
            $(document).on("click", ".about-rate", function (e) {

                $(this).closest(".offer-row").find(".rate-desc").toggleClass("hidden");
                e.preventDefault();
            });
            
            // show rate description
            $(document).on("click", ".about-room", function (e) {

                $(this).closest(".offer-row").find(".room-desc").toggleClass("hidden");
                e.preventDefault();
            });

            // show detail description
            $(document).on("click", ".detail-link.__desc", function (e) {

                var $this = $(this);

                var $parent = $this.closest(".thumbnail");

                var $detailDescBlock = $parent.find(".detail-desc-block");

                if ($detailDescBlock.length) {

                    __toggleCollapsingBlocks($detailDescBlock, function () {
                        __chevronDownAll();
                    }, function () {
                        __chevronDownAll();
                    });

                } else {

                    __toggleCollapsingBlocks(null, function () {
                        __chevronDownAll();
                    }, function () {
                        __chevronDownAll();
                    });

                    __insertSpiner($this);
                    __renderInfoBlock({message: "Идет загрузка информации. Пожалуйста, подождите..."}, $parent);

                    // get detail description
                    Travelsoft.utils.sendRequest("GetDetailDescriptionRenderData", [$this.data("request").join("&")], (function ($parent) {

                        // success
                        return function (resp) {

                            if (resp.isError) {
                                console.warn(resp.errorMessage);
                                __renderInfoBlock({message: "Информация отсутствует."}, $parent, function () {
                                    __removeSpiner($this);
                                });
                                return;
                            }

                            __renderDetailDescription(resp.data, $parent, function () {
                                __removeSpiner($this);
                            });

                        };

                    })($parent));
                }

                e.preventDefault();
            });

            // show map
            $(document).on("click", ".detail-link.__on-map", function (e) {

                var $this = $(this);

                var $parent = $this.closest(".thumbnail");

                var $showOnMapBlock = $parent.find(".show-on-map-block");

                if ($showOnMapBlock.length) {

                    __toggleCollapsingBlocks($showOnMapBlock, function () {
                        __chevronDownAll();
                    }, function () {
                        __chevronDownAll();
                    });

                } else {

                    __toggleCollapsingBlocks(null, function () {
                        __chevronDownAll();
                    }, function () {
                        __chevronDownAll();
                    });
                    __insertSpiner($this);
                    __renderInfoBlock({message: "Идет загрузка карты. Пожалуйста, подождите..."}, $parent);

                    // get detail description
                    Travelsoft.utils.sendRequest("GetDetailMapRenderData", [$this.data("request").join("&")], (function ($parent) {

                        // success
                        return function (resp) {

                            if (resp.isError) {
                                console.warn(resp.errorMessage);
                                __renderInfoBlock({message: "Информация отсутствует."}, $parent, function () {
                                    __removeSpiner($this);
                                });
                                return;
                            }

                            __renderDetailMap(resp.data, $parent, function () {
                                __removeSpiner($this);
                            });

                        };

                    })($parent));
                }

                e.preventDefault();
            });

            // show video
            $(document).on("click", ".detail-link.__video", function (e) {

                var $this = $(this);

                var $parent = $this.closest(".thumbnail");

                var $videoBlock = $parent.find(".video-block");

                if ($videoBlock.length) {

                    __toggleCollapsingBlocks($videoBlock, function () {
                        __chevronDownAll();
                    }, function () {
                        __chevronDownAll();
                    });

                } else {

                    __toggleCollapsingBlocks(null, function () {
                        __chevronDownAll();
                    }, function () {
                        __chevronDownAll();
                    });
                    __insertSpiner($this);
                    __renderInfoBlock({message: "Идет загрузка видео. Пожалуйста, подождите..."}, $parent);

                    // get video
                    Travelsoft.utils.sendRequest("GetDetailVideoRenderData", [$this.data("request").join("&")], (function ($parent) {

                        // success
                        return function (resp) {

                            if (resp.isError) {
                                console.warn(resp.errorMessage);
                                __renderInfoBlock({message: "Видео отсутствует."}, $parent, function () {
                                    __removeSpiner($this);
                                });
                                return;
                            }

                            if (!resp.data.code) {
                                __renderInfoBlock({message: "Видео отсутствует."}, $parent, function () {
                                    __removeSpiner($this);
                                });
                                return;
                            }

                            __renderDetailVideo(resp.data, $parent, function () {
                                __removeSpiner($this);
                            });

                        };

                    })($parent));
                }

                e.preventDefault();
            });

            // page switcher
            $(document).on("click", ".pagination a", function (e) {

                e.preventDefault();

                if (!$(this).parent().hasClass("active")) {

                    opt.page = $(this).data("page");

                    __renderPage(opt);

                }

            });

            // booking button
            $(document).on("click", ".booking", function (e) {

                var add2cart = $(this).data("add2cart");

                e.preventDefault();

                if (add2cart) {

                    window.parent.open(Travelsoft.REQUEST_URL + "/?method=Booking&tpm_params[add2cart]=" + add2cart);
                } else {
                    alert("Some error. Please, try later.");
                }

            });

            /**
             * Прокрутка страницы к схлопывающимся панелям
             */
            $(document).on("click", ".panel-collapser", function () {
                __scrollto($(this), $(parent.document).find("#" + options.insertion_id), 100);
            });
            
            // set date mask input
//            $(document).one("click", ".callback-form input[name=date]", function () {
//                $(this).mask("99.99.9999");
//            });
            
            // send callback form
            $(document).on("click", "#callback-sender-btn", function () {
                
                var $this = $(this);
                
                var $container = $this.closest(".callback-form");
                
                var data = {
                        full_name: $container.find("input[name='full_name']").val(),
                        phone: $container.find("input[name='phone']").val(),
                        email: $container.find("input[name='email']").val(),
                        date: $container.find("input[name='date']").val(),
                        comment: $container.find("textarea[name='comment']").val(),
                        agent_id: options.agent,
                        search_item_id: $container.find("input[name='search_item_id']").val()
                    };
                    var haveError = false;

                    $container.find(".error-container").each(function () {
                        var $this = $(this);
                        $this.removeClass("active");
                        $this.html("");
                    });

                    for (var k in data) {
                        switch (k) {
                            case "full_name":
                                if (data[k].length <= 2) {
                                    haveError = true;
                                    $container.find("input[name='full_name']")
                                            .prev(".error-container").addClass("active")
                                            .text(`Укажите ФИО`);
                                }
                                break;
                            case "comment":
                                if (data[k].length <= 2) {
                                    haveError = true;
                                    $container.find("textarea[name='comment']")
                                            .prev(".error-container").addClass("active")
                                            .text(`Укажите текст заявки`);
                                }
                                break;
                            case "phone":
                                if (data[k].length > 0 && !(/^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/gm).test(data[k])) {
                                    haveError = true;
                                    $container.find("input[name='phone']")
                                            .prev(".error-container").addClass("active")
                                            .text(`Укажите телефон в международном формате`);
                                }
                                break;
                            case "email":
                                if (!(/^[-._a-z0-9]+@(?:[a-z0-9][-a-z0-9]+\.)+[a-z]{2,6}$/).test(data[k])) {
                                    haveError = true;
                                    $container.find("input[name='email']")
                                            .prev(".error-container").addClass("active")
                                            .text(`Укажите корректный email`);
                                }
                                break;

                            case "date":
                                if (!data[k].length) {
                                    haveError = true;
                                    $container.find("input[name='date']")
                                            .prev(".error-container").addClass("active")
                                            .text(`Укажите дату`);
                                }
                                break;
                        }
                    }

                    if (!haveError) {
                        
                        $this.prop("disabeled", true).css({opacity: .5});
                        
                        Travelsoft.utils.sendRequest("SendCallbackForm", [$.param({tpm_params: data})], (function ($container, $btn) {

                            // success
                            return function (resp) {

                                $container.parent().find(".not-found-text").remove();

                                $container.html("");

                                $btn.remove();
                                
                                __scrollto($container, $container, -200);
                                
                                if (resp.isError) {
                                    $container.html(`<span class="error-container">Произошла ошибка при попытке отправить заявку. Пожалуйста, попробуйте повторить поиск через 5 минут.</span>`);
                                    return;
                                }

                                if (resp.data.isOk) {
                                    $container.html(`<span class="message-ok">Спасибо! Ваша заявка принята. Втечение 15 минут наши менеджеры свяжутся с Вами.</span>`);
                                    return;
                                }

                            };

                        })($container, $this));
                    } else {
                        __scrollto($(".callback-form .error-container.active").first(), $container, -200);
                    }
                
            });

        }
    };

})(Travelsoft, jQuery, PageNavigator, ymaps);
