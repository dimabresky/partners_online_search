/**
 * datapicker.js
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

            var iframe = window.parent.document.getElementById(options.iframe_id);

            div.id = "datepicker-shower";

            var $div = $(div);
            // set russian locale of date staff 
            moment.locale("ru");

            document.body.appendChild(div);

            var __options = {
                minDate: new Date(),
                startDate: options.start_date,
                endDate: options.end_date,
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
            $div.trigger("click");
            Travelsoft.utils.HWatcher.__parent = iframe;
            Travelsoft.utils.HWatcher.watch(document.body);
        }
    };

})(Travelsoft, moment, jQuery);
