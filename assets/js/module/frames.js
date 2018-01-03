/**
 * frames.js
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
     * Контейнер методов для отрисовки iframes
     * @type Object
     */
    Travelsoft.frames = {

        template: `<!DOCTYPE html>
                        <html>
                            <head>
                                <title>travelsoft partner module</title>
                                <meta charset="UTF-8">
                                {{stylesheets}}
                            </head>
                            <body>
                                {{content}}
                                {{scripts}}
                            </body>
                        </html>`,

        render: {

            /**
             * Детали формы поиска
             * @type Object
             */
            forms: {

                /**
                 * Отрисовка фрейма формы
                 * @param {Object} options
                 * @returns {Element}
                 */
                form: function (options) {

                    var iframe = __createFrame({
                        styles: {
                            width: "100%",
                            border: "none"
                        },
                        attributes: {
                            src: "about:blank",
                            id: "search-forms",
                            scrolling: "yes"
                        },
                        iframeContent: ``,
                        iframeStylesheets: (function () {

                            return [
                                '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">',
                                '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">'
                            ].join("") + [

                                Travelsoft.CSS_URL + "/select2.min.css",
                                Travelsoft.CSS_URL + "/daterangepicker.min.css",
                                Travelsoft.CSS_URL + "/forms/styles.css"

                            ].map(function (link) {
                                return `<link rel="stylesheet" href="${link}">`;
                            }).join("");

                        })(),

                        iframeScripts: (function () {

                            options.parent_iframe_id = "search-forms";

                            return [

                                Travelsoft.JS_URL + "/jquery-3.2.1.min.js",
                                Travelsoft.JS_URL + "/bootstrap.min.js",
                                Travelsoft.JS_URL + "/select2.full.min.js",
                                Travelsoft.JS_URL + "/moment.min.js",
                                Travelsoft.JS_URL + "/moment_locales.min.js",
                                Travelsoft.JS_URL + "/daterangepicker.min.js",
                                Travelsoft.JS_URL + "/module/namespace.js?" + Math.random() * 100000,
                                Travelsoft.JS_URL + "/module/const.js?" + Math.random() * 100000,
                                Travelsoft.JS_URL + "/module/utils.js?" + Math.random() * 100000,
                                Travelsoft.JS_URL + "/module/frames.js?" + Math.random() * 100000,
                                Travelsoft.JS_URL + "/module/forms.js?" + Math.random() * 100000
                            ].map(function (src) {
                                return `<script type="text/javascript" src="${src}"></script>`;
                            }).join("") + `<script>Travelsoft.forms.init(${JSON.stringify(options)})</script>`;

                        })()
                    });

                    document.getElementById("search-forms-iframe-block").replaceChild(
                            iframe, document.getElementById("search-forms-iframe-block").querySelector("span"));

                    return iframe;
                },

                /**
                 * Отрисовка фрейма select
                 * @param {Object} options
                 * @returns {Element}
                 */
                select: function (options) {

                    var iframe = __createFrame({
                        styles: {
                            position: "absolute",
                            display: "none",
                            top: options.top + "px",
                            left: options.left + "px",
                            width: options.width + "px",
                            border: "1px solid #ccc",
                            "border-top": "none"
                        },
                        attributes: {
                            src: "about:blank",
                            id: options.iframe_id,
                            scrolling: "yes"
                        },
                        iframeContent: ``,
                        iframeStylesheets: (function () {

                            return [
                                '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">',
                                '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">'
                            ].join("") + [

                                Travelsoft.CSS_URL + "/forms/select.css"

                            ].map(function (link) {
                                return `<link rel="stylesheet" href="${link}">`;
                            }).join("");

                        })(),

                        iframeScripts: (function () {

                            return [

                                Travelsoft.JS_URL + "/module/namespace.js?" + Math.random() * 100000,
                                Travelsoft.JS_URL + "/module/const.js?" + Math.random() * 100000,
                                Travelsoft.JS_URL + "/module/utils.js?" + Math.random() * 100000,
                                Travelsoft.JS_URL + "/module/select.js?" + Math.random() * 100000
                            ].map(function (src) {
                                return `<script type="text/javascript" src="${src}"></script>`;
                            }).join("") + `<script>Travelsoft.select.init(${JSON.stringify({
                                iframe_id: options.iframe_id, // iframe id
                                data: options.data,
                                css: options.css
                            })})</script>`;

                        })()
                    });

                    window.parent.document.body.appendChild(iframe);

                    return iframe;
                }

            },

            /**
             * Отрисовка результатов поиска
             * @param {Object} options
             * @returns {Element}
             */
            searchResult: function (options) {

                var opt = options;

                opt.page = 1;

                var iframe = __createFrame({
                    styles: {
                        width: "100%",
                        border: "none"
                    },
                    attributes: {
                        src: "about:blank",
                        id: "search-result",
                        scrolling: "no"
                    },
                    iframeContent: ``,
                    iframeStylesheets: (function () {

                        return [
                            '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">',
                            '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">'
                        ].join("") + [

                            Travelsoft.CSS_URL + "/search-result/styles.css?" + Math.random() * 100000

                        ].map(function (href) {
                            return `<link rel="stylesheet" href="${href}">`;
                        }).join("");

                    })(),

                    iframeScripts: (function () {

                        return [

                            Travelsoft.JS_URL + "/jquery-3.2.1.min.js",
                            Travelsoft.JS_URL + "/pagenavigator.min.js",
                            Travelsoft.JS_URL + "/module/namespace.js?" + Math.random() * 100000,
                            Travelsoft.JS_URL + "/module/const.js?" + Math.random() * 100000,
                            Travelsoft.JS_URL + "/module/utils.js?" + Math.random() * 100000,
                            Travelsoft.JS_URL + "/module/search_result.js?" + Math.random() * 100000
                        ].map(function (src) {
                            return `<script type="text/javascript" src="${src}"></script>`;
                        }).join("") + `<script>Travelsoft.searchResult.init(${JSON.stringify(opt)})</script>`;

                    })()
                });

                document.getElementById("search-result-iframe-block").replaceChild(
                        iframe, document.getElementById("search-result-iframe-block").querySelector("span"));

                return iframe;

            }
        }
    };

    /**
     * Возвращает созданный фрейм
     * @param {Object} options
     * @returns {Element}
     */
    function __createFrame(options) {

        var iframe = document.createElement("iframe");

        for (var property in options.styles) {
            iframe.style[property] = options.styles[property];
        }

        for (var attribute in options.attributes) {
            iframe[attribute] = options.attributes[attribute];
        }

        iframe.onload = function () {
            iframe.contentDocument.write(
                    Travelsoft.frames.template.replace("{{stylesheets}}", options.iframeStylesheets)
                    .replace("{{content}}", options.iframeContent)
                    .replace("{{scripts}}", options.iframeScripts));
        };

        return iframe;

    }
    ;

})(Travelsoft);
