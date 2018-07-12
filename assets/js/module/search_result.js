/**
 * search_result.js
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
                                                                    <div class="form-group">
                            <label for="full_name">ФИО<span class="star">*</span></label>
                            <span class="error-container"></span>
                            <input placeholder="Иван Иванович Иванов" name="full_name" value="" type="text" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="phone">Телефон</label>
                            <span class="error-container"></span>
                            <input placeholder="+375441111111" name="phone" type="phone" value="" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="email">Email<span class="star">*</span></label>
                            <span class="error-container"></span>
                            <input placeholder="example@gmail.com" name="email" type="email" value="" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="date">Дата<span class="star">*</span></label>
                            <span class="error-container"></span>
                            <input placeholder="dd.mm.yyyy" name="date" type="number" value="" class="form-control">
                            
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
                        agent_id: options.agent
                    };
                    var haveError = false;

                    $container.find(".error-container").html("");

                    for (var k in data) {
                        switch (k) {
                            case "full_name":
                                if (data[k].length <= 2) {
                                    haveError = true;
                                    $container.find("input[name='full_name']")
                                            .prev(".error-container")
                                            .text(`Укажите ФИО`);
                                }
                                break;
                            case "comment":
                                if (data[k].length <= 2) {
                                    haveError = true;
                                    $container.find("textarea[name='comment']")
                                            .prev(".error-container")
                                            .text(`Укажите текст заявки`);
                                }
                                break;
                            case "phone":
                                if (data[k].length > 0 && !(/^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/gm).test(data[k])) {
                                    haveError = true;
                                    $container.find("input[name='phone']")
                                            .prev(".error-container")
                                            .text(`Укажите телефон в международном формате`);
                                }
                                break;
                            case "email":
                                if (!(/^[-._a-z0-9]+@(?:[a-z0-9][-a-z0-9]+\.)+[a-z]{2,6}$/).test(data[k])) {
                                    haveError = true;
                                    $container.find("input[name='email']")
                                            .prev(".error-container")
                                            .text(`Укажите корректный email`);
                                }
                                break;

                            case "date":
                                if (!data[k].length) {
                                    haveError = true;
                                    $container.find("input[name='date']")
                                            .prev(".error-container")
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
                                
                                __scrollto($container, $container);
                                
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
                        __scrollto($container, $container);
                    }
                
            });

        }
    };

})(Travelsoft, jQuery, PageNavigator, ymaps);
