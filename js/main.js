function loadVS(lat, lon) {
	lat = lat || '34.4326';
	lon = lon || '-119.86286';
	$("#main-box #starmap").attr('id', 'starmap2');
	planetarium = $.virtualsky({id:'starmap2', projection:'polar', mouse:true, keyboard:true, latitude:lat, longitude:lon});
}

function mainContent(id) {
	$("#main-box").html($("#"+id).html());
	loadVS();
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
