var flatpickr = function(selector, config) {
	'use strict';
	let elements, instances, createInstance = element => {
		if (element._flatpickr)
			element._flatpickr.destroy();

		element._flatpickr = new flatpickr.init(element, config);
		return element._flatpickr;
	};

	if (selector.nodeName)
		return createInstance(selector);
	/*
	Utilize the performance of native getters if applicable
	https://jsperf.com/getelementsbyclassname-vs-queryselectorall/18
	https://jsperf.com/jquery-vs-javascript-performance-comparison/22
	*/
	else if (/^\#[a-zA-Z0-9\-\_]*$/.test(selector))
		return createInstance(document.getElementById(selector.slice(1)));

	else if (/^\.[a-zA-Z0-9\-\_]*$/.test(selector))
		elements = document.getElementsByClassName(selector.slice(1));

	else
		elements = document.querySelectorAll(selector);

	instances = [].slice.call(elements).map(createInstance);

	return {
		calendars: instances,
		byID: id => {
			for(let i=0;i<instances.length;i++)
				if(instances[i].element.id === id)
					return instances[i];
		}

	};
};

/**
 * @constructor
 */
flatpickr.init = function(element, instanceConfig) {
	'use strict';

	var createElement = (tag, className, content) => {

		let element = document.createElement(tag);

		if(content)
			element.innerHTML = content;

		if(className)
			element.className = className;

		return element;

	};

	function throttle (callback, limit) {
		var wait = false;
		return function () {
			if (!wait) {
				callback.call();
				wait = true;
				setTimeout(() => {wait = false;}, limit);
			}
		};
	}

	// functions
	var self = this,
		init,
		wrap,
		uDate,
		equalDates,
		pad,
		formatDate,
		monthToStr,
		isDisabled,

		buildMonthNavigation,
		buildWeekdays,
		buildCalendar,
		buildDays,
		buildWeeks,
		buildTime,

		timeWrapper,
		yearScroll,
		updateValue,

		onInput,

		updateNavigationCurrentMonth,

		handleYearChange,
		changeMonth,
		getDaysinMonth,
		documentClick,
		calendarClick,

		getRandomCalendarIdStr,
		bind,

		triggerChange;

	// elements & variables
	var calendarContainer,
		navigationCurrentMonth,
		monthsNav,
		prevMonthNav,
		cur_year,
		cur_month,
		nextMonthNav,
		calendar,
		weekNumbers,
		currentDate = new Date(),
		wrapperElement,
		hourElement,
		minuteElement,
		secondElement,
		am_pm,
		clickEvt;


	init = function() {

		instanceConfig = instanceConfig || {};

		self.config = {};
		self.element = element;

		for (var config in self.defaultConfig)
			self.config[config] =
				instanceConfig[config] ||
				self.element.dataset && self.element.dataset[config.toLowerCase()] ||
				self.element.getAttribute("data-"+config)||
				self.defaultConfig[config];

		self.input = (self.config.wrap) ? element.querySelector("[data-input]") : element;
		self.input.classList.add("flatpickr-input");

		if(self.config.defaultDate)
			self.config.defaultDate = uDate(self.config.defaultDate);

		if (self.input.value || self.config.defaultDate)
			self.selectedDateObj = uDate(self.config.defaultDate||self.input.value);


		wrap();
		buildCalendar();
		bind();

		self.uDate = uDate;

		self.jumpToDate();
		updateValue();
	};

	getRandomCalendarIdStr = function() {
		let randNum, idStr;
		do {
			randNum = Math.round(Math.random()*Math.pow(10,10));
			idStr   = 'flatpickr-'+randNum;
		} while(document.getElementById(idStr) !== null);
		return idStr;
	};

	uDate = function(date, timeless){

		timeless = timeless||false;

		if (date === 'today'){
			date = new Date();
			timeless = true;
		}

		else if (typeof date === 'string'){

			date = date.trim();

			if (self.config.parseDate)
				date = self.config.parseDate(date);

			else if (/^\d\d\d\d\-\d{1,2}\-\d\d$/.test(date))
				// this utc datestring gets parsed, but incorrectly by Date.parse
				date = new Date(date.replace(/(\d)-(\d)/g, "$1/$2") );

			else if (Date.parse(date))
				date = new Date(date);

			else if (/^\d\d\d\d\-\d\d\-\d\d/.test(date)) // disable special utc datestring
				date = new Date(date.replace(/(\d)-(\d)/g, "$1/$2") );

			else if (/^(\d?\d):(\d\d)/.test(date)){ // time-only picker
				let matches = date.match(/^(\d?\d):(\d\d)(:(\d\d))?/);

				let seconds = 0;
				if (matches[4] !== undefined)
					seconds = matches[4];

				date = new Date();
				date.setHours(matches[1], matches[2], seconds, 0);
			}

			else {
				console.error(`flatpickr: invalid date string ${date}`);
				console.info(self.element);
			}
		}

		if(timeless && date)
			date.setHours(0,0,0,0);

		if(String(self.config.utc) === 'true' && date && !date.fp_isUTC)
			date = date.fp_toUTC();

		return date;
	};

	equalDates = (date1, date2) => (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);

	wrap = function() {

		wrapperElement = createElement("div", "flatpickr-wrapper");

		if(self.config.inline || self.config.static) {
			// Wrap input and place calendar underneath
			self.element.parentNode.insertBefore(wrapperElement, self.element);
			wrapperElement.appendChild(self.element);

			wrapperElement.classList.add(self.config.inline ? 'inline' : 'static');
		}
		else
			// Insert at bottom of BODY tag to display outside
			// of relative positioned elements with css 'overflow: hidden;'
			// property set.
			document.body.appendChild(wrapperElement);


		if (self.config.altInput){
			// replicate self.element
			self.altInput = createElement(self.input.nodeName, self.config.altInputClass + " flatpickr-input");
			self.altInput.placeholder = self.input.placeholder;
			self.altInput.type = "text";

			self.input.type='hidden';
			self.input.parentNode.insertBefore(self.altInput, self.input.nextSibling);
		}

	};

	getDaysinMonth = function(givenMonth){

		let yr = self.currentYear,
			month = givenMonth||self.currentMonth;

		if (month === 1 && ((yr % 4 === 0) && (yr % 100 !== 0)) || (yr % 400 === 0))
			return 29;

		return self.l10n.daysInMonth[month];
	};

	updateValue = function(){

		let prev_date;

		if (self.selectedDateObj && self.config.enableTime){

			prev_date = self.selectedDateObj.getTime();

			// update time
			var hours = (parseInt(hourElement.value, 10) || 0),
				minutes = (60 + (parseInt(minuteElement.value, 10) || 0)) % 60,
				seconds;

			if(self.config.enableSeconds)
				seconds = (60 + (parseInt(secondElement.value, 10)) || 0) % 60;

			if (!self.config.time_24hr)
				hours = hours%12 + 12*(am_pm.innerHTML=== "PM");

			self.selectedDateObj.setHours(hours, minutes, seconds === undefined ? self.selectedDateObj.getSeconds() : seconds);

			hourElement.value =
				pad(self.config.time_24hr ? hours : ((12 + hours)%12+12*(hours%12===0)));

			minuteElement.value = pad(minutes);

			if(seconds !== undefined)
				secondElement.value = pad(seconds);

		}

		if (self.altInput && self.selectedDateObj)
			self.altInput.value = formatDate(self.config.altFormat);

		if (self.selectedDateObj)
			self.input.value = formatDate(self.config.dateFormat);

		if(prev_date && self.selectedDateObj.getTime() !== prev_date){
			triggerChange();
		}

	};

	pad = num =>("0" + num).slice(-2);

	formatDate = function(dateFormat) {

		if (self.config.noCalendar)
			dateFormat = "";

		if(self.config.enableTime)
			dateFormat+= " " + self.config.timeFormat;

		let formattedDate = '',
			formats = {
				D: () => self.l10n.weekdays.shorthand[ formats.w() ], // weekday name, short, e.g. Thu
				F: () => monthToStr(formats.n() - 1, false), // full month name e.g. January
				H: () => pad(self.selectedDateObj.getHours()), // hours with leading zero e.g. 03
				J: () => formats.j() + self.l10n.ordinal(formats.j()), // day (1-30) with ordinal suffix e.g. 1st, 2nd
				K: () => self.selectedDateObj.getHours() > 11 ? "PM" : "AM", // AM/PM
				M: () => monthToStr(formats.n() - 1, true), // shorthand month e.g. Jan
				S: () => pad( self.selectedDateObj.getSeconds() ), // seconds 00-59
				U: () => self.selectedDateObj.getTime() / 1000,
				Y: () => self.selectedDateObj.getFullYear(), // 2016
				d: () => pad(formats.j()), // day in month, padded (01-30)
				h: () => self.selectedDateObj.getHours()%12 ? self.selectedDateObj.getHours()%12 : 12, // hour from 1-12 (am/pm)
				i: () => pad(self.selectedDateObj.getMinutes()), // minutes, padded with leading zero e.g. 09
				j: () => self.selectedDateObj.getDate(), // day in month (1-30)
				l: () => self.l10n.weekdays.longhand[ formats.w() ], // weekday name, full, e.g. Thursday
				m: () => pad(formats.n()), // padded month number (01-12)
				n: () => self.selectedDateObj.getMonth() + 1, // the month number (1-12)
				s: () => self.selectedDateObj.getSeconds(), // seconds 0-59
				w: () => self.selectedDateObj.getDay(), // number of the day of the week
				y: () => String(formats.Y()).substring(2) // last two digits of full year e.g. 16 for full year 2016
			},
			formatPieces = dateFormat.split('');

		for(let i = 0; i < formatPieces.length; i++){
			let c = formatPieces[i];
			if (formats[c] && formatPieces[i - 1] !== '\\')
				formattedDate += formats[c]();

			else if (c !== '\\')
					formattedDate += c;
		}

		return formattedDate;
	};

	monthToStr = function(date, shorthand) {
		return shorthand||self.config.shorthandCurrentMonth ? self.l10n.months.shorthand[date] : self.l10n.months.longhand[date];
	};


	isDisabled = function(check_date){

		if (
			(self.config.minDate && check_date < self.config.minDate) ||
			(self.config.maxDate && check_date > self.config.maxDate)
		)
			return true;

		check_date = uDate(check_date, true); //timeless

		let d;

		for (let i = 0; i < self.config.disable.length; i++){

			d = self.config.disable[i];

 			if (d instanceof Function && d(check_date)) // disabled by function
 				return true;

			else if ( // disabled weekday
				typeof d === 'string' &&
				/^wkd/.test(d) &&
				check_date.getDay() === (parseInt(d.slice(-1)) + self.l10n.firstDayOfWeek - 1 )%7
			)
				return true;

 			else if ( // disabled by date string
 				(d instanceof Date || (typeof d === 'string' && !/^wkd/.test(d) ) ) &&
 				uDate(d,true).getTime() === check_date.getTime()
 			)
 				return true;

			else if ( // disabled by range
				typeof d === 'object' &&
				d.hasOwnProperty("from") &&
				check_date >= uDate(d.from) &&
				check_date <= uDate(d.to)
			)
				return true;

		}

		return false;

	};

	yearScroll = event => {
		event.preventDefault();

		let delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.deltaY)));
		self.currentYear = event.target.value = parseInt(event.target.value, 10) + delta;
		self.redraw();

	};

	timeWrapper = function(e){
		e.preventDefault();

		let min = parseInt(e.target.min, 10), max = parseInt(e.target.max, 10),
			step = parseInt(e.target.step, 10),
			delta = step * (Math.max(-1, Math.min(1, (e.wheelDelta || -e.deltaY)))),
			newValue = (parseInt(e.target.value, 10) + delta)%(max+(min===0));

		if (newValue < min)
			newValue = max + (min === 0) - step*(min === 0);

		e.target.value = pad(newValue);

	};


	updateNavigationCurrentMonth = function() {

		cur_month.innerHTML = monthToStr(self.currentMonth) +" ";
		cur_year.value = self.currentYear;

	};

	handleYearChange = function() {

		if (self.currentMonth < 0 || self.currentMonth > 11) {

			self.currentYear += self.currentMonth % 11;
			self.currentMonth = (self.currentMonth + 12) % 12;

		}

	};

	documentClick = function(event) {
		if(
			!(wrapperElement.classList.contains("open")) ||
			wrapperElement.contains(event.target) ||
			event.target === self.element ||
			event.target === self.altInput
		)
			return;

		self.close();

	};

	changeMonth = function(offset) {
		self.currentMonth += offset;

		handleYearChange();
		updateNavigationCurrentMonth();
		buildDays();
	};

	calendarClick = function(e) {

		e.preventDefault();

		if (e.target.classList.contains('slot'))
		{

			self.selectedDateObj = new Date(
				self.currentYear, self.currentMonth, e.target.innerHTML
			);

			updateValue();
			triggerChange();
			buildDays();

			if (!self.config.inline && !self.config.enableTime)
				self.close();

		}

	};

	buildCalendar = function() {

		calendarContainer = createElement('div', 'flatpickr-calendar');
		calendarContainer.id = getRandomCalendarIdStr();

		calendar = createElement("div", "flatpickr-days");

		if (!self.config.noCalendar) {
			buildMonthNavigation();
			buildWeekdays();

			if(self.config.weekNumbers)
				buildWeeks();

			buildDays();

			calendarContainer.appendChild(calendar);
		}

		wrapperElement.appendChild(calendarContainer);

		if(self.config.enableTime)
			buildTime();

	};

	buildMonthNavigation = function() {

		monthsNav = createElement("div", "flatpickr-month");

		prevMonthNav = createElement("span", "flatpickr-prev-month", self.config.prevArrow);

		cur_month = createElement("span", "cur_month");

		cur_year = createElement("input", "cur_year");
		cur_year.type = "number";
		cur_year.title = self.l10n.scrollTitle;

		nextMonthNav = createElement("span", "flatpickr-next-month", self.config.nextArrow);

		navigationCurrentMonth = createElement('span', 'flatpickr-current-month');
		navigationCurrentMonth.appendChild(cur_month);
		navigationCurrentMonth.appendChild(cur_year);

		monthsNav.appendChild(prevMonthNav);
		monthsNav.appendChild(navigationCurrentMonth);
		monthsNav.appendChild(nextMonthNav);

		updateNavigationCurrentMonth();
		calendarContainer.appendChild(monthsNav);
	};

	buildWeekdays = function() {

		let weekdayContainer = createElement('div',"flatpickr-weekdays"),
			firstDayOfWeek = self.l10n.firstDayOfWeek,
			weekdays = self.l10n.weekdays.shorthand.slice();


		if (firstDayOfWeek > 0 && firstDayOfWeek < weekdays.length) {
			weekdays = [].concat(weekdays.splice(firstDayOfWeek, weekdays.length), weekdays.splice(0, firstDayOfWeek));
		}

		weekdayContainer.innerHTML = self.config.weekNumbers ? "<span>" + self.l10n.weekAbbreviation + "</span>" : "";
		weekdayContainer.innerHTML += '<span>' + weekdays.join('</span><span>') + '</span>';

		calendarContainer.appendChild(weekdayContainer);
	};

	buildWeeks = function(){

		calendarContainer.classList.add("hasWeeks");

		weekNumbers = createElement("div", 'flatpickr-weeks');
		calendarContainer.appendChild(weekNumbers);

	};

	buildDays = function() {

		let firstOfMonth = (new Date(self.currentYear, self.currentMonth, 1).getDay() - self.l10n.firstDayOfWeek + 7)%7,
			numDays = getDaysinMonth(),
			prevMonthDays = getDaysinMonth((self.currentMonth - 1 + 12)%12),
			dayNumber = prevMonthDays + 1 - firstOfMonth,
			className,
			cur_date,
			date_is_disabled;

		if(self.config.weekNumbers && weekNumbers)
			weekNumbers.innerHTML = '';

		calendar.innerHTML = '';

		self.config.minDate = uDate(self.config.minDate, true);
		self.config.maxDate = uDate(self.config.maxDate, true);

		// prepend days from the ending of previous month
		for(; dayNumber <= prevMonthDays; dayNumber++)
			calendar.appendChild(createElement("span", "disabled flatpickr-day", dayNumber));


		// Start at 1 since there is no 0th day
		for (dayNumber = 1; dayNumber <= 42 - firstOfMonth; dayNumber++) {

			if (dayNumber <= numDays || dayNumber%7 === 1) // avoids new date objects for appended dates
				cur_date = new Date(self.currentYear, self.currentMonth, dayNumber, 0, 0, 0, 0, 0);

			if(self.config.weekNumbers && weekNumbers && dayNumber%7 === 1)
				weekNumbers.appendChild(
					createElement("span", "disabled flatpickr-day", cur_date.fp_getWeek())
				);


			date_is_disabled = dayNumber > numDays || isDisabled(cur_date);

			className = date_is_disabled ? "disabled flatpickr-day" : "slot flatpickr-day";

			if (!date_is_disabled && equalDates(cur_date, currentDate))
				className += ' today';

			if (!date_is_disabled && self.selectedDateObj && equalDates(cur_date, self.selectedDateObj))
				className += ' selected';

			calendar.appendChild(
				createElement("span", className, (dayNumber > numDays ? dayNumber % numDays : dayNumber))
			);

		}

	};

	buildTime = function(){

		let timeContainer = createElement("div", "flatpickr-time"),
			separator = createElement("span", "flatpickr-time-separator", ":");

		hourElement = createElement("input", "flatpickr-hour");
		minuteElement = createElement("input", "flatpickr-minute");

		hourElement.type = minuteElement.type = "number";

		hourElement.value =
			self.selectedDateObj ? pad(self.selectedDateObj.getHours()) : 12;

		minuteElement.value =
			self.selectedDateObj ? pad(self.selectedDateObj.getMinutes()) : "00";


		hourElement.step = self.config.hourIncrement;
		minuteElement.step = self.config.minuteIncrement;

		hourElement.min = +!self.config.time_24hr; // 0 in 24hr mode, 1 in 12hr mode
		hourElement.max = self.config.time_24hr ? 23 : 12;

		minuteElement.min = 0;
		minuteElement.max = 59;

		hourElement.title = minuteElement.title = self.l10n.scrollTitle;

		timeContainer.appendChild(hourElement);
		timeContainer.appendChild(separator);
		timeContainer.appendChild(minuteElement);

		if(self.config.enableSeconds){

			timeContainer.classList.add("has-seconds");

			secondElement = createElement("input", "flatpickr-second");
			secondElement.type = "number";
			secondElement.value = self.selectedDateObj ? pad(self.selectedDateObj.getSeconds()) : "00";

			secondElement.step = 5;
			secondElement.min = 0;
			secondElement.max = 59;

			timeContainer.appendChild(createElement("span", "flatpickr-time-separator", ":"));
			timeContainer.appendChild(secondElement);
		}

		if (!self.config.time_24hr){ // add am_pm if appropriate
			am_pm = createElement("span", "flatpickr-am-pm", ["AM","PM"][(hourElement.value > 11)|0]);
			am_pm.title = self.l10n.toggleTitle;
			timeContainer.appendChild(am_pm);
		}

		// picking time only
		if (self.config.noCalendar && !self.selectedDateObj)
			self.selectedDateObj = new Date();

		calendarContainer.appendChild(timeContainer);

	};

	bind = function() {

		function am_pm_toggle(e){
			e.preventDefault();
			am_pm.innerHTML =  ["AM","PM"][(am_pm.innerHTML === "AM")|0];
		}

		if (String(self.config.clickOpens)==='true'){
			self.input.addEventListener('focus' , self.open);

			if(self.altInput)
				self.altInput.addEventListener('focus' , self.open);
		}

		if(self.config.allowInput){
			if(self.altInput)
				self.altInput.addEventListener('change' , onInput);

			else
				self.input.addEventListener('change' , onInput);
		}

		if (self.config.wrap && self.element.querySelector("[data-open]"))
			self.element.querySelector("[data-open]").addEventListener('click' , self.open);

		if (self.config.wrap && self.element.querySelector("[data-close]"))
			self.element.querySelector("[data-close]").addEventListener('click' , self.close);

		if (self.config.wrap && self.element.querySelector("[data-toggle]"))
			self.element.querySelector("[data-toggle]").addEventListener('click' , self.toggle);

		if (self.config.wrap && self.element.querySelector("[data-clear]"))
			self.element.querySelector("[data-clear]").addEventListener('click' , self.clear);

		if(!self.config.noCalendar){

			prevMonthNav.addEventListener('click', () => { changeMonth(-1); });
			nextMonthNav.addEventListener('click', () => { changeMonth(1); });

			cur_year.addEventListener('wheel', yearScroll);
			cur_year.addEventListener("focus", cur_year.select);
			cur_year.addEventListener("input", event => {

				self.currentYear = parseInt(event.target.value, 10);
				self.redraw();

			});

			calendar.addEventListener('click', calendarClick);

		}

		document.addEventListener('click', documentClick, true);
		document.addEventListener('focus', documentClick, true);

		if (self.config.enableTime){

			hourElement.addEventListener("wheel", timeWrapper);
			minuteElement.addEventListener("wheel", timeWrapper);

			hourElement.addEventListener("mouseout", updateValue);
			minuteElement.addEventListener("mouseout", updateValue);

			hourElement.addEventListener("change", updateValue);
			minuteElement.addEventListener("change", updateValue);

			hourElement.addEventListener("click", hourElement.select);
			minuteElement.addEventListener("click", minuteElement.select);

			if(self.config.enableSeconds){
				secondElement.addEventListener("wheel", timeWrapper);
				secondElement.addEventListener("mouseout", updateValue);
				secondElement.addEventListener("change", updateValue);
				secondElement.addEventListener("click", secondElement.select);
			}

			if (!self.config.time_24hr) {
				am_pm.addEventListener("focus", am_pm.blur);
				am_pm.addEventListener("click", am_pm_toggle);

				am_pm.addEventListener("wheel", am_pm_toggle);
				am_pm.addEventListener("mouseout", updateValue);
			}

		}

		if(document.createEvent){
			clickEvt = document.createEvent("MouseEvent");
			// without all these args ms edge spergs out
			clickEvt.initMouseEvent("click",true,true,window,0,0,0,0,0,false,false,false,false,0,null);
		}

		else
			clickEvt = new MouseEvent('click', {
				'view': window,
				'bubbles': true,
				'cancelable': true
			});


		window.addEventListener('resize', throttle(() => {

			if (wrapperElement.classList.contains('open') && !self.input.disabled && !self.config.inline && !self.config.static )
				self.positionCalendar();

		}, 150));

	};

	self.open = function() {

		if (self.input.disabled || self.config.inline)
			return;

		if(!self.config.static)
			self.positionCalendar();

		wrapperElement.classList.add('open');

		if(self.altInput){
			if(!self.config.allowInput)
				self.altInput.blur();
			self.altInput.classList.add('active');
		}

		else {
			if(!self.config.allowInput)
				self.input.blur();
			self.input.classList.add('active');
		}


		if (self.config.onOpen)
			self.config.onOpen(self.selectedDateObj, self.input.value);
	};

	// For calendars inserted in BODY (as opposed to inline wrapper)
	// it's necessary to properly calculate top/left position.
	self.positionCalendar = function() {

		let input = self.altInput ? self.altInput : self.input,
			bounds = input.getBoundingClientRect(),
			// account for scroll & input height
			top = (window.pageYOffset + input.offsetHeight + bounds.top),
			left = (window.pageXOffset + bounds.left);

		wrapperElement.style.top = top + 'px';
		wrapperElement.style.left = left + 'px';
	};

	self.toggle = function() {
		if (self.input.disabled)
			return;

		wrapperElement.classList.toggle('open');
		self.positionCalendar();

		if(self.altInput)
			self.altInput.classList.toggle('active');

		self.input.classList.toggle('active');
	};

	self.close = function() {
		wrapperElement.classList.remove('open');
		self.input.classList.remove('active');

		if (self.altInput)
			self.altInput.classList.remove('active');

		if (self.config.onClose)
			self.config.onClose(self.selectedDateObj, self.input.value);
	};

	self.clear = function() {
		self.input.value="";
		self.selectedDateObj = null;
		self.jumpToDate();
	};

	triggerChange = function(){

		self.input.dispatchEvent(clickEvt);

		if (self.config.onChange)
			self.config.onChange(self.selectedDateObj, self.input.value);

	};

	onInput = function(event){

		self.setDate(self.altInput ? self.altInput.value : self.input.value);

	};

	self.destroy = function() {

		document.removeEventListener('click', documentClick, false);

		if(self.altInput)
			self.altInput.parentNode.removeChild(self.altInput);

		if(self.config.inline) {

			let parent  = self.element.parentNode,
				element = parent.removeChild(self.element);

			parent.removeChild(calendarContainer);
			parent.parentNode.replaceChild(element, parent);

		}

		else
			document.getElementsByTagName("body")[0].removeChild(wrapperElement);

	};

	self.redraw = function(){

		if(self.config.noCalendar)
			return;

		updateNavigationCurrentMonth();
		buildDays();

	};

	self.jumpToDate = function(jumpDate){

		jumpDate = uDate(
			jumpDate||self.selectedDateObj||self.config.defaultDate||self.config.minDate||currentDate
		);

		self.currentYear = jumpDate.getFullYear();
		self.currentMonth = jumpDate.getMonth();
		self.redraw();

	};

	self.setDate = function(date, triggerChangeEvent){

		date = uDate(date);

		if(date instanceof Date && date.getTime()){

			self.selectedDateObj = uDate(date);
			self.jumpToDate(self.selectedDateObj);
			updateValue();

			if(triggerChangeEvent||false)
				triggerChange();

		}

	 };

	 self.setTime = function(hour, minute, triggerChangeEvent) {

		if(!self.selectedDateObj)
			return;

		hourElement.value = parseInt(hour,10)%24;
		minuteElement.value = parseInt(minute||0,10)%60;

		if (!self.config.time_24hr)
			am_pm.innerHTML = hour > 11 ? "PM" : "AM";

		updateValue();

		if(triggerChangeEvent||false)
			triggerChange();

	 };

	self.set = function(key, value){

		if (key in self.config) {
			self.config[key] = value;
			self.jumpToDate();
		}

	};

	try { init(); }
	catch(error) {console.error(error);console.info(self.element);} // skip and carry on

	return self;
};

