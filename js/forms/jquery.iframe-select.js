
/**
 * jQuery plugin for select list in frame
 * @param {jQuery} $
 * @author dimabresky
 */
(function ($) {
    
    "use strict";
    
    $.fn.iframeSelectList = function (options) {
        
        options = $.extend({
            // def options
            dx: 0,
            dy: 0
        }, options);
        
        var __execute = function () {
           
           var $this = $(this);
           
           var width = $this.outerWidth();
           
           var height = $this.outerHeight();
           
           var offset_top = $this.offset().top;
           
           var offset_left = $this.offset().left;
           
           var $body = $(window.parent.document.body);
           
           var data = (function () {
               
               var data = [];
               
               $this.find("option").each(function () {
                   
                   data.push({value: $(this).val(), text: $(this).text()});
                   
               });
               
               return data;
               
           })();
           
           
           var tpl = ``;
        };
        
        return this.each(__execute);
        
    };
    
})(jQuery);