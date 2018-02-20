/**
 * forms.js
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
        span.style.display = "inline-block";
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
                                                                                        <div class="col-md-3 col-sm-6">
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
                                                                <div class="col-md-3 col-sm-6">
                                                                    <div class="form-group">
                                                                        <label>
                                                                            ${__screen(data[key].dates.title)}
                                                                        </label>
                                                                        <input data-need-create-iframe-datepicker="yes"  data-format="${__screen(data[key].dates.format)}" data-date-separator="${__screen(data[key].dates.separator)}" data-duration-title="${__screen(data[key].dates.durationTitle)}" value="${__screen(data[key].dates.defValue)}" name="tpm_params[date_range]" id="${key_}-datepicker" type="text" class="datepicker form-control" >
                                                                    </div>
                                                                </div>
                                                                <div class="col-md-2 col-sm-6">
                                                                    <div class="form-group">
                                                                        <label>
                                                                            ${__screen(data[key].adults.title)}
                                                                        </label>
                                                                        <select data-without="yes" data-iframe-select-height="200" data-need-create-iframe-select="yes" id="${key_}-adults-select" name="tpm_params[adults]" class="form-control select2">
                                                                            <option data-span-text="1" ${Number(data[key].adults.defValue) === 1 ? `selected=""` : ``} value="1">1</option>
                                                                            <option data-span-text="2" ${Number(data[key].adults.defValue) === 2 ? `selected=""` : ``} value="2">2</option>
                                                                            <option data-span-text="3" ${Number(data[key].adults.defValue) === 3 ? `selected=""` : ``} value="3">3</option>
                                                                            <option data-span-text="4" ${Number(data[key].adults.defValue) === 4 ? `selected=""` : ``} value="4">4</option>
                                                                            <option data-span-text="5" ${Number(data[key].adults.defValue) === 5 ? `selected=""` : ``} value="5">5</option>
                                                                            <option data-span-text="6" ${Number(data[key].adults.defValue) === 6 ? `selected=""` : ``} value="6">6</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div class="col-md-2 col-sm-6">
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
                (function () {
                    return window.parent.location.search
                            .replace("?", "")
                            .split("&")
                            .filter(function (element) {
                                return element.length > 0 && element.indexOf("tpm_params") === 0;
                            }).join("&");
                })()
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