flatpickr.init.prototype = {

	l10n: {
		weekdays: {
			shorthand: ['日', '一', '二', '三', '四', '五', '六'],
			longhand: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
		},
		months: {
			shorthand: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			longhand: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
		},
		daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
		firstDayOfWeek: 0,
		ordinal: (nth) => {
			let s = nth % 100;
			if (s > 3 && s < 21) return "th";
			switch (s % 10) {
				case 1: return "st";
				case 2: return "nd";
				case 3: return "rd";
				default: return "th";
			}
		},
		weekAbbreviation: "Wk",
		scrollTitle: "Scroll to increment",
		toggleTitle: "Click to toggle"
	},

	defaultConfig : {
			/* if true, dates will be parsed, formatted, and displayed in UTC.
			preloading date strings w/ timezones is recommended but not necessary */
			utc: false,

			// noCalendar: true will hide the calendar. use for a time picker along w/ enableTime
			noCalendar: false,

			// wrap: see https://chmln.github.io/flatpickr/#strap
			wrap: false,

			// enables week numbers
			weekNumbers: false,

			allowInput: false,

			/* clicking on input opens the date(time)picker. disable if you wish to open the calendar manually with .open() */
			clickOpens: true,

			// more date format chars at https://chmln.github.io/flatpickr/#dateformat
			dateFormat: 'Y-m-d',

			// altInput - see https://chmln.github.io/flatpickr/#altinput
			altInput: false,

			// the created altInput element will have this class.
			altInputClass: "",

			// same as dateFormat, but for altInput
			altFormat: "F j, Y", // defaults to e.g. June 10, 2016

			// defaultDate - either a datestring or a date object. used for datetimepicker's initial value
			defaultDate: null,

			// the minimum date that user can pick (inclusive)
			minDate: null,

			// the maximum date that user can pick (inclusive)
			maxDate: null,

			// dateparser that transforms a given string to a date object
			parseDate: false,

			// see https://chmln.github.io/flatpickr/#disable
			disable: [],

			// display the short version of month names - e.g. Sep instead of September
			shorthandCurrentMonth: false,

			// displays calendar inline. see https://chmln.github.io/flatpickr/#inline-calendar
			inline: false,

			// position calendar inside wrapper and next to the input element
			// leave at false unless you know what you're doing
			static: false,

			// code for previous/next icons. this is where you put your custom icon code e.g. fontawesome
			prevArrow: '&lt;',
			nextArrow: '&gt;',

			// enables the time picker functionality
			enableTime: false,

			// enables seconds in the time picker
			enableSeconds: false,

			// self-explanatory. defaults to e.g. 3:02 PM
			timeFormat: "h:i K",

			// display time picker in 24 hour mode
			time_24hr: false,

			// step size used when scrolling/incrementing the hour element
			hourIncrement: 1,

			// step size used when scrolling/incrementing the minute element
			minuteIncrement: 5,

			// onChange callback when user selects a date or time
			onChange: null, //function(dateObj, dateStr){}

			// called every time calendar is opened
			onOpen: null, // function(dateObj, dateStr){}

			// called every time calendar is closed
			onClose: null // function(dateObj, dateStr){}
	}
};


