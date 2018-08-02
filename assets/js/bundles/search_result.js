var Travelsoft=Travelsoft||{};(function(a){"use strict";a.SITE_ADDRESS="https://vetliva.ru",a.VIDEO_URL="https://www.youtube.com/embed/",a.REQUEST_URL=a.SITE_ADDRESS+"/travelsoft.pm",a.JS_URL=a.REQUEST_URL+"/assets/js",a.CSS_URL=a.REQUEST_URL+"/assets/css"})(Travelsoft);(function(a){"use strict";a.utils={callbacks:{},makeid:function(){for(var t="",n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",s=0;5>s;s++)t+=n.charAt(Math.floor(Math.random()*n.length));return t},sendRequest:function(t,n,s){function d(){o||(delete a.utils.callbacks[l],console.warn("Query error "+c))}var o=!1,l="cb"+(Math.random()+"").slice(-6),c=a.REQUEST_URL+"/?",u=n,f;u.push("callback=Travelsoft.utils.callbacks."+l),u.push("method="+t),c+=u.join("&"),a.utils.callbacks[l]=function(h){o=!0,delete a.utils.callbacks[l],s(h)},f=document.createElement("script"),f.type="text/javascript",f.onload=d,f.onerror=d,f.src=c,document.body.appendChild(f)},screen:function(t){var n="";return"string"==typeof t&&(n=t.replace(/&/g,"&amp;"),n=t.replace(/</g,"&lt;"),n=t.replace(/"/g,"&quot;"),n=t.replace(/>/g,"&gt;"),n=t.replace(/'/g,"&#039;"),n=t.replace(/script/g,""),n=t.replace(/onclick/g,""),n=t.replace(/onchange/g,""),n=t.replace(/onkeydown/g,""),n=t.replace(/onkeypress/g,""),n=t.replace(/onmouseout/g,""),n=t.replace(/onmouseover/g,"")),n},HWatcher:{__prev:null,__id:null,__parent:null,watch:function(t){var n=this;n.unwatch(t),n.__id=setInterval(function(){n.__prev!==t.scrollHeight&&(n.__parent&&(n.__parent.style.height=t.scrollHeight+10+"px"),n.__prev=t.scrollHeight)},100)},unwatch:function(t){this.__id&&(clearInterval(this.__id),this.__id=null,this.__prev=null,t.style.height=0)}}}})(Travelsoft);(function(a,t,n){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?module.exports=a(require("jquery")):a(t||n)})(function(a){"use strict";var t=function(l,c,u){var f={invalid:[],getCaret:function(){try{var E,S=0,C=l.get(0),b=document.selection,D=C.selectionStart;return b&&-1===navigator.appVersion.indexOf("MSIE 10")?(E=b.createRange(),E.moveStart("character",-f.val().length),S=E.text.length):(D||"0"===D)&&(S=D),S}catch(R){}},setCaret:function(E){try{if(l.is(":focus")){var S,C=l.get(0);C.setSelectionRange?C.setSelectionRange(E,E):(S=C.createTextRange(),S.collapse(!0),S.moveEnd("character",E),S.moveStart("character",E),S.select())}}catch(b){}},events:function(){l.on("keydown.mask",function(E){l.data("mask-keycode",E.keyCode||E.which),l.data("mask-previus-value",l.val()),l.data("mask-previus-caret-pos",f.getCaret()),f.maskDigitPosMapOld=f.maskDigitPosMap}).on(a.jMaskGlobals.useInput?"input.mask":"keyup.mask",f.behaviour).on("paste.mask drop.mask",function(){setTimeout(function(){l.keydown().keyup()},100)}).on("change.mask",function(){l.data("changed",!0)}).on("blur.mask",function(){g===f.val()||l.data("changed")||l.trigger("change"),l.data("changed",!1)}).on("blur.mask",function(){g=f.val()}).on("focus.mask",function(E){!0===u.selectOnFocus&&a(E.target).select()}).on("focusout.mask",function(){u.clearIfNotMatch&&!_.test(f.val())&&f.val("")})},getRegexMask:function(){for(var S,C,b,D,R,M,E=[],y=0;y<c.length;y++)S=h.translation[c.charAt(y)],S?(C=S.pattern.toString().replace(/.{1}$|^.{1}/g,""),b=S.optional,D=S.recursive,D?(E.push(c.charAt(y)),R={digit:c.charAt(y),pattern:C}):E.push(b||D?C+"?":C)):E.push(c.charAt(y).replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&"));return M=E.join(""),R&&(M=M.replace(new RegExp("("+R.digit+"(.*"+R.digit+")?)"),"($1)?").replace(new RegExp(R.digit,"g"),R.pattern)),new RegExp(M)},destroyEvents:function(){l.off(["input","keydown","keyup","paste","drop","blur","focusout",""].join(".mask "))},val:function(E){var b,S=l.is("input"),C=S?"val":"text";return 0<arguments.length?(l[C]()!==E&&l[C](E),b=l):b=l[C](),b},calculateCaretPosition:function(){var E=l.data("mask-previus-value")||"",S=f.getMasked(),C=f.getCaret();if(E!==S){var b=l.data("mask-previus-caret-pos")||0,D=S.length,R=E.length,M=0,y=0,I=0,P=0,A=0;for(A=C;A<D&&!!f.maskDigitPosMap[A];A++)y++;for(A=C-1;0<=A&&!!f.maskDigitPosMap[A];A--)M++;for(A=C-1;0<=A;A--)f.maskDigitPosMap[A]&&I++;for(A=b-1;0<=A;A--)f.maskDigitPosMapOld[A]&&P++;if(C>R)C=10*D;else if(!(b>=C&&b!==R))C>b&&(C+=I-P,C+=y);else if(!f.maskDigitPosMapOld[C]){var T=C;C-=P-I,C-=M,f.maskDigitPosMap[C]&&(C=T)}}return C},behaviour:function(E){E=E||window.event,f.invalid=[];var S=l.data("mask-keycode");if(-1===a.inArray(S,h.byPassKeys)){var C=f.getMasked(),b=f.getCaret();return setTimeout(function(){f.setCaret(f.calculateCaretPosition())},a.jMaskGlobals.keyStrokeCompensation),f.val(C),f.setCaret(b),f.callbacks(E)}},getMasked:function(E,S){var x,j,C=[],b=void 0===S?f.val():S+"",D=0,R=c.length,M=0,y=b.length,I=1,P="push",A=-1,T=0,w=[];u.reverse?(P="unshift",I=-1,x=0,D=R-1,M=y-1,j=function(){return-1<D&&-1<M}):(x=R-1,j=function(){return D<R&&M<y});for(var O;j();){var U=c.charAt(D),G=b.charAt(M),L=h.translation[U];L?(G.match(L.pattern)?(C[P](G),L.recursive&&(-1==A?A=D:D===x&&D!=A&&(D=A-I),x===A&&(D-=I)),D+=I):G===O?(T--,O=void 0):L.optional?(D+=I,M-=I):L.fallback?(C[P](L.fallback),D+=I,M-=I):f.invalid.push({p:M,v:G,e:L.pattern}),M+=I):(!E&&C[P](U),G===U?(w.push(M),M+=I):(O=U,w.push(M+T),T++),D+=I)}var V=c.charAt(x);R!==y+1||h.translation[V]||C.push(V);var N=C.join("");return f.mapMaskdigitPositions(N,w,y),N},mapMaskdigitPositions:function(E,S,C){var b=u.reverse?E.length-C:0;f.maskDigitPosMap={};for(var D=0;D<S.length;D++)f.maskDigitPosMap[S[D]+b]=1},callbacks:function(E){var S=f.val(),C=S!==g,b=[S,E,l,u],D=function(R,M,y){"function"==typeof u[R]&&M&&u[R].apply(this,y)};D("onChange",!0==C,b),D("onKeyPress",!0==C,b),D("onComplete",S.length===c.length,b),D("onInvalid",0<f.invalid.length,[S,E,l,f.invalid,u])}};l=a(l);var _,h=this,g=f.val();c="function"==typeof c?c(f.val(),void 0,l,u):c,h.mask=c,h.options=u,h.remove=function(){var E=f.getCaret();return h.options.placeholder&&l.removeAttr("placeholder"),l.data("mask-maxlength")&&l.removeAttr("maxlength"),f.destroyEvents(),f.val(h.getCleanVal()),f.setCaret(E),l},h.getCleanVal=function(){return f.getMasked(!0)},h.getMaskedVal=function(E){return f.getMasked(!1,E)},h.init=function(E){if(E=E||!1,u=u||{},h.clearIfNotMatch=a.jMaskGlobals.clearIfNotMatch,h.byPassKeys=a.jMaskGlobals.byPassKeys,h.translation=a.extend({},a.jMaskGlobals.translation,u.translation),h=a.extend(!0,{},h,u),_=f.getRegexMask(),E)f.events(),f.val(f.getMasked());else{u.placeholder&&l.attr("placeholder",u.placeholder),l.data("mask")&&l.attr("autocomplete","off");for(var b,S=0,C=!0;S<c.length;S++)if(b=h.translation[c.charAt(S)],b&&b.recursive){C=!1;break}C&&l.attr("maxlength",c.length).data("mask-maxlength",!0),f.destroyEvents(),f.events();var D=f.getCaret();f.val(f.getMasked()),f.setCaret(D)}},h.init(!l.is("input"))};a.maskWatchers={};var n=function(){var l=a(this),c={},u="data-mask-",f=l.attr("data-mask");if(l.attr(u+"reverse")&&(c.reverse=!0),l.attr(u+"clearifnotmatch")&&(c.clearIfNotMatch=!0),"true"===l.attr(u+"selectonfocus")&&(c.selectOnFocus=!0),s(l,f,c))return l.data("mask",new t(this,f,c))},s=function(l,c,u){u=u||{};var f=a(l).data("mask"),h=JSON.stringify,g=a(l).val()||a(l).text();try{return"function"==typeof c&&(c=c(g)),"object"!=typeof f||h(f.options)!==h(u)||f.mask!==c}catch(_){}};a.fn.mask=function(l,c){c=c||{};var u=this.selector,f=a.jMaskGlobals,h=f.watchInterval,g=c.watchInputs||f.watchInputs,_=function(){if(s(this,l,c))return a(this).data("mask",new t(this,l,c))};return a(this).each(_),u&&""!==u&&g&&(clearInterval(a.maskWatchers[u]),a.maskWatchers[u]=setInterval(function(){a(document).find(u).each(_)},h)),this},a.fn.masked=function(l){return this.data("mask").getMaskedVal(l)},a.fn.unmask=function(){return clearInterval(a.maskWatchers[this.selector]),delete a.maskWatchers[this.selector],this.each(function(){var l=a(this).data("mask");l&&l.remove().removeData("mask")})},a.fn.cleanVal=function(){return this.data("mask").getCleanVal()},a.applyDataMask=function(l){l=l||a.jMaskGlobals.maskElements;var c=l instanceof a?l:a(l);c.filter(a.jMaskGlobals.dataMaskAttr).each(n)};var o={maskElements:"input,td,span,div",dataMaskAttr:"*[data-mask]",dataMask:!0,watchInterval:300,watchInputs:!0,keyStrokeCompensation:10,useInput:!/Chrome\/[2-4][0-9]|SamsungBrowser/.test(window.navigator.userAgent)&&function(l){var u,c=document.createElement("div");return l="on"+l,u=l in c,u||(c.setAttribute(l,"return;"),u="function"==typeof c[l]),c=null,u}("input"),watchDataMask:!1,byPassKeys:[9,16,17,18,36,37,38,39,40,91],translation:{0:{pattern:/\d/},9:{pattern:/\d/,optional:!0},"#":{pattern:/\d/,recursive:!0},A:{pattern:/[a-zA-Z0-9]/},S:{pattern:/[a-zA-Z]/}}};a.jMaskGlobals=a.jMaskGlobals||{},o=a.jMaskGlobals=a.extend(!0,{},o,a.jMaskGlobals),o.dataMask&&a.applyDataMask(),setInterval(function(){a.jMaskGlobals.watchDataMask&&a.applyDataMask()},o.watchInterval)},window.jQuery,window.Zepto);(function(a,t,n,s){"use strict";function d(A,T,w){w=w||0,t(parent.document).find("html").animate({scrollTop:A.offset().top+T.offset().top-w},500)}function o(A){A.find(".rslides").responsiveSlides({auto:!1,pager:!1,nav:!0,speed:500})}function l(A){var T=A.data("coords-data"),w=null,x=[];if(t.isArray(T))if(1===T.length)w=new s.Map(A.attr("id"),{center:[+T[0].lat,+T[0].lng],zoom:9,controls:["zoomControl","fullscreenControl"]}),w.geoObjects.add(new s.Placemark(w.getCenter(),{balloonContent:T[0].content}));else{w=new s.Map(A.attr("id"),{center:[0,0],zoom:8,controls:["zoomControl","fullscreenControl"]});for(var j=0;j<T.length;j++)x.push([T[j].lat,T[j].lng]);s.route(x,{mapStateAutoApply:!0}).then(function(O){var G,U=O.getWayPoints();w.geoObjects.add(O),U.options.set("preset","islands#blueStretchyIcon");for(var L=0;L<T.length;L++)G=U.get(L),G.properties.set("iconContent",T[L].title),G.options.set("hasBalloon",!1)})}}function c(A){A.css({opacity:0.4})}function u(A){A.css({opacity:1})}function f(A,T,w,x){var j=a.utils.makeid();return`<div class="panel panel-default">
                        <div class="panel-heading">
                          <h4 class="panel-title">
                                  <a class="panel-collapser" data-toggle="collapse" data-parent="#${w}" href="#collapse-${j}">
                                    ${A}
                                  </a>
                            </h4>
                        </div>
                        <div id="collapse-${j}" class="panel-collapse collapse ${x}">
                          <div class="panel-body">
                              ${T}
                          </div>
                        </div>
                    </div>`}function h(A,T){document.body.innerHTML=A,a.utils.HWatcher.__parent=window.parent.document.getElementById("search-result_"+T),a.utils.HWatcher.watch(document.getElementById("container"))}function g(A){var T=a.utils.screen;P[A.pager.page]=`<div class="container" id="container">
                                                        ${function(w){return w.length?w.map(function(x){return`<div class="row thumbnail mrtb-10">
                                                                                    <div class="row-flex row-flex-wrap">
                                                                                        <div class="col-lg-4 col-md-4 col-sm-4 col-xs-12">
                                                                                        ${function(j){return j?`<img class="main-img" src="${T(a.SITE_ADDRESS+x.imgSrc)}">`:``}(x.imgSrc)}
                                                                                        </div>
                                                                                        <div class="col-lg-8 col-md-8 col-sm-8 col-xs-12 flex-col">
                                                                                            <div class="name">${T(x.name)}</div>
                                                                                            <div class="stars-block">
                                                                                                ${function(j){for(var O=``,U=1;U<=j;U++)O+=`<span class="glyphicon glyphicon-star" aria-hidden="true"></span>`;return O}(x.stars)}
                                                                                            </div>
                                                                                            <ul>
                                                                                         ${function(j){var O="";return j.address&&(O+=`<li><span class="glyphicon glyphicon-map-marker" aria-hidden="true"></span> ${T(j.address)}</li>`),j.route&&(O+=`<li><span class="glyphicon glyphicon-map-marker" aria-hidden="true"></span> ${T(j.route)}</li>`),j.days&&(O+=`<li><span class="glyphicon glyphicon-time" aria-hidden="true"></span> Количество дней: ${T(j.days)}</li>`),j.duration_time&&(O+=`<li><span class="glyphicon glyphicon-time" aria-hidden="true"></span> Количество часов: ${T(j.duration_time)}</li>`),x.text.distance.minsk&&(O+=`<li><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Расстояние до Минска: ${T(x.text.distance.minsk)} км</li>`),x.text.distance.center&&(O+=`<li><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Расстояние до цента: ${T(x.text.distance.center)} км</li>`),x.text.distance.airport&&(O+=`<li><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Расстояние до аэропорта: ${T(x.text.distance.airport)} км</li>`),O}(x.text)}
                                                                                                
                                                                                            </ul>
                                                                                            <div class="show-offers-block flex-grow">
                                                                                                <div class="details-links">
                                                                                                    <a data-request='${JSON.stringify(x.request)}' class="detail-link __desc" href="#">Описание</a>
                                                                                                    <a data-request='${JSON.stringify(x.request)}' class="detail-link __on-map" href="#">На карте</a>
                                                                                                    <a data-request='${JSON.stringify(x.request)}' class="detail-link __video" href="#">Видео</a>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="show-offers-block flex-grow">
                                                                                                    <button data-offers-request='${JSON.stringify(x.request)}' class="btn btn-primary show-offers" type="button"><span class="price-from">${x.text.price}</span> <span class="chevron glyphicon glyphicon-chevron-down" aria-hidden="true"></button>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>`}).join(""):`<div class="row">
                                                                <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 not-found-text">По Вашему запросу ничего не найдено. Пожалуйста, измените параметры поиска или оставьте заявку.</div>
                                                                <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 callback-form">
                                                                <input type="hidden" name="search_item_id" value="${1===A.search_items_id.length?A.search_items_id[0]:0}">
                                                                    <div class="form-group">
                            <label for="full_name">ФИО<span class="star">*</span></label>
                            <span class="error-container"></span>
                            <input placeholder="Иван Иванович Иванов" name="full_name" value="" type="text" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="phone">Телефон</label>
                            <span class="error-container"></span>
                            <input placeholder="+375441111111" name="phone" type="tel" value="" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="email">Email<span class="star">*</span></label>
                            <span class="error-container"></span>
                            <input placeholder="example@gmail.com" name="email" type="email" value="" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="date">Дата<span class="star">*</span></label>
                            <span class="error-container"></span>
                            <input placeholder="__.__.____" name="date" type="text" value="" class="form-control">
                            
                        </div>
                        <div class="form-group">
                            <label for="comment">Текст заявки<span class="star">*</span></label>
                            <span class="error-container"></span>
                            <textarea name="comment" class="form-control"></textarea>
                        </div>
                        <div class="form-group text-right">
                            <button type="button" id="callback-sender-btn" class="btn btn-primary">Отправить</button>
                        </div>
                                                                </div>
                                                                                </div><img style="display: none;" src="" onerror="jQuery('.callback-form input[name=date]').mask('00.00.0000');">`}(A.items||[])}
                                                        <div class="row text-right">${function(w){return new n(function(x){for(var j=[],O=0;O<x;O++)j.push(O);return j}(w.records),w.numberPerPage).page(w.page).getHtml()}(A.pager)}
                                        </div>
                                                </div>`,h(P[A.pager.page],A.main_container)}function _(A){"string"==typeof P[A.page]?h(P[A.page],A.insertion_id):a.utils.sendRequest("GetSearchResultRenderData",[function(){var T=window.parent.location.search.replace("?","").split("&").filter(function(w){return 0<w.length&&0===w.indexOf("tpm_params")});return T.push("tpm_params[type]="+A.type),T.push("tpm_params[page]="+A.page),T.push("tpm_params[citizen_price]="+A.citizen_price),T.push("tpm_params[number_per_page]="+A.numberPerPage),T.push("tpm_params[agent]="+A.agent),T.push("tpm_params[hash]="+A.hash),T.join("&")}()],function(T){return function(w){var x=w;return x.isError?(console.warn(w.errorMessage),void g({items:[],pager:{page:1,numberPerPage:0},main_container:T.insertion_id})):void(x.data.pager.numberPerPage=T.numberPerPage,x.data.main_container=T.insertion_id,x.data.search_items_id=function(){var j=window.parent.location.search.replace("?","").split("&").filter(function(L){return 0<L.length&&0===L.indexOf("tpm_params")}),O=[],U=[],G=0;if(0<j.length)for(G=0;G<j.length;++G)/tpm_params(.*)id(.*)/.test(j[G])&&(U=j[G].split("="),O.push(U[1]));return O}(),g(x.data))}}(A))}function E(A,T,w){var x=t(".pagination li.active a").data("page"),j=a.utils.screen;T.find(".info-block").remove(),T.append(`
            <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 collapsing-block offers hidden">
                <div style="width: 100%">
                    ${function(O){for(var U="",G=0;G<O.length;G++)U+=`<div class="row offer-row mrtb-10">
                                <div class="col-lg-3 col-md-3 col-sm-3 col-xs-6">
                                    ${O[G].date?`<b>${j(O[G].date)}</b>`:O[G].img_src?`<img class="main-img" src="${a.SITE_ADDRESS+"/"+j(O[G].img_src)}">`:``}</b>
                                </div>
                                <div class="col-lg-3 col-md-3 col-sm-3 col-xs-6">
                                    ${O[G].service?`<div class="name">${j(O[G].service)}</div><h5>${j(O[G].rate)}</h5>`:`<div class="name">${j(O[G].service)}</div>`}
                                </div>
                                <div class="col-lg-3 col-md-3 col-sm-3 col-xs-12 text-right">
                                    <b>${j(O[G].price)}</b>${O[G].citizenprice?`<br><small>${O[G].citizenprice}</small>`:``}
                                </div>
                                <div class="col-lg-3 col-md-3 col-sm-3 col-xs-12 text-right">
                                    <button data-add2cart="${j(O[G].add2cart)}" class="btn btn-primary booking" type="button">Бронировать</button>
                                    ${0<O[G].rate_desc.length?`<div class="about-rate"><a role="button" href="javascript:void(0)">О тарифе</a></div>`:``}
                                    ${"object"!=typeof O[G].room_desc||t.isArray(O[G].room_desc)?``:`<div class="about-room"><a role="button" href="javascript:void(0)">О номере</a></div>`}
                                </div>
                            ${0<O[G].rate_desc.length?`<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 rate-desc hidden">
                                        <div class="rate-desc-text">${j(O[G].rate_desc)}</div>
                                </div>`:``}
                                
                                ${"object"!=typeof O[G].room_desc||t.isArray(O[G].room_desc)?``:`<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 room-desc hidden">
                                            ${0<O[G].room_desc.SQUARE?`<div class="square"><b>Площадь</b>: ${j(O[G].room_desc.SQUARE)}</div>`:``}
                                            ${0<O[G].room_desc.BAD1?`<div class="bad_1"><b>Количество одноместных кроватей</b>: ${j(O[G].room_desc.BAD1)}</div>`:``}
                                            ${0<O[G].room_desc.BAD2?`<div class="bad_2"><b>Количество двухместных кроватей</b>: ${j(O[G].room_desc.BAD2)}</div>`:``}
                                            ${0<O[G].room_desc.SOFA_BAD?`<div class="sofa-bad"><b>Количество диван-кроватей</b>: ${j(O[G].room_desc.SOFA_BAD)}</div>`:``}
                                            ${0<O[G].room_desc.PLACES_MAIN?`<div class="main-places"><b>Количество основных мест</b>: ${j(O[G].room_desc.PLACES_MAIN)}</div>`:``}
                                            ${0<O[G].room_desc.PLACES_ADD?`<div class="add-places"><b>Количество дополнительных мест</b>: ${j(O[G].room_desc.PLACES_ADD)}</div>`:``}
                                            ${0<O[G].room_desc.PEOPLE?`<div class="people"><b>Максимальное количество человек</b>: ${j(O[G].room_desc.PEOPLE)}</div>`:``}
                                            ${typeof t.isArray(O[G].room_desc.SERVICES)&&0<O[G].room_desc.SERVICES.length?`<div class="people"><b>Услуги</b>: ${O[G].room_desc.SERVICES.join(", ")}</div>`:``}
                                            ${0<O[G].room_desc.DESC?`<div class="room-desc-text">${j(O[G].room_desc.DESC)}</div>`:``}
                                </div>`}
                                
                            </div>`;return U}(A)}
                </div>
            </div>
        `),T.find(".offers").removeClass("hidden"),"function"==typeof w&&w()}function S(A,T,w){T.find(".info-block").remove(),T.append(`
            <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 collapsing-block info-block hidden">
                <div style="width: 100%">${A.message}</div>
        </div>`),T.find(".info-block").removeClass("hidden"),"function"==typeof w&&w()}function C(A){A.find("span.chevron").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up")}function b(){t(".show-offers").each(function(){D(t(this))})}function D(A){A.find("span.chevron").removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down")}function R(A,T,w){var x=null===A?null:A.hasClass("hidden");t(".collapsing-block").addClass("hidden"),null===x?"function"==typeof T&&T():x?(A&&A.removeClass("hidden"),"function"==typeof T&&T()):(A&&A.addClass("hidden"),"function"==typeof w&&w())}function M(A,T,w){var x=t(".pagination li.active a").data("page"),j=a.utils.makeid(),O="accordion-"+a.utils.makeid(),U="in";T.find(".info-block").remove(),T.append(`
            <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 collapsing-block detail-desc-block hidden">
                
                    ${function(G){var L=``;return t.isArray(G.pictures.big)&&(L+=`<section id="${j}" class="detail-slider">
                                    <ul class="rslides">
                                        ${function(V){L="";for(var N=0;N<V.length;N++)L+=`<li><img src="${a.SITE_ADDRESS+V[N]}"></li>`;return L}(G.pictures.big)}
                                    </ul>
                            </section>`),L+=`<div class="panel-group" id="${O}">`,G.desc&&(L+=f("\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435",G.desc,O,U),U=""),G.program&&(L+=f("\u041F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 \u0442\u0443\u0440\u0430",G.program,O,U),U=""),G.profiles&&(L+=f("\u041F\u0440\u043E\u0444\u0438\u043B\u044C",function(V){var N=`<div class="featured-service">`;for(var q in V.TYPE_GROUP)N+=`<div class="list-service-section">${V.TYPE_SECTIONS?`${V.TYPE_SECTIONS[q].PICTURE.SRC?`<div class="icon-service" style="float:left; top:2px"><img src="${a.SITE_ADDRESS+V.TYPE_SECTIONS[q].PICTURE.SRC}"></div>`:``}
                                                                            <h4>${V.TYPE_SECTIONS[q].TITLE}</h4>`:``}
                                                                            
                                                                        </div>
                                                                        <ul class="service-accmd">
                                                                            ${function(B){var W="";for(var Q in B)W+=`<li><div><img src="${a.SITE_ADDRESS}/local/templates/travelsoft/images/icon-check.png" alt=""></div>${B[Q].TITLE} ${B[Q].PAID?`<a data-content="За дополнительную плату">(<i class="fa fa-dollar"></i>)</a>`:``}</li>`;return W}(V.TYPE_GROUP[q])}
                                                                        </ul>`;return N+="</div>",N}(G.profiles),O,U),U=""),G.services&&(L+=f("\u0423\u0441\u043B\u0443\u0433\u0438",function(V){var N=`<div class="featured-service">`;for(var q in V.SERVICES_GROUP)N+=`<div class="list-service-section">
                                                                            ${V.SERVICES_SECTIONS[q].PICTURE.SRC?`<div class="icon-service" style="float:left; top:2px"><img src="${a.SITE_ADDRESS+V.SERVICES_SECTIONS[q].PICTURE.SRC}"></div>`:``}
                                                                            <h4>${V.SERVICES_SECTIONS[q].TITLE}</h4>
                                                                        </div>
                                                                        <ul class="service-accmd">
                                                                            ${function(B){var W="";for(var Q in B)W+=`<li><div><img src="${a.SITE_ADDRESS}/local/templates/travelsoft/images/icon-check.png" alt=""></div>${B[Q].TITLE}</li>`;return W}(V.SERVICES_GROUP[q])}
                                                                        </ul>`;return N+="</div>",N}(G.services),O,U),U=""),G.medecine_services&&(L+=f("\u041C\u0435\u0434\u0438\u0446\u0438\u043D\u0441\u043A\u0438\u0435 \u0443\u0441\u043B\u0443\u0433\u0438",function(V){var N=`<div class="featured-service">`;for(var q in V.MED_SERVICES_GROUP)N+=`<div class="list-service-section">
                                                                            <h4>${V.MED_SERVICES_SECTIONS[q].TITLE}</h4>
                                                                        </div>
                                                                        <ul class="service-accmd">
                                                                            ${function(B){var W="";for(var Q in B)W+=`<li><div><img src="${a.SITE_ADDRESS}/local/templates/travelsoft/images/icon-check.png" alt=""></div>${B[Q].TITLE} ${B[Q].PAID?`<a data-content="За дополнительную плату">(<i class="fa fa-dollar"></i>)</a>`:``}</li>`;return W}(V.MED_SERVICES_GROUP[q])}
                                                                        </ul>`;return N+="</div>",N}(G.medecine_services),O,U),U=""),G.children_services&&(L+=f("\u0423\u0441\u043B\u0443\u0433\u0438 \u0434\u043B\u044F \u0434\u0435\u0442\u0435\u0439",G.children_services,O,U),U=""),G.food&&(L+=f("\u041F\u0438\u0442\u0430\u043D\u0438\u0435",G.food,O,U),U=""),G.rooms_base&&(L+=f("\u041D\u043E\u043C\u0435\u0440\u043D\u0430\u044F \u0431\u0430\u0437\u0430",G.rooms_base,O,U),U=""),G.addinfo&&(L+=f("\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F",G.addinfo,O,U),U=""),L+=`</div>`,L}(A)}
                
            </div>
        `),T.find(".detail-desc-block").removeClass("hidden"),"function"==typeof w&&w(),o(t("#"+j))}function y(A,T,w){var x=t(".pagination li.active a").data("page"),j="map-"+a.utils.makeid();T.find(".info-block").remove(),T.append(`<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 collapsing-block show-on-map-block hidden">
                                        <div style="width: 100%">
                                            <div data-coords-data='${JSON.stringify(A)}' id="${j}"></div>
                                        </div>
                                    </div>`),T.find(".show-on-map-block").removeClass("hidden"),"function"==typeof w&&w(),l(t(`#${j}`))}function I(A,T,w){t(".pagination li.active a").data("page");T.find(".info-block").remove(),T.append(`<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 collapsing-block video-block hidden">
                                        <div style="width: 100%">
                                            <iframe class="video-frame" height="100%" width="100%" style="border: none;" src="${a.VIDEO_URL+A.code}" allowfullscreen=""></iframe>
                                        </div>
                                    </div>`),T.find(".video-block").removeClass("hidden"),"function"==typeof w&&w()}var P={};a.searchResult={init:function(A){var T=A;_(T),t(document).on("click",".show-offers",function(w){var x=t(this),j=x.closest(".thumbnail"),O=j.find(".offers");O.length?R(O,function(){C(x)},function(){D(x)}):(R(null,function(){b()}),C(x),c(x),S({message:"\u0418\u0434\u0435\u0442 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u0439. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u043E\u0434\u043E\u0436\u0434\u0438\u0442\u0435..."},j),a.utils.sendRequest("GetOffersRenderData",[x.data("offers-request").join("&")],function(U){return function(G){return G.isError?(console.warn(G.errorMessage),void S({message:"\u041F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u044F \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044E\u0442."},U,function(){u(x)})):void E(G.data,U,function(){u(x)})}}(j))),w.preventDefault()}),t(document).on("click",".about-rate",function(w){t(this).closest(".offer-row").find(".rate-desc").toggleClass("hidden"),w.preventDefault()}),t(document).on("click",".about-room",function(w){t(this).closest(".offer-row").find(".room-desc").toggleClass("hidden"),w.preventDefault()}),t(document).on("click",".detail-link.__desc",function(w){var x=t(this),j=x.closest(".thumbnail"),O=j.find(".detail-desc-block");O.length?R(O,function(){b()},function(){b()}):(R(null,function(){b()},function(){b()}),c(x),S({message:"\u0418\u0434\u0435\u0442 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u0438. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u043E\u0434\u043E\u0436\u0434\u0438\u0442\u0435..."},j),a.utils.sendRequest("GetDetailDescriptionRenderData",[x.data("request").join("&")],function(U){return function(G){return G.isError?(console.warn(G.errorMessage),void S({message:"\u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442."},U,function(){u(x)})):void M(G.data,U,function(){u(x)})}}(j))),w.preventDefault()}),t(document).on("click",".detail-link.__on-map",function(w){var x=t(this),j=x.closest(".thumbnail"),O=j.find(".show-on-map-block");O.length?R(O,function(){b()},function(){b()}):(R(null,function(){b()},function(){b()}),c(x),S({message:"\u0418\u0434\u0435\u0442 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043A\u0430\u0440\u0442\u044B. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u043E\u0434\u043E\u0436\u0434\u0438\u0442\u0435..."},j),a.utils.sendRequest("GetDetailMapRenderData",[x.data("request").join("&")],function(U){return function(G){return G.isError?(console.warn(G.errorMessage),void S({message:"\u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442."},U,function(){u(x)})):void y(G.data,U,function(){u(x)})}}(j))),w.preventDefault()}),t(document).on("click",".detail-link.__video",function(w){var x=t(this),j=x.closest(".thumbnail"),O=j.find(".video-block");O.length?R(O,function(){b()},function(){b()}):(R(null,function(){b()},function(){b()}),c(x),S({message:"\u0418\u0434\u0435\u0442 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0432\u0438\u0434\u0435\u043E. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u043E\u0434\u043E\u0436\u0434\u0438\u0442\u0435..."},j),a.utils.sendRequest("GetDetailVideoRenderData",[x.data("request").join("&")],function(U){return function(G){return G.isError?(console.warn(G.errorMessage),void S({message:"\u0412\u0438\u0434\u0435\u043E \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442."},U,function(){u(x)})):G.data.code?void I(G.data,U,function(){u(x)}):void S({message:"\u0412\u0438\u0434\u0435\u043E \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442."},U,function(){u(x)})}}(j))),w.preventDefault()}),t(document).on("click",".pagination a",function(w){w.preventDefault(),t(this).parent().hasClass("active")||(T.page=t(this).data("page"),_(T))}),t(document).on("click",".booking",function(w){var x=t(this).data("add2cart");w.preventDefault(),x?window.parent.open(a.REQUEST_URL+"/?method=Booking&tpm_params[add2cart]="+x):alert("Some error. Please, try later.")}),t(document).on("click",".panel-collapser",function(){d(t(this),t(parent.document).find("#"+A.insertion_id),100)}),t(document).on("click","#callback-sender-btn",function(){var w=t(this),x=w.closest(".callback-form"),j={full_name:x.find("input[name='full_name']").val(),phone:x.find("input[name='phone']").val(),email:x.find("input[name='email']").val(),date:x.find("input[name='date']").val(),comment:x.find("textarea[name='comment']").val(),agent_id:A.agent,search_item_id:x.find("input[name='search_item_id']").val()},O=!1;for(var U in x.find(".error-container").each(function(){var G=t(this);G.removeClass("active"),G.html("")}),j)"full_name"===U?2>=j[U].length&&(O=!0,x.find("input[name='full_name']").prev(".error-container").addClass("active").text(`Укажите ФИО`)):"comment"===U?2>=j[U].length&&(O=!0,x.find("textarea[name='comment']").prev(".error-container").addClass("active").text(`Укажите текст заявки`)):"phone"===U?0<j[U].length&&!/^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/gm.test(j[U])&&(O=!0,x.find("input[name='phone']").prev(".error-container").addClass("active").text(`Укажите телефон в международном формате`)):"email"===U?/^[-._a-z0-9]+@(?:[a-z0-9][-a-z0-9]+\.)+[a-z]{2,6}$/.test(j[U])||(O=!0,x.find("input[name='email']").prev(".error-container").addClass("active").text(`Укажите корректный email`)):"date"===U?j[U].length||(O=!0,x.find("input[name='date']").prev(".error-container").addClass("active").text(`Укажите дату`)):void 0;O?d(t(".callback-form .error-container.active").first(),x,-200):(w.prop("disabeled",!0).css({opacity:.5}),a.utils.sendRequest("SendCallbackForm",[t.param({tpm_params:j})],function(G,L){return function(V){return G.parent().find(".not-found-text").remove(),G.html(""),L.remove(),d(G,G,-200),V.isError?void G.html(`<span class="error-container">Произошла ошибка при попытке отправить заявку. Пожалуйста, попробуйте повторить поиск через 5 минут.</span>`):V.data.isOk?void G.html(`<span class="message-ok">Спасибо! Ваша заявка принята. Втечение 15 минут наши менеджеры свяжутся с Вами.</span>`):void 0}}(x,w)))})}}})(Travelsoft,jQuery,PageNavigator,ymaps);
