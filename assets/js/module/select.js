/**
 * select.js
 * @author dimabresky
 * @copyright (c) 2017, travelsoft 
 */

/**
 * @param {Travelsoft} Travelsoft
 * @param {jQuery} $
 * @returns {undefined}
 */
(function (Travelsoft, $) {

    "use strict";

    Travelsoft.select = {

        init: function (options) {
            
            var event = new Event("change");
            
            var iframe = window.parent.document.getElementById(options.fid);

            var container = document.createElement("div");

            var row = document.createElement("div");

            var col = document.createElement("div");

            var form_group = document.createElement("div");

            var input = document.createElement("input");

            var ul = document.createElement("ul");
            
            container.id = "container";
            container.className = "container";

            row.className = "row";

            col.className = "col-md-12";

            form_group.className = "form-group";

            input.type = "text";
            input.id = "iframe-value";
            input.name = "iframe-value";
            input.className = "form-control";
            input.onkeydown = function () {

                var __this = this;

                setTimeout(function () {

                    var value = __this.value;

                    if (value) {

                        ul.innerHTML = (function () {

                            var regex = new RegExp(value, "i");

                            var filter = options.data.filter(function (el) {

                                return regex.test(el.text);
                            });

                            if (filter.length) {
                                return filter.map(function (el) {
                                    return `<li data-value="${el.value}">${el.text}</li>`;
                                }).join("");
                            }

                            return `<li id="no-match">no matches</li>`;

                        })();

                    } else {

                        ul.innerHTML = (function () {

                            return options.data.map(function (el) {
                                return `<li data-value="${el.value}">${el.text}</li>`;
                            }).join("");

                        })();

                    }

                }, 100);
            };

            ul.id = "iframe-values-list";
            ul.innerHTML = (function (data) {

                var html = ``;
                for (var i = 0; i < data.length; i++) {
                    html = `<li data-value="${data[i].value}">${data[i].text}</li>`;
                }

                return html;

            })(options.data);

            ul.onclick = function (e) {
                if (e.target.nodeName === 'LI') {
                        
                    iframe.style.display = "none";
                    options.el.value = e.target.dataset.value;
                    options.text_container.innerText = e.target.innerText;
                    options.el.dispatch(event);
                }
                
            };

            form_group.appendChild(input);
            form_group.appendChild(ul);
            col.appendChild(form_group);
            row.appendChild(col);
            container.appendChild(row);
            
        }

    };

})(Travelsoft, jQuery);