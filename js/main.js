function runForm() {
    
    checkTimeVal();

    var formData = "name=" + $("input#full_name").val()
                 + "&place=" + $("input#place_name").val() 
                 + "&lat=" + $("input#latitude").val() 
                 + "&lon=" + $("input#longitude").val()
                 + "&datetime=" + $("input#date").val() + " " + $("input#time").val()
                 + "&event=" + $("input#event_name").val();

    $.ajax({
        type: 'POST',
        url: 'http://personal-space.herokuapp.com/api/create?'+formData,
        crossDomain: true,
        data: "",
        success: function(data, textStatus, jqXHR) {
            // console.log(parseFloat(data.result.ra), parseFloat(data.result.decl));
            // window.ra = data.result.ra;
            // window.decl = data.result.decl;
            var sep = 20.0;
            refreshWWT(parseFloat(data.result.ra), parseFloat(data.result.decl));
            createWWTCircle(false, '#531EBD', '#531EBD', 3, 1.0, sep/2.0, true, parseFloat(data.result.ra), parseFloat(data.result.decl));
            findMatches(parseFloat(data.result.ra), parseFloat(data.result.decl), sep/2.0);
            getDeepSky(parseFloat(data.result.ra), parseFloat(data.result.decl), sep/2.0);
            // getPlanets(parseFloat(data.result.ra), parseFloat(data.result.decl), $("input#date").val()+" "+$("input#time").val(), sep/2.0);
            makeURL();
        },
        error: function (responseData, theextStatus, errorThrown) {
            console.log('POST failed.');
        }
    });

    updatePrintText();
}

function setForm(){
	$("#main-box #getspace").attr('id', 'getspace2');
	$('#getspace2').submit(function() {
        runForm();
		return false;
    });
}

function setupPage() {
	$(document).ready(function(){
        // Initialise WWT canvas
        WWTSize();
        initializeWWT();
        
        //Set up form and preload in URL is right
        setForm();
        preloadForm();

        if (!getURLParam('datetime')) {
            var myDate = new Date();
            var prettyDate = myDate.getFullYear()+"-"+pad(myDate.getMonth()+1) + '-' + pad(myDate.getDate());
            var prettyTime = pad(myDate.getHours())+":"+pad(myDate.getMinutes());
            $("#date").val(prettyDate);
            $("#time").val(prettyTime);
            $("#date").datepicker({ dateFormat: 'yy-mm-dd' });
            // $('#time').timepicker();
        }

        if (getURLParam('trigger')==='true') {
            triggerForm();
        }
    });
}

function refreshWWT(ra, dec) {

    clearAnnotations();
    wwt.goto(ra, dec, 40, false);
    wwt.settings.set_locationLat( $("input#latitude").val() );
    wwt.settings.set_locationLng( $("input#longitude").val() );
    // wwt.settings.set_localHorizonMode(true); // NOT YET IMPLEMENTED IN WWT DOCS
}

$("#zoom_in").click(function() {
  FovDec();
});

$("#zoom_out").click(function() {
  FovInc();
});

$("#info-okay").click(function() {
  $(".info-container").hide();
});

$("#about").click(function() {
  if ($(this).hasClass("active")==true) {
    $(this).removeClass("active");
    $("section#nav li").removeClass("inactive");
    $(".background").hide();
  } else {
    $(this).addClass("active");
    $("section#nav li").not(this).removeClass("active");
    
    $(this).removeClass("inactive");
    $("section#nav li").not(this).addClass("inactive");

    $("#about-content").show();
    $("#gallery-content").hide();
    $("#print-content").hide();
  }
});

$("#gallery").click(function() {
  if ($(this).hasClass("active")==true) {
    $(this).removeClass("active");
    $("section#nav li").removeClass("inactive");
    $(".background").hide();
  } else {
    $(this).addClass("active");
    $("section#nav li").not(this).removeClass("active");
    
    $(this).removeClass("inactive");
    $("section#nav li").not(this).addClass("inactive");

    $("#about-content").hide();
    $("#gallery-content").show();
    $("#print-content").hide();
  }
});

