/**
 * @author dimabresky
 * @copyright (c) 2017, travelsoft 
 */

$(document).ready(function () {
    
    moment.locale("ru");
    
    /**
     * Инициализация форм на вкладках
     * @param {$} tab
     * @returns {undefined}
     */
    function __init(tab) {

        var tabArea = $(tab.attr("href"));

        tabArea.find('.select2').each(function () {
            $(this).select2();
        });
        
        tabArea.find('.datepicker').each(function () {
            __initDatepicker($(this));
        });

    }
    
    /**
     * Инициализация работы календаря в форме поиска
     * @param {$} $this
     * @returns {undefined}
     */
    function __initDatepicker ($this) {
        
        var options = {
            minDate: new Date(),
            startDate: $this.data('start-date'),
            endDate: $this.data('end-date'),
            autoApply: true,
            locale: {
                format: "DD.MM.YYYY",
                separator: ' - ',
                daysOfWeek: moment.weekdaysMin(),
                monthNames: moment.monthsShort(),
                firstDay: moment.localeData().firstDayOfWeek(),
            }
        };

        $this.daterangepicker(options).on("apply.daterangepicker", function () {
            
            var $this = $(this);
            
            var arVals = $this.val().split(" - ") || [];

            if (arVals.length) {

                    $this.siblings('input[name="tpm_params[date_from]"]').val(arVals[0]);
                    $this.siblings('input[name="tpm_params[date_to]"]').val(arVals[1]);
            }


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

        $this.one("show.daterangepicker", function (ev, picker) {
            $(picker.container).find(".end-date").removeClass(".end-date");
        });
    }

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
});

