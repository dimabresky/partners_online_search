/**
 * children.js
 * 
 * dependencies:
 *      namespace.js
 *      const.js
 *      utils.js
 * 
 * @author dimabresky
 * @copyright (c) 2017, travelsoft
 */

/**
 * @param {Travelsoft} Travelsoft
 * @returns {undefined}
 */
(function (Travelsoft) {

    "use strict";
    
    var __defAge = 8;
    
    /**
     * @returns {Element}
     */
    function __createContainer () {
        var container = document.createElement("div");
        container.id = "container";
        container.className = "container";
        return container;
    }
    
    /**
     * @param {String} id
     * @returns {Element}
     */
    function __createFormGroup (id) {
        
        var form_group = document.createElement("div");
        form_group.className = "form-group";
        if (id) {
            form_group.id = id;
        }
        
        return form_group;
    }
    
    /**
     * @param {Object} data
     * @returns {Element}
     */
    function __createSelect(data) {
        var select = document.createElement('select');
        select.className = "form-control";
        var options = ``;
        for (var i = 0; i < data.length; i++) {
            options += `<option ${data[i].selected ? 'selected=""' : ''}  value="${data[i].value}">${data[i].text}</option>`;
        }
        select.innerHTML = options;
        return select;
    }
    
    /**
     * @param {String} text
     * @returns {Element}
     */
    function __createLabel(text) {
        var label = document.createElement("label");
        label.innerText = text;
        return label;
    }
    
    /**
     * @returns {Element}
     */
    function __createRow () {
        var row = document.createElement("div");
        row.className = "row";
        return row;
    }
    
    /**
     * @returns {Element}
     */
    function __createCol () {
        var col = document.createElement("div");
        col.className = "col-md-12";
        return col;
    }

    function __createAgeBlock(parent, cnt, iframe) {

        var form_group = __createFormGroup("children-age");
        var label, select;
        form_group.style["margin-top"] = "10px";
        parent.appendChild(form_group);
        for (var i = 1; i <= cnt; i++) {
            label = __createLabel(`Возраст ребенка ${i}`);
            label.style["margin-top"] = "10px";
            select = __createSelect((function () {
                var data = [];
                for (var i = 0; i < 17; i++) {
                    data.push({selected: i === __defAge, value: i, text: i});
                }
                return data;
            })());
            
            select.className += " select-age";
            
            select.onchange = function () {
                
                var age = [];
                var selectAges = document.querySelectorAll(".select-age");
                for (var i = 0; i < selectAges.length; i++) {
                    age.push(selectAges[i].value);
                }
                
                iframe.dataset.age = age.join(";");
            };
            
            form_group.appendChild(label);
            form_group.appendChild(select);
        }
    }

    function __destroyAgeBlock() {

        var ageBlock = document.getElementById('children-age');
        if (ageBlock) {
            ageBlock.remove();
        }

    }

    Travelsoft.children = {

        init: function (options) {
            
            var data = options.data;
            var iframe = parent.document.getElementById(options.iframe_id);
            var container = __createContainer();
            var row = __createRow();
            var col = __createCol();
            var form_group = __createFormGroup();
            //var label = __createLabel("Сколько ?");
            var select = __createSelect(data);
            form_group.style["margin-top"] = "20px";
            //form_group.appendChild(label);
            form_group.appendChild(select);
            
            select.onchange = function () {

                __destroyAgeBlock();
                iframe.dataset.children = this.value;
                iframe.dataset.age = "";
                if (this.value > 0) {
                    __createAgeBlock(this.parentNode, this.value, iframe);
                    iframe.dataset.age = (function (cnt) {

                        var arr_age = [];
                        for (var i = 0; i < cnt; i++) {
                            arr_age.push(__defAge);
                        }
                        return arr_age.join(";");
                    })(this.value);
                }

            };

            col.appendChild(form_group);
            row.appendChild(col);
            container.appendChild(row);
            document.body.innerHTML = "";
            document.body.appendChild(container);
            Travelsoft.utils.HWatcher.__parent = window.parent.document.getElementById(options.iframe_id);
            Travelsoft.utils.HWatcher.watch(document.body);
        }

    };

})(Travelsoft);