$("#print").click(function() {
  if ($(this).hasClass("active")==true) {
    $(this).removeClass("active");
    $("section#nav li").removeClass("inactive");
    $(".background").hide();
  } else {
    $(this).addClass("active");
    $("section#nav li").not(this).removeClass("active");
    
    $(this).removeClass("inactive");
    $("section#nav li").not(this).addClass("inactive");

    $("#about-content").hide();
    $("#gallery-content").hide();
    $("#print-content").show();
  }
});

$("#historical").click(function() {

  $("#historical").removeClass("inactive");
  $("#political").addClass("inactive");
  $("#personal").addClass("inactive");

  $("#gallery-1-content").show();
  $("#gallery-2-content").hide();
  $("#gallery-3-content").hide();
});

$("#political").click(function() {

  $("#historical").addClass("inactive");
  $("#political").removeClass("inactive");
  $("#personal").addClass("inactive");

  $("#gallery-1-content").hide();
  $("#gallery-2-content").show();
  $("#gallery-3-content").hide();
});

$("#personal").click(function() {

  $("#historical").addClass("inactive");
  $("#political").addClass("inactive");
  $("#personal").removeClass("inactive");

  $("#gallery-1-content").hide();
  $("#gallery-2-content").hide();
  $("#gallery-3-content").show();
});

$("#figures").click(function() {
    toggleFigures();
    $().toggle(this.checked);
});

$("#boundaries").click(function() {
    toggleBoundaries();
    $().toggle(this.checked);
});

$("#place_name_label").click(function() {
    $("#place_name_label").hide();
    $("#place_name").hide();

    $("#latitude").css('display', 'inline-block');
    $("#longitude").css('display', 'inline-block');
    $("#lat_label").css('display', 'inline-block');
    $("#lon_label").css('display', 'inline-block');

    $("#coords_break").show();
});

$("#lat_label, #lon_label").click(function() {
    $("#place_name_label").show();
    $("#place_name").show();

    $("#latitude").hide();
    $("#longitude").hide();
    $("#lat_label").hide();
    $("#lon_label").hide();

    $("#coords_break").hide();
});

$("#latitude, #longitude").bind("keyup input paste", function() {
    getReverseGeocodingData($("#latitude").val(), $("#longitude").val());
});

$("#place_name, #latitude, #longitude, .map_canvas_wrapper, .map_canvas").focusin(function() {
  $(".map_canvas_wrapper").not(":visible").fadeIn(500);
});

$("input").not("#place_name, #latitude, #longitude, .map_canvas_wrapper, .map_canvas").focusin(function() {
    $(".map_canvas_wrapper").fadeOut(500);
});

$("#submit, #nav, #submit_button").click(function() {
    $(".map_canvas_wrapper").hide();
});

// !
// WWT Controls
// !
var wwt;
var bShowCrosshairs = true;
var bShowUI = true;
var bShowFigures = false;
var bShowBoundaries = false;
// This function initializes the wwt object and registers the wwtReady event
// once the initialization is done the wwtReady event will be fired
function initializeWWT() {
    $("#WWTCanvas").remove();
    $("#main-box #WWTCanvasPre").attr('id', 'WWTCanvas');
    wwt = wwtlib.WWTControl.initControl("WWTCanvas");
    wwt.add_ready(wwtReady);
    wwt.add_arrived(wwtArrived);
}

function FovInc() {
    var newFov = 2.0 * wwt.get_fov();
    if (newFov <= 60) {
        wwt.goto(wwt.getRA()*15.0, wwt.getDec(), newFov, false);
    }
}

function FovDec() {
    var newFov = wwt.get_fov() / 2.0;
    if (wwt.get_fov() >= 0.00022910934437488727) {
        wwt.goto(wwt.getRA()*15.0, wwt.getDec(), newFov, false);
    }
}

