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
