/**
 * @author dimabresky
 * @copyright (c) 2017, travelsoft 
 */

(function () {

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

                    $(this).append((function () {

                        var html = "";

                        for (var i = 1; i <= count; i++) {

                            html += __createChildrenAgeBlock(i, ageSelectTitleTemplate);
                        }

                        return html;
                    })());

                    __initSelect2($(this));

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
            
            window.parent.location = url + "?" + $(this).closest("form").serialize();
            
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

        // select2 init
        __initSelect2(tabArea);

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
    function __initSelect2(parent) {

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
})();

