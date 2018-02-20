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
     * @param {Object} options
     * @returns {Element}
     */
    function __createPluginIframe(options) {
        var iframe = __createFrame(__commonIframesOptions(options));

        window.parent.document.body.appendChild(iframe);

        return iframe;
    }

    /**
     * @param {Object} options
     * @returns {Object}
     */
    function __commonIframesOptions(options) {

        return {
            styles: {
                position: "absolute",
                display: "none",
                top: (options.top + 6) + "px",
                left: options.left + "px",
                width: options.width + "px",
                height: options.height + "px",
                border: "1px solid #ccc",
                "box-sizing": "border-box",
                "z-index": 10,
                "padding-right": "1px"
            },
            attributes: {
                src: "about:blank",
                id: options.iframe_id,
                scrolling: options.scrolling ? "yes" : "no",
                className: "iframe-plugin"
            },
            iframeContent: ``,
            iframeStylesheets: (function () {

                return [
                    '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">',
                    '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">'
                ].join("") + [

                    Travelsoft.CSS_URL + `/forms/${options.plugin_name}.min.css?` + Math.random() * 100000

                ].map(function (link) {
                    return `<link rel="stylesheet" href="${link}">`;
                }).join("") + `<style>${Travelsoft.utils.screen(options.css)}</style>`;

            })(),

            iframeScripts: (function () {

                return [
                    
                    Travelsoft.JS_URL + `/bundles/${options.plugin_name}.js`
                ].map(function (src) {
                    return `<script type="text/javascript" src="${src}"></script>`;
                }).join("") + `<script>Travelsoft.${options.plugin_name}.init(${JSON.stringify({
                    iframe_id: options.iframe_id, // iframe id
                    data: options.data,
                    without: options.without
                })})</script>`;

            })()
        };

    }
    
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
                                Travelsoft.CSS_URL + "/forms/styles.min.css?" + Math.random() * 100000

                            ].map(function (link) {
                                return `<link rel="stylesheet" href="${link}">`;
                            }).join("") + `<style>${Travelsoft.utils.screen(options.mainIframeCss)}</style>`;

                        })(),

                        iframeScripts: (function () {

                            options.parent_iframe_id = "search-forms";

                            return [

                                Travelsoft.JS_URL + "/jquery-3.2.1.min.js",
                                Travelsoft.JS_URL + "/bootstrap.min.js",
                                Travelsoft.JS_URL + "/bundles/forms.js"
                            ].map(function (src) {
                                return `<script type="text/javascript" src="${src}"></script>`;
                            }).join("") + `<script>Travelsoft.forms.init(${JSON.stringify(options)})</script>`;

                        })()
                    });

                    document.getElementById(options.insertion_id).replaceChild(
                            iframe, document.getElementById(options.insertion_id).querySelector("span"));

                    return iframe;
                },

                /**
                 * Возвращает объект фрейма select (like autocomplete or select2)
                 * @param {Object} options
                 * @returns {Element}
                 */
                select: function (options) {

                    options.plugin_name = "select";

                    return __createPluginIframe(options);
                },

                /**
                 * Возвращает отбъект фрейма calendar
                 * @param {Object} options
                 * @returns {Element}
                 */
                children: function (options) {

                    options.plugin_name = "children";

                    return __createPluginIframe(options);
                },

                /**
                 * Возвращает отбъект фрейма datepicker
                 * @param {Object} options
                 * @returns {Element}
                 */
                datepicker: function (options) {

                    var iframe, __options;

                    options.plugin_name = "datepicker";

                    __options = __commonIframesOptions(options);
                    
                    delete(__options.styles.width);
                    
                    __options.styles["min-width"] = options.width + "px";
                    
                    __options.styles["max-width"] = "582px";
                    
                    __options.iframeStylesheets += `<link rel="stylesheet" href="${Travelsoft.CSS_URL + "/daterangepicker.min.css"}">` + __options.iframeStylesheets; 
                    __options.iframeScripts = (function (options) {

                        return [
                            Travelsoft.JS_URL + `/jquery-3.2.1.min.js`,
                            Travelsoft.JS_URL + `/moment.min.js`,
                            Travelsoft.JS_URL + `/moment_locales.min.js`,
                            Travelsoft.JS_URL + `/daterangepicker.min.js`,
                            Travelsoft.JS_URL + `/bundles/${options.plugin_name}.js`
                        ].map(function (src) {
                            return `<script type="text/javascript" src="${src}"></script>`;
                        }).join("") + `<script>Travelsoft.${options.plugin_name}.init(${JSON.stringify({
                            iframe_id: options.iframe_id, // iframe id
                            start_date: options.data.start_date,
                            end_date: options.data.end_date,
                            format: options.data.format,
                            date_separator: options.data.date_separator,
                            defValue: options.data.defValue
                        })})</script>`;

                    })(options);

                    iframe = __createFrame(__options);

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
                        border: "none",
                        "z-index": 10
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

                            Travelsoft.CSS_URL + "/owl.carousel.min.css",
                            Travelsoft.CSS_URL + "/search-result/styles.min.css"

                        ].map(function (href) {
                            return `<link rel="stylesheet" href="${href}">`;
                        }).join("") + `<style>${Travelsoft.utils.screen(options.mainIframeCss)}</style>`;

                    })(),

                    iframeScripts: (function () {

                        return [

                            "https://api-maps.yandex.ru/2.1/?lang=ru_RU",
                            Travelsoft.JS_URL + "/jquery-3.2.1.min.js",
                            Travelsoft.JS_URL + "/bootstrap.min.js",
                            Travelsoft.JS_URL + "/owl.carousel.min.js",
                            Travelsoft.JS_URL + "/pagenavigator.min.js",
                            Travelsoft.JS_URL + "/bundles/search_result.js"
                        ].map(function (src) {
                            return `<script type="text/javascript" src="${src}"></script>`;
                        }).join("") + `<script>Travelsoft.searchResult.init(${JSON.stringify(opt)})</script>`;

                    })()
                });

                document.getElementById(options.insertion_id).replaceChild(
                        iframe, document.getElementById(options.insertion_id).querySelector("span"));

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

})(Travelsoft);
