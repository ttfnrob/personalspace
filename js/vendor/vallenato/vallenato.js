function loadAccordion() {

	var clickHandler = function () {
		// console.log("Click");
		if($(this).is('.inactive-header')) {
			$('.active-header').toggleClass('active-header').toggleClass('inactive-header').next().fadeToggle().toggleClass('open-content');
			$(this).toggleClass('active-header').toggleClass('inactive-header');
			$(this).next().fadeToggle().toggleClass('open-content');
		}
		
		else {
			$(this).toggleClass('active-header').toggleClass('inactive-header');
			$(this).next().fadeToggle().toggleClass('open-content');
		}
		return false;
	};

	$('.accordion-header').toggleClass('inactive-header');
	
	$('.accordion-header').unbind('click', clickHandler);
	$('.accordion-header').bind('click', clickHandler);
	
	return false;
}