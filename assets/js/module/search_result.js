/**
 * search_result.js
 * @author dimabresky
 * @copyright (c) 2017, travelsoft 
 */

/**
 * @param {Object} Travelsoft
 * @param {jQuery} $
 * @param {PageNavigator} pagenaviagtor
 * @param {Cache} cache
 * @returns {undefined}
 */
(function (Travelsoft, $, pagenavigator) {

    "use strict";

    var __cache = {};

    /**
     * @param {String} content
     * @returns {undefined}
     */
    function __insert(content) {
        document.body.innerHTML = content;
        Travelsoft.utils.HWatcher.__parent = window.parent.document.getElementById("search-result");
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
                                                                <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">По Вашему запросу ничего не найдено.</div>
                                                                                </div>`;
            }
            return items.map(function (item) {
                return `<div class="row">
                                                                                    <div class="thumbnail row-flex row-flex-wrap mrtb-10">
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
                        html += `<li><span class="glyphicon glyphicon-time" aria-hidden="true"></span> ${__screen(text.days)}</li>`;
                    }
                    if (text.duration_time) {
                        html += `<li><span class="glyphicon glyphicon-time" aria-hidden="true"></span> ${__screen(text.duration_time)}</li>`;
                    }
                    if (item.text.distance.center) {
                        html += `<li><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> ${__screen(item.text.distance.center)}</li>`;
                    }
                    if (item.text.distance.airport) {
                        html += `<li><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> ${__screen(item.text.distance.airport)}</li>`;
                    }
                    return html;
                })(item.text)}
                                                                                                
                                                                                            </ul>
                                                                                            <div class="show-offers-block flex-grow">
                                                                                                <button data-offers-request='${JSON.stringify(item.request)}' class="btn btn-primary show-offers" type="button">${item.text.price} <span class="glyphicon glyphicon-chevron-down" aria-hidden="true"></button>
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


        __insert(__cache[data.pager.page]);
    }

    /**
     * Получение данных и отрисовка страницы
     * @param {Object} options
     * @returns {undefined}
     */
    function __renderPage(options) {

        if (typeof __cache[options.page] === 'string') {
            // берем из кеша, если есть
            __insert(__cache[options.page]);
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
                            }
                        });
                    }

                    __resp.data.pager.numberPerPage = options.numberPerPage;

                    __render2Cache(__resp.data);

                };

            })(options));

        }

    }

    function __renderOffer(data, $parent) {

        var page = $('.pagination li.active a').data("page");

        var __screen = Travelsoft.utils.screen;

        $parent.append(`
            <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 offers hidden">
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
                                </div>
                            </div>`;
            }

            return html;
        })(data)}
                </div>
            </div>
        `);

        __cache[page ? page : 1] = $("body").html();

        $parent.find(".offers").removeClass("hidden");
    }

    /**
     * @param {$} obj
     * @returns {undefined}
     */
    function __chevronDown(obj) {
        obj.find("span").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");
    }

    /**
     * @param {$} obj
     * @returns {undefined}
     */
    function __chevronUp(obj) {
        obj.find("span").removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
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

                    if ($offers.hasClass("hidden")) {

                        $offers.removeClass("hidden");
                        __chevronDown($this);
                    } else {

                        $offers.addClass("hidden");
                        __chevronUp($this);
                    }

                } else {

                    // get offers
                    Travelsoft.utils.sendRequest("GetOffersRenderData", [$this.data("offers-request").join("&")], (function ($parent) {

                        // success
                        return function (resp) {

                            if (resp.isError) {
                                console.warn(resp.errorMessage);
                                return;
                            }

                            __chevronDown($this);

                            __renderOffer(resp.data, $parent);

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

        }
    };

})(Travelsoft, jQuery, PageNavigator);
