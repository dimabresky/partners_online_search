/**
 * code generator
 *
 * @author dimabresky
 * @copyright 2017, travelsoft
 */

var Travelsoft = Travelsoft || {};

/**
 * @param {Travelsoft} Travelsoft
 * @returns {undefined}
 */
(function (Travelsoft) {

    function __hide() {

        var targets = document.querySelectorAll(".toggle-area");

        for (var i = 0; i < targets.length; i++) {
            targets[i].style.display = "none";
        }
    }

    /**
     * @param {String} targetid
     * @returns {undefined}
     */
    function __show(targetid) {

        var target = document.getElementById(targetid);

        if (target) {

            target.style.display = "block";
        }
    }

    /**
     * @returns {undefined}
     */
    Travelsoft.CodeGenerator = function () {

        var toggles = document.querySelectorAll(".toggle");
        
        for (var i = 0; i < toggles.length; i++) {

            toggles[i].onclick = function () {

                var targets = this.dataset.target;
                document.getElementById("code-area").value = '';
                __hide();
                
                if (targets) {
                    
                    targets = targets.split('~');
                    
                    for (var k = 0; k < targets.length; k++) {
                        __show(targets[k]);
                    }

                }
            };
        }
        
        document.getElementById("generator").onclick = function (e) {
            
            var render_type = document.querySelector("input[name='render_type']:checked").value;
            
            var els = [];
            
            var active_tab = null;
            
            var tab = null;
            
            var tabs = [];
            
            var urls = [];
            
            var search_result_object = "";
            
            var number_per_page = 10;
            
            if (render_type === "forms") {
                
                els = document.querySelectorAll("input[name='tabs']:checked");
                for (var i = 0; i < els.length; i++) {
                    tab = els[i].value;
                    urls.push(`"${document.querySelector(`input[name="${tab}_url"]`).value}"`);
                    tabs.push(`"${tab}"`);
                }
                
                if (tabs.length) {
                    
                    tab = document.querySelector(`input[name="active_tab"]:checked`);
                    
                    if (tab) {
                        active_tab = `"${tab.value}"`;
                    }
                    
                    if (!active_tab) {
                        active_tab = tabs[0];
                    }
                    
                    document.getElementById("code-area").value = `
                        <div id="search-forms-iframe-block"><span>Идет загрузка формы поиска...</span></div>
                        <script src="https://vetliva.ru/travelsoft.pm/assets/js/bundles/init.js"></script>
                        <script>
                            Travelsoft.init({
                                    forms: {
                                        types: [${tabs.join(",")}],
                                        active: ${active_tab},
                                        url: [${urls.join(",")}],
                                        selectIframeCss: "",
                                        datepickerIframeCss: "",
                                        childrenIframeCss: "",
                                        mainIframeCss: ""
                                    }
                            });
                        </script>
                    `;
                    
                } else {
                    
                    alert("Укажите хотябы один тип формы для генерации кода");
                }
                
                
            } else if (render_type === "search_result") {
                
                els = document.querySelector("input[name='result']:checked");
                
                if (els) {
                    
                    search_result_object = els.value;
                    
                    number_per_page = document.querySelector(`select[name='${search_result_object}_number_per_page']`).value;
                    
                    document.getElementById("code-area").value = `
                    <div id="search-result-iframe-block"><span>Идет загрузка результатов поиска...</span></div>
                    <script src="https://vetliva.ru/travelsoft.pm/assets/js/bundles/init.js"></script>
                    <script>
                        Travelsoft.init({
                            searchResult: {
                                type: "${search_result_object}",
                                numberPerPage: ${number_per_page},
                                agent: "${document.querySelector("input[name='agent']").value}",
                                hash: "${document.querySelector("input[name='hash']").value}"
                            }
                        });
                    </script>`;
                } else {
                    alert("Выберите тип объектов для генерации результатов поиска");
                }
            } else {
                alert("Необходимо выбрать объект для генерации кода вставки");
            }
            
            e.preventDefault();
            
        };
        
    };

})(Travelsoft);

