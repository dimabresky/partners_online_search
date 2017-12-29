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

    /**
     * Контейнер обработчиков событий
     * @type Object
     */
    var __eventsHandlers = {

        /**
         * Обработка выбора количества детей
         * @param {Event} e
         * @returns {undefined}
         */
        childCountChoosing: function (e) {

            var count = Number(this.value);

            function destroyAgeSelector($this) {

                $this.find(".age-selector").each(function () {

                    try {
                        $(this).find("select.select2").select2("destroy");
                    } catch (e) {
                        console.warn(e.message);
                    }

                    $(this).remove();
                });
            }

            if (count > 0) {

                $(this).siblings('.age-wrapper').each(function () {

                    var ageSelectTitleTemplate = $(this).data("ageSelectTitleTemplate");

                    destroyAgeSelector($(this));

                    $(this).append((function (titleTemplate, count) {
                        var html = "";

                        for (var i = 1; i <= count; i++) {

                            html += __createChildrenAgeBlock(i, titleTemplate);
                        }

                        return html;
                    })(ageSelectTitleTemplate, count));

                    __initSelect($(this));

                    $(this).show();
                });

            } else {

                $(this).siblings('.age-wrapper').each(function () {
                    destroyAgeSelector($(this));
                    $(this).hide();
                });
            }

        },

        /**
         * Осуществляет переход на страницу поиска
         * @param {Event} e
         * @param {String} url
         * @returns {undefined}
         */
        search: function (e, url) {

            window.parent.open(url + "?" + $(this).closest("form").serialize(), '__blank');
        }

    };

    // set russian locale of date staff 
    moment.locale("ru");

    /**
     * Инициализация форм на вкладках
     * @param {$} tab
     * @returns {undefined}
     */
    function __init(tab) {

        var tabArea = $(tab.attr("href"));

        // select init
        __initSelect(tabArea);

        // daterangepicker init
        tabArea.find('.datepicker').each(function () {
            __initDatepicker($(this));
        });

        // children age block closing init
        tabArea.find(".age-closer").each(function () {
            $(this).on("click", function () {
                $(this).parent().hide();
            });
        });

        // go to search page handler
        tabArea.find("form").find("button").each(function () {

            var handlerName = $(this).data("onclick-handler-name");
            if (handlerName) {
                $(this).on("click", function (e) {
                    __eventsHandlers[handlerName].apply(this, [e, $(this).data("url")]);
                    e.preventDefault();
                });
            }
        });
    }

    /**
     * Инициализация select2
     * @param {$} parent
     * @returns {undefined}
     */
    function __initSelect(parent) {

        parent.find('.select2').each(function () {

            var $this = $(this);

            $this.select2();

            if ($this.data("onselect-handler-name")) {

                $this.on("select2:select", function (e) {
                    __eventsHandlers[$this.data("onselect-handler-name")].apply(this, [e]);
                });

            }

        });
    }

    /**
     * Инициализация работы календаря в форме поиска
     * @param {$} $this
     * @returns {undefined}
     */
    function __initDatepicker($this) {

        var options = {
            minDate: new Date(),
            startDate: $this.data('start-date'),
            endDate: $this.data('end-date'),
            autoApply: true,
            locale: {
                format: $this.data("format"),
                separator: $this.data("date-separator"),
                daysOfWeek: moment.weekdaysMin(),
                monthNames: moment.monthsShort(),
                firstDay: moment.localeData().firstDayOfWeek(),
            }
        };

        if ($this.val()) {
            options.startDate = $this.val().split($this.data("date-separator"))[0];
            options.endDate = $this.val().split($this.data("date-separator"))[1];
        }

        $this.daterangepicker(options).on("show.daterangepicker", function (ev, picker) {

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

        $this.one("show.daterangepicker", function (ev, picker) {
            $(picker.container).find(".end-date").removeClass(".end-date");
        });
    }

    /**
     * Создание html-блока для выбора возраста ребенка
     * @param {Number} index
     * @param {String} titleTemplate
     * @returns {String}
     */
    function __createChildrenAgeBlock(index, titleTemplate) {

        var options = (function () {

            var str = "";

            for (var i = 1; i <= 17; i++) {
                str += `<option value="${i}">${i}</option>`;
            }

            return str;

        })();

        return `<div class="age-selector">
                        ${titleTemplate.replace("{{index}}", index)}
                        <select data-index="${index}" class="select2 form-control" name="tpm_params[children_age][]">
                            ${options}
                        </select>
                    </div>
                    <div class="clearfix"></div>`;

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
                                                                                                <select name="tpm_params[id][]" class="form-control select2">
                                                                                                    ${(function (objects) {
                    var html = "";
                    for (var i = 0; i < objects.length; i++) {
                        html += `<option ${objects[i].isSelected ? 'selected=""' : ''} value="${__screen(objects[i].id)}">${__screen(objects[i].name)}</option>`;
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
                                                                        <input data-format="${__screen(data[key].dates.format)}" data-date-separator="${__screen(data[key].dates.separator)}" data-duration-title="${__screen(data[key].dates.durationTitle)}" value="${__screen(data[key].dates.inputValue)}" name="tpm_params[date_range]" type="text" class="datepicker form-control" >
                                                                    </div>
                                                                </div>
                                                                <div class="col-md-2 col-sm-6">
                                                                    <div class="form-group">
                                                                        <label>
                                                                            ${__screen(data[key].adults.title)}
                                                                        </label>
                                                                        <select name="tpm_params[adults]" class="form-control select2">
                                                                            <option ${data[key].adults.inputValue === 1 ? `selected=""` : ``} value="1">1</option>
                                                                            <option ${data[key].adults.inputValue === 2 ? `selected=""` : ``} value="2">2</option>
                                                                            <option ${data[key].adults.inputValue === 3 ? `selected=""` : ``} value="3">3</option>
                                                                            <option ${data[key].adults.inputValue === 4 ? `selected=""` : ``} value="4">4</option>
                                                                            <option ${data[key].adults.inputValue === 5 ? `selected=""` : ``} value="5">5</option>
                                                                            <option ${data[key].adults.inputValue === 6 ? `selected=""` : ``} value="6">6</option>
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
                                                                            <option ${data[key].children.inputValue === 1 ? `selected=""` : ``} value="1">1</option>
                                                                            <option ${data[key].children.inputValue === 2 ? `selected=""` : ``} value="2">2</option>
                                                                            <option ${data[key].children.inputValue === 3 ? `selected=""` : ``} value="3">3</option>
                                                                            <option ${data[key].children.inputValue === 4 ? `selected=""` : ``} value="4">4</option>
                                                                        </select>
                                                                        <div data-age-select-title-template="${__screen(data[key].children.ageSelectTitleTemplate)}" class="age-wrapper">
                                                                            <span class="age-title">${__screen(data[key].children.ageTitle)}</span>
                                                                            <hr>
                                                                            <div class="age-closer">×</div>
                                                                            ${(function (children, age) {

                    if (children.inputValue > 0) {
                        return (function (count, age) {

                            html = ``;
                            for (var i = 1; i <= count; i++) {
                                html += `<div class="age-selector">
                                        ${children.ageSelectTitleTemplate.replace("{{index}}", i)}
                                        <select data-index="${i}" class="select2 form-control" name="tpm_params[children_age][]">
                                            ${(function (age, index) {
                                    var options = "";

                                    for (var i = 1; i <= 17; i++) {
                                        options += `<option ${Number(age[index - 1]) === i ? `selected=""` : ``} value="${i}">${i}</option>`;
                                    }

                                    return options;
                                })(age, i)}
                                        </select>
                                    </div>
                                    <div class="clearfix"></div>`;
                            }
                            return html;
                        })(children.inputValue, age);
                    } else {
                        return ``;
                    }

                })(data[key].children, data[key].children_age)}
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

        Travelsoft.utils.HWatcher.__parent = window.parent.document.getElementById("search-forms");
        Travelsoft.utils.HWatcher.watch(document.body);
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



                            // init all tabs
                            $(".nav-tabs a").each(function () {

                                var tab = $(this);

                                if (tab.parent().hasClass('active')) {

                                    __init(tab);

                                } else {
                                    tab.one("shown.bs.tab", function () {

                                        __init(tab);

                                    });
                                }
                            });

                        };

                    })(options));

                }
            };
        })(Travelsoft, jQuery);

