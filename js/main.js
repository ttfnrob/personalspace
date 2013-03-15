function loadVS(lat, lon) {
	$("#starmap2").remove();
	$("#main-box #starmap").attr('id', 'starmap2');
	planetarium = $.virtualsky({id:'starmap2', projection:'polar', mouse:true, keyboard:true, latitude:lat, longitude:lon});
}

function pad(n) {
    return (n < 10) ? ("0" + n) : n;
}

function setForm(){
	$("#main-box #getspace").attr('id', 'getspace2');
	$('#getspace2').submit(function() {
  
		var formData = "name=" + $("input#full_name").val()
					 + "&place=" + $("input#place_name").val() 
					 + "&lat=" + $("input#latitude").val() 
					 + "&lon=" + $("input#longitude").val()
					 + "&datetime=" + $("input#date").val() + " " + $("input#time").val() + ":00"
					 + "&event=" + $("input#event_name").val();

		console.log(formData);

        $.ajax({
		    type: 'POST',
		    url: 'http://personal-space.herokuapp.com/api/create?'+formData,
		    crossDomain: true,
		    data: "",
		    success: function(data, textStatus, jqXHR) {
		        console.log(data.result.ra, data.result.dec);
		    	// loadVS(parseFloat(data.request.lat), parseFloat(data.request.lon));
		    	wwt.gotoRaDecZoom(parseFloat(data.result.ra), parseFloat(data.result.dec), 20, false);
		    },
		    error: function (responseData, textStatus, errorThrown) {
		        console.log('POST failed.');
		    }
		});

		return false;
    });
}

function mainContent(id) {
	$("#main-box").html($("#"+id).html());
	
	$(document).ready(function(){
      loadVS(34.0,-119.0);
		initializeWWT();
		setForm();
    });
}

$("#main-link").click(function() {
  mainContent('homepage');
});

$("#about-link").click(function() {
  mainContent('about');
});

$("#objects-link").click(function() {
  mainContent('objects');
});

// WWT Controls
var wwt;
var bShowCrosshairs = true;
var bShowUI = true;
var bShowFigures = true;
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
    var newFov = 1.1 * wwt.get_fov();
    if (newFov <= 60) {
        wwt.gotoRaDecZoom(wwt.getRA(), wwt.getDec(), newFov, false);
    }
}
 function FovDec() {
    var newFov = wwt.get_fov() / 1.1;
    if (wwt.get_fov() >= 0.00022910934437488727) {
        wwt.gotoRaDecZoom(wwt.getRA(), wwt.getDec(), newFov, false);
    }
}
 function showFov() {
    // document.getElementById("currentfov").value = wwt.get_fov();
}
 function wwtArrived() {
    showFov();
}
// A simple function to toggle the settings
// This function is called from the checkbox entries setup in the html table
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
    }
}
// A function to change the view to different constellations
// This function is called from the button entries in the html table
function GotoConstellation(text) {       
    switch (text) {
        case 'Sagittarius':
            wwt.gotoRaDecZoom(286.485, -27.5231666666667, 60, false);
            break;
         case 'Aquarius':
            wwt.gotoRaDecZoom(334.345, -9.21083333333333, 60, false);
            break;
     }
}
// The wwtReady function is called by the WWT Web Control software
// This function sets up the wwt object, and the initial defaults
 function wwtReady() {
    wwt.settings.set_showCrosshairs(bShowCrosshairs);
    wwt.settings.set_showConstellationFigures(bShowFigures);
    wwt.hideUI(!bShowUI);
     wwt.settings.set_showConstellationBoundries(true);
     showFov();
}
