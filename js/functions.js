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

function hideMap(){
    $(".map_canvas_wrapper").css('left','-305px').hide();
}

function getReverseGeocodingData(lat, lng) {
    var latlng = new google.maps.LatLng(lat, lng);
    // This is making the Geocode request
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'latLng': latlng }, function (results, status) {
        if (status !== google.maps.GeocoderStatus.OK) {
            $("#place_name").val("Unknown");
            // console.log("Unknown coords");
            alert("Lat/long not recognised as a known location.");
        }
        // This is checking to see if the Geoeode Status is OK before proceeding
        if (status == google.maps.GeocoderStatus.OK) {
            var address = (results[0].formatted_address);
            $("#place_name").val(address);
            // console.log("Updated coords: ", address);
        }
    });
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

function triggerForm() {
    runForm();
    $(".info-container").hide();
}

var isMedia = (function(){
 
    var div;
    
    return function(query){
        if (!div){
            div = document.createElement("div");
            div.id = "ncz1";
            div.style.cssText = "position:absolute;top:-1000px";
            document.body.insertBefore(div, document.body.firstChild);          
        }
    
        div.innerHTML = "_<style media=\"" + query + "\"> #ncz1 { width: 1px; }</style>";
        div.removeChild(div.firstChild);
        return div.offsetWidth == 1;    
    };
})();

//API calling functions
function findMatches(ra, decl, sep){
    $.ajax({
        type: 'POST',
        url: 'http://personal-space.herokuapp.com/api/match?ra='+ra+'&decl='+decl+'&sep='+sep,
        crossDomain: true,
        data: "",
        success: function(data, textStatus, jqXHR) {
            obj = jQuery.parseJSON(data);
            if (obj.result.length>0) {
                $("#people .centre").addClass("active");
            } else {
                $("#people .centre").removeClass("active");
            }
            $("#people li").not(".centre").remove();
            var i = 0;
            $.each(obj.result, function(k, v){                                 
                i+=1;
                if (i<=10) {
                    // console.log(v);
                    $("#people").append('<li id="'+i+'-matches'+'"><a href="#" alt="'+v.name+'" title="'+Math.round(v.interarea*100,0)+'%">'+v.name.split(" ")[0]+'</a></li>');
                    $("#people").append('<span class="details" id="'+i+'-details">'+v.event+'<br/>'+v.location+'</span>');
                    var circ = createMatchCircle(v.ra, v.decl, sep);
                    $("#"+i+'-matches').hover(
                      function () {
                        x = $(this).attr('id').split("-")[0];
                        wwt.addAnnotation(circ);
                        $("#"+x+'-details').show();
                      },
                      function () {
                        x = $(this).attr('id').split("-")[0];
                        wwt.removeAnnotation(circ);
                        $("#"+x+'-details').hide();
                      }
                    );
                }
            });

            $('#people').circleMenu({
              item_diameter: 50,
              circle_radius: 150,
              angle: {start:210, end:330},
              delay: 500
            }).circleMenu('init');

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
                $("#deep .centre").addClass("active");
            } else {
                $("#deep .centre").removeClass("active");
            }
            $("#deep li").not(".centre").remove();
            var i = 0;
            $.each(obj.result, function(k, v){                                 
                i+=1;
                $("#deep").append('<li id="'+i+'-deepsky'+'"><a href="#" alt="'+v.name+'" title="'+v.name+'">'+v.name+'</a></li>');
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

            $('#deep').circleMenu({
              item_diameter: 50,
              circle_radius: 150    ,
              angle: {start:210, end:330},
              delay: 500
            }).circleMenu('init');

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
        },
        error: function (responseData, theextStatus, errorThrown) {
            console.log('POST failed.');
        }
    });
}

function updatePrintText(){
    var string1 = "<strong>"+$("input#event_name").val()+"</strong>";
    string1 = string1+", "+$("input#date").val();
    string1 = string1+", "+$("input#time").val();
    string2 = $("input#place_name").val();
    string2 = string2+" ("+parseFloat($("input#latitude").val()).toFixed(3);;
    string2 = string2+", "+parseFloat($("input#longitude").val()).toFixed(3)+")";
    $("#print-text").html(string1+"<br/>"+string2);
}