Date.prototype.fp_incr = function(days){
	return new Date(
		this.getFullYear(),
		this.getMonth(),
		this.getDate() + parseInt(days, 10)
	);
};

Date.prototype.fp_isUTC = false;
Date.prototype.fp_toUTC = function(){

	let new_date = new Date(this.getTime() + this.getTimezoneOffset() * 60000);
	new_date.fp_isUTC = true;

	return new_date;
};

Date.prototype.fp_getWeek = function() {

	let date = new Date(this.getTime());
	date.setHours(0,0,0,0);

	// Thursday in current week decides the year.
	date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
	// January 4 is always in week 1.
	var week1 = new Date(date.getFullYear(), 0, 4);
	// Adjust to Thursday in week 1 and count number of weeks from date to week1.
	return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

// classList polyfill
if (!("classList" in document.documentElement) && Object.defineProperty && typeof HTMLElement !== 'undefined') {
	Object.defineProperty(HTMLElement.prototype, 'classList', {
		get: function() {
			var self = this;
			function update(fn) {
				return function(value) {
					var classes = self.className.split(/\s+/),
						index = classes.indexOf(value);

					fn(classes, index, value);
					self.className = classes.join(" ");
				};
			}
			var ret = {
				add: update(function(classes, index, value) {
					return ~index || classes.push(value);
				}),
				remove: update(function(classes, index) {
					return ~index && classes.splice(index, 1);
				}),
				toggle: update(function(classes, index, value) {
					return ~index ? classes.splice(index, 1) : classes.push(value);
				}),
				contains: function(value) {
					return !!~self.className.split(/\s+/).indexOf(value);
				}
			};

			return ret;
		}
	});
}

if (typeof module !=='undefined')
	module.exports = flatpickr;
