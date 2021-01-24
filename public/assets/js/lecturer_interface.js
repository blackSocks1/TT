function displayAvailTime() {
	var availTimetable = document.querySelector('.availTime');
	var timetable = document.querySelector('.normalTime');

	availTimetable.style.display = 'block';
	timetable.style.display = 'none';
	$('.availableTimetable').addClass('active');
	$('.normalTimetable').removeClass('active');
}

function displayTimetable() {
	var availTimetable = document.querySelector('.availTime');
	var timetable = document.querySelector('.normalTime');

	availTimetable.style.display = 'none';
	timetable.style.display = 'block';
	$('.normalTimetable').addClass('active');
	$('.availableTimetable').removeClass('active');
}

function myFunction(){
	$('.normalTimetable').addClass('active');
}