// A function to create a circle, and return a reference to the circle
var circleCount = 0;
function createWWTCircle(fill, lineColor, fillColor, lineWidth, opacity, radius, skyRelative, ra, dec) {
    var circle = wwt.createCircle(fill);
    circleCount++;
    circle.set_id("Circle" + circleCount.toString());
    circle.set_lineColor(lineColor);
    circle.set_fillColor(fillColor);
    circle.set_lineWidth(lineWidth);
    circle.set_opacity(opacity);
    circle.set_radius(radius);
    circle.set_skyRelative(skyRelative);
    circle.setCenter(ra, dec);
    wwt.addAnnotation(circle);
    return true;
}
 // Simple function to clear all the annotations from the view
 function clearAnnotations() {
    wwt.clearAnnotations();
}

function createMatchCircle(ra, dec, sep) {
    var circle = wwt.createCircle(true);
    circleCount++;
    circle.set_id("Circle" + circleCount.toString());
    circle.set_lineColor('#bbbbbb');
    circle.set_fillColor('#ffffff');
    circle.set_lineWidth(1);
    circle.set_opacity(0.15);
    circle.set_radius(sep);
    circle.set_skyRelative(true);
    circle.setCenter(ra, dec);
    return circle;
}

function createDeepSkyCircle(ra, dec) {
    var circle = wwt.createCircle(true);
    circleCount++;
    circle.set_id("Circle" + circleCount.toString());
    circle.set_lineColor('#FFFF7D');
    circle.set_fillColor('#FFE214');
    circle.set_lineWidth(1);
    circle.set_opacity(0.5);
    circle.set_radius(0.5);
    circle.set_skyRelative(true);
    circle.setCenter(ra, dec);
    return circle;
}

function wwtArrived() {
    // createWWTCircle(false, '531EBD', '531EBD', 3, 1.0, 10, true, (wwt.getRA()*15.0), wwt.getDec());
}

function toggleSetting(text) {
    switch (text) {
        case 'ShowUI':
            bShowUI = !bShowUI;
            wwt.hideUI(!bShowUI);
            break;
         case 'ShowCrosshairs':
            bShowCrosshairs = !bShowCrosshairs;
            wwt.settings.set_showCrosshairs(bShowCrosshairs);
            break;
         case 'ShowFigures':
            bShowFigures = !bShowFigures;
            wwt.settings.set_showConstellationFigures(bShowFigures);
            break;
         case 'ShowBoundaries':
            bShowBoundaries = !bShowBoundaries;
            wwt.settings.set_showConstellationBoundries(bShowBoundaries);
            break;
    }
}

function GotoConstellation(text) {       
    switch (text) {
        case 'Sagittarius':
            wwt.goto(286.485, -27.5231666666667, 60, false);
            break;
         case 'Aquarius':
            wwt.goto(334.345, -9.21083333333333, 60, false);
            break;
     }
}

function visitDeepSky(ra, dec) {
    wwt.goto(parseFloat(ra), parseFloat(dec), 0.5, false);
}

// The wwtReady function is called by the WWT Web Control software
// This function sets up the wwt object, and the initial defaults
function wwtReady() {
    wwt.hideUI(!bShowUI);

    wwt.settings.set_showCrosshairs(bShowCrosshairs);
    wwt.settings.set_showConstellationFigures(bShowFigures);
    wwt.settings.set_showConstellationBoundries(bShowBoundaries);
    wwt.settings.set_constellationBoundryColor("#555555");
    wwt.settings.set_constellationSelectionColor("#FFFFFF");
    wwt.settings.set_constellationFigureColor("#FFAE00");
    
    if (getURLParam('trigger')!='true') { wwt.goto(37.82983629365795, 80.26714517468302, 10, false); }
}

function WWTSize() {
    if (isMedia("print")==true) {
        var windowWidth = "650px";
        var windowHeight = $(window).height() - $('.footer-container').height();
    } else {
        var windowWidth = $(window).width();
        var windowHeight = $(window).height() - $('.footer-container').height();
    }
    $('#WWTCanvasPre').css({'width':windowWidth ,'height':windowHeight });
}

function toggleFigures(){
    bShowFigures = !bShowFigures;
    wwt.settings.set_showConstellationFigures(bShowFigures);
}

function toggleBoundaries(){
    bShowBoundaries = !bShowBoundaries;
    wwt.settings.set_showConstellationBoundries(bShowBoundaries);  
}

//Trigger WWT resize on window resize
window.onresize = function(event) {
   WWTSize();
}
