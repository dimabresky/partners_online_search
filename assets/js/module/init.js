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

    /**
     * Инициализация поиска тур. услуг
     * @param {Object} parameters {
     *      
     *      // формирование отображений
     *      display: {
     *          
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
     *              numberPerPage: 10
     *          }
     *      },
     *      
     *      // ID партнера в системе
     *      partner: "",
     *      
     *      // Подпись ID партнера
     *      partnerSignature: ""
     * }
     * 
     * @returns {undefined}
     */
    Travelsoft.init = function (parameters) {

        var sropt = {};

        window.addEventListener("load", function () {
            if (typeof parameters !== "object" || !parameters) {
                console.warn("Parameters not set");
                return;
            }

            if (typeof parameters.display !== "object" || !parameters.display) {
                console.warn("Parameters for display not set");
                return;
            }

            if (typeof parameters.display.forms === "object" && parameters.display.forms) {

                Travelsoft.frames.render.forms.form(parameters.display.forms);

            }

            if (typeof parameters.display.searchResult === "object" && parameters.display.searchResult) {

                sropt = parameters.display.searchResult;
                sropt.agent = parameters.agent;
                sropt.hash = parameters.hash;
                Travelsoft.frames.render.searchResult(sropt);

            }
        });


    };

})(Travelsoft);
