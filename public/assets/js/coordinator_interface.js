function displayAvailTime() {
	var availTimetable = document.querySelector('.availTime');
	var timetable = document.querySelector('.normalTime');
	var progTimetable = document.querySelector('.progTime');

	availTimetable.style.display = 'block';
	timetable.style.display = 'none';
	progTimetable.style.display = 'none';
	$('.availableTimetable').addClass('active');
	$('.normalTimetable').removeClass('active');
	$('.programTimetable').removeClass('active');
}

function displayTimetable() {
	var availTimetable = document.querySelector('.availTime');
	var timetable = document.querySelector('.normalTime');
	var progTimetable = document.querySelector('.progTime');

	availTimetable.style.display = 'none';
	timetable.style.display = 'block';
	progTimetable.style.display = 'none';
	$('.normalTimetable').addClass('active');
	$('.availableTimetable').removeClass('active');
	$('.programTimetable').removeClass('active');
}

function displayprogTimetable() {
	var availTimetable = document.querySelector('.availTime');
	var timetable = document.querySelector('.normalTime');
	var progTimetable = document.querySelector('.progTime');

	availTimetable.style.display = 'none';
	timetable.style.display = 'none';
	progTimetable.style.display = 'block';
	$('.normalTimetable').removeClass('active');
	$('.availableTimetable').removeClass('active');
	$('.programTimetable').addClass('active');
}

function myFunction(){
	$('.normalTimetable').addClass('active');
}

