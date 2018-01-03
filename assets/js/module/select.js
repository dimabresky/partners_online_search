/**
 * select.js
 * @author dimabresky
 * @copyright (c) 2017, travelsoft 
 */

/**
 * @param {Travelsoft} Travelsoft
 * @returns {undefined}
 */
(function (Travelsoft) {

    "use strict";

    Travelsoft.select = {

        init: function (options) {
            
            var data = options.data;
            
            var iframe = parent.document.getElementById(options.iframe_id);

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
            input.placeholder = "Вводите название...";
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

                            var filter = data.filter(function (el) {

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

                            return data.map(function (el) {
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
                    html += `<li data-value="${data[i].value}">${data[i].text}</li>`;
                }

                return html;

            })(data);

            ul.onclick = function (e) {
                if (e.target.nodeName === 'LI') {
                        
                    iframe.style.display = "none";
                    iframe.dataset.value = e.target.dataset.value;
                    iframe.dataset.text = e.target.innerText;
                }
                
            };

            form_group.appendChild(input);
            form_group.appendChild(ul);
            col.appendChild(form_group);
            row.appendChild(col);
            container.appendChild(row);
            document.body.innerHTML = "";
            document.body.appendChild(container);
            
        }

    };

})(Travelsoft);