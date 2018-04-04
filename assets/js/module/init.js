/**
 * init.js
 * @author dimabresky
 * @copyright (c) 2017, travelsoft 
 */

/**
 * @param {Object} Travelsoft
 * @returns {undefined}
 */
(function (Travelsoft) {

    "use strict";

    function __init(parameters) {

        var sropt = {};

        if (typeof parameters !== "object" || !parameters) {
            console.warn("Parameters not set");
            return;
        }

        if (typeof parameters.forms === "object" && parameters.forms) {

            Travelsoft.frames.render.forms.form(parameters.forms);

        }

        if (typeof parameters.searchResult === "object" && parameters.searchResult) {

            sropt = parameters.searchResult;
            Travelsoft.frames.render.searchResult(sropt);

        }
    }

    /**
     * Инициализация поиска тур. услуг
     * @param {Object} parameters {
     *      
     *          afterLoadingPage: false||true (default true)
     *          // для форм поиска
     *          forms: {
     *                  
     *              // типы форм
     *              types: [excursions, placements, sanatorium],
     *              
     *              // URL для переходов на страницы поиска результатов
     *              urls: [],
     *              
     *              // применить костомные стили
     *              // задавать в виде строки
     *              customCss: ""
     *              
     *          },
     *          
     *          searchResult: {
     *              
     *              // тип объектов поиска
     *              type: excursion || placement || sanatorium,
     *              
     *              // применить костомные стили
     *              // задавать в виде строки
     *              customCss: "",
     *              
     *              // количество на страницу
     *              numberPerPage: 10,
     *              
     *              // ID партнера в системе
     *              partner: "",
     *      
     *              // Подпись ID партнера
     *              partnerSignature: ""
     *          }
     *      
     * }
     * 
     * @returns {undefined}
     */
    Travelsoft.init = function (parameters) {

        if (typeof parameters.afterLoadingPage === "boolean" && !parameters.afterLoadingPage) {

            __init(parameters);
        } else {
            window.addEventListener("load", function () {
                __init(parameters)
            });
        }

    };

})(Travelsoft);
