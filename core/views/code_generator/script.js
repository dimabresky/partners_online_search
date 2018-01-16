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
     * @param {Object} options
     * @returns {undefined}
     */
    Travelsoft.CodeGenerator = function (options) {

        var toggles = document.querySelectorAll(".toggle");

        for (var i = 0; i < toggles.length; i++) {

            toggles[i].onclick = function () {

                var targets = this.dataset.target;

                __hide();

                if (targets) {
                    
                    targets = targets.split('~');
                    console.log(targets);
                    for (var k = 0; k < targets.length; k++) {
                        __show(targets[k]);
                    }

                }
            };
        }

    };

})(Travelsoft);

