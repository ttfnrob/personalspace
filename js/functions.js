//General custom functions

$.fn.isBound = function(type, fn) {
    var data = this.data('events')[type];

    if (data === undefined || data.length === 0) {
        return false;
    }

    return (-1 !== $.inArray(fn, data));
};

function pad(n) {
    return (n < 10) ? ("0" + n) : n;
}

function getURLParam(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

function checkTimeVal() {
    if ($("input#time").val().split(":").length < 3) {
        $("input#time").val($("input#time").val()+":00");
    }
}

function preloadForm() {

    if (getURLParam('name')) { $("input#full_name").val(getURLParam('name')); }
    if (getURLParam('place')) { $("input#place_name").val(getURLParam('place')); }
    if (getURLParam('lat')) { $("input#latitude").val(getURLParam('lat')); }
    if (getURLParam('lon')) { $("input#longitude").val(getURLParam('lon')); }
    if (getURLParam('datetime')) { $("input#date").val(getURLParam('datetime').split(" ")[0]); }
    if (getURLParam('datetime')) { $("input#time").val( getURLParam('datetime').split(" ")[1]); }
    if (getURLParam('event')) { $("input#event_name").val(getURLParam('event')); }

}

function URLhandler(short_url) {
    // console.log(short_url);
    $("#pTitle").text("Your Personal Space is at "+short_url);
}

function makeURL() {
    
    checkTimeVal();
    var formData = "name=" + $("input#full_name").val()
                     + "&place=" + $("input#place_name").val() 
                     + "&lat=" + $("input#latitude").val() 
                     + "&lon=" + $("input#longitude").val()
                     + "&datetime=" + $("input#date").val() + " " + $("input#time").val()
                     + "&event=" + $("input#event_name").val()
                     + "&trigger=true";
    long_url = location.protocol + '//' + location.host + location.pathname+'?'+encodeURI(formData);
    // console.log(long_url);

    $.ajax({
        url: 'https://www.googleapis.com/urlshortener/v1/url',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: '{"longUrl": "'+long_url+'"}',
        success: function(response) {
            URLhandler(response.id);
        },
        error: function(response) {
            console.log("HTTP or goo.gl error.");
        }
     });
}

function closeAccordions() {
    $(".acc").slideUp();
}

function loadAccordion(accordion_id) {

    var clickHandler = function () {
        if($(this).is('#'+accordion_id+' .inactive-header')) {
            $('#'+accordion_id+' .active-header').toggleClass('active-header').toggleClass('inactive-header').next().slideToggle().toggleClass('open-content');
            $(this).toggleClass('active-header').toggleClass('inactive-header');
            $(this).next().slideToggle().toggleClass('open-content');
        } else {
            $(this).toggleClass('active-header').toggleClass('inactive-header');
            $(this).next().slideToggle().toggleClass('open-content');
        }
        return false;
    };

    $('#'+accordion_id+' .accordion-header').toggleClass('inactive-header');
    
    $('#'+accordion_id+' .accordion-header').unbind('click');
    $('#'+accordion_id+' .accordion-header').bind('click', clickHandler);
    
    return false;
}

function triggerForm() {
    // console.log("Triggering...");
    runForm();
}

//API calling functions
function findMatches(ra, decl, sep){
    $.ajax({
        type: 'POST',
        url: 'http://personal-space.herokuapp.com/api/match?ra='+ra+'&decl='+decl+'&sep='+sep,
        crossDomain: true,
        data: "",
        success: function(data, textStatus, jqXHR) {
            obj = jQuery.parseJSON(data);
            if (obj.result.length>1) {
                $("#match_count").show();
                $("#match_count").text(obj.result.length-1);
                $("#people").attr('title', (obj.result.length-1)+' matching spaces');
            }
            $("#match-accordion").empty();
            var i = 0;
            $.each(obj.result, function(k, v){                                 
                if ( !(v.name===$("input#full_name").val()) && !(v.event===$("input#event_name").val()) && !(v.location===$("input#place_name").val()) ) {
                    i+=1;
                    $("#match-accordion").append('<h2 class="accordion-header" id="'+i+'-match'+'">'+v.name+'</h2><div class="accordion-content"><p>'+v.event+', '+v.location+'. '+v.ra+' '+v.decl+'.</p></div>');
                    var circ = createMatchCircle(v.ra, v.decl, sep);
                    $("#"+i+'-match').hover(
                      function () {
                        wwt.addAnnotation(circ);
                      },
                      function () {
                        wwt.removeAnnotation(circ);
                      }
                    );
                }
            });
            loadAccordion('match-accordion');
        },
        error: function (responseData, theextStatus, errorThrown) {
            console.log('POST failed.');
        }
    });
}

function getDeepSky(ra, decl, sep){
    $.ajax({
        type: 'POST',
        url: 'http://personal-space.herokuapp.com/api/matchcat?ra='+ra+'&decl='+decl+'&sep='+sep,
        crossDomain: true,
        data: "",
        success: function(data, textStatus, jqXHR) {
            obj = jQuery.parseJSON(data);
            if (obj.result.length>0) {
                $("#deepsky_count").show();
                $("#deepsky_count").text(obj.result.length);
                $("#deepsky").attr('title', obj.result.length+' deep sky opbjects');
            }
            $("#deepsky-accordion").empty();
            var i = 0;
            $.each(obj.result, function(k, v){                                 
                i+=1;
                $("#deepsky-accordion").append('<h2 class="accordion-header" id="'+i+'-deepsky'+'">'+v.name+'</h2><div class="accordion-content"><p>'+v.class+', '+v.description+'</p><p><a class="deepSkyLink" onclick="visitDeepSky('+v.ra+','+v.decl+');">Got to '+v.name+'</a></p></div>');
                var circ = createDeepSkyCircle(v.ra, v.decl);
                $("#"+i+'-deepsky').hover(
                  function () {
                    wwt.addAnnotation(circ);
                  },
                  function () {
                    wwt.removeAnnotation(circ);
                  }
                );
            });
            loadAccordion('deepsky-accordion');
        },
        error: function (responseData, theextStatus, errorThrown) {
            console.log('POST failed.');
        }
    });
}

function getPlanets(ra, decl, datetim, sep){
    $.ajax({
        type: 'POST',
        url: 'http://personal-space.herokuapp.com/api/planets?ra='+ra+'&decl='+decl+'&datetim'+datetim+'&sep='+sep,
        crossDomain: true,
        data: "",
        success: function(data, textStatus, jqXHR) {
            obj = jQuery.parseJSON(data);
            if (obj.result.length>0) {
                $("#planet_count").show();
                $("#planet_count").text(obj.result.length);
                $("#planets").attr('title', obj.result.length+' planets');
            }
            $("#planets-accordion").empty(); 
            var i = 0;
            $.each(obj.result, function(k, v){ 
                i+=1;
                $("#planets-accordion").append('<h2 class="accordion-header" id="'+i+'-planet'+'">'+v.planet+'</h2><div class="accordion-content"><p>Info to go here...</p></div>');
            });
            loadAccordion('planets-accordion');
        },
        error: function (responseData, theextStatus, errorThrown) {
            console.log('POST failed.');
        }
    });
}