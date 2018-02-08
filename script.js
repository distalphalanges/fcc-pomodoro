var modes = ['task','break','long'];

var rhythms = {
	'Pomodoro' : ['Pomodoro', 25,5,30,4],
	'DeskTime' : ['DeskTime',52,17],
	'Ultradian' : ['Ultradian',90,15]
};

var app = {

// handles all the application logic,
// doesn't touch the DOM

	init: function(rhythm, taskLength, breakLength, longBreakLength, tasksPerSession) {

		this.rhythm = rhythm;
		this.task = taskLength * 60;
		this.break = breakLength * 60;
		this.long = longBreakLength * 60;
		this.tasksPerSession = tasksPerSession;
		this.currentTimer = new Timer('task', this.task);
		this.timeLeft = this.task;
		this.completed = 0;
		this.mode = 0;
		this.running = false;

		view.render();
		view.bind();

	},

	adjust: function(param, value) {
		this.rhythm = '(custom)';
		this[param] = value;
		view.render();
	},

	reset: function() {
		this.stop();
		this.completed = 0;
		this.currentTimer = new Timer('task', this.task);
		this.update();
	},

	start: function() {
		if(!this.running) {
			this.running = true;
			app.update();
			this.currentTimer.startTimer(app.update.bind(this), app.next.bind(this));
		}
	},

	update: function() {
		this.timeLeft = this.currentTimer.remaining;
		view.render();
		window.focus();
	},

	next: function() {

		this.running = false;
		switch(modes[this.mode]) {

			case 'task':
				// task completed
				this.completed++;
				if(this.completed === this.tasksPerSession) {
					// give yourself a lengthy break
					this.mode = 2;
					view.notify('long');
					this.currentTimer = new Timer('long', this.long);
					this.start();
					break;
				}

			case 'break':
				// back to work!
				this.mode = +!this.mode;
				view.notify(modes[this.mode])
				this.currentTimer = new Timer(modes[this.mode], this[modes[this.mode]]);
				this.start();
				break;

			case 'long':
				// begin another session?
				break;
		}

	},

	toggle: function(m) {
		var buttons = document.querySelectorAll('.mode');
		if(m != modes[this.mode]) {
			if(this.mode < 2) {
				if(buttons[this.mode].classList.contains('active')) {
					buttons[this.mode].classList.remove('active');
				}
				buttons[+!this.mode].classList.add('active');
				this.next();
			} else {
				view.notify('again');
			}
		}
	},

	stop: function() {
		this.running = false;
		this.currentTimer.stopTimer();
	}

};

var view = {

	render: function() {

		var fields = [ 
			{ id: 'timeLeft', data: convert(app.timeLeft) },
			{ id: 'taskLength', data: convert(app.task) },
			{ id: 'breakLength', data: convert(app.break) },
			{ id: 'tasksCompleted', data: app.completed + ' task(s) completed'},
			{ id: 'currentRhythm', data: app.rhythm },
			{ id: 'selectRhythm', data: app.rhythm }
		];

		fields.forEach(function(field) {
			document.getElementById(field.id).value = field.data;
		});

	},

	notify: function(mode) {
		document.getElementById('ding').play();
		switch(mode) {
			case 'task':
				hide(document.querySelector('.break'));
				fadeIn(document.querySelector('.task'));
				break;
			case 'break':
				hide(document.querySelector('.task'));
				fadeIn(document.querySelector('.break'));
				break;
			case 'long':
				hide(document.querySelector('.task'));
				fadeIn(document.querySelector('.session'));
				break;
			case 'again':
				hide(document.querySelector('.session'));
				fadeIn(document.querySelector('.again'));
				break;
		}

	},

	bind: function(controls) {

		var handlers = {
			start: app.start.bind(app),
			pause: app.stop.bind(app),
			reset: app.reset.bind(app),
			apply: app.reset.bind(app),
			toggleTask: app.toggle.bind(app, 'task'),
			toggleBreak	: app.toggle.bind(app, 'break'),
			decreaseTask: function() {
				app.adjust('task', app.task-60);
			},
			increaseTask: function() {
				app.adjust('task', app.task+60);
			},
			decreaseBreak: function() {
				app.adjust('break', app.break-60);
			},
			increaseBreak: function() {
				app.adjust('break', app.break+60);
			},
			showSettings: function() { 
				show(document.getElementById('settings'));
				view.render();
			},
			hideSettings: function() {
				hide(document.getElementById('settings'));
				view.render();
			}
		}

		var controls =[
			'start', 'pause', 'reset',
			'toggleTask', 'toggleBreak',
			'decreaseTask', 'increaseTask',	
			'decreaseBreak', 'increaseBreak', 
			'showSettings', 'hideSettings' ];

		controls.forEach(function(control) {
			document.getElementById(control)
			.addEventListener('click', handlers[control]);
		});

		document.getElementById('selectRhythm')
		.addEventListener('change', function() {
			app.rhythm = this.value;
			app.init.apply(app, rhythms[this.value]);
		});

	}

};

app.init.apply(app, rhythms['Pomodoro']);

function hide(element) {
	element.classList.add('hidden');
}

function show(element) {
	element.classList.remove('hidden');
}

function fadeOut(element) {
  var opacity = 1;
  var timer = setInterval(function () {
    if (opacity <= 0.1){
      clearInterval(timer);
      hide(element);
    }
    element.style.opacity = opacity;
    opacity -= opacity * 0.1;
  }, 50);
}

function fadeIn(element) {
  var opacity = 0;
  element.style.opacity = opacity;
  show(element);
  
  var timer = setInterval(function () {
    if (opacity >= 1.0){
      clearInterval(timer);
    }
    element.style.opacity = opacity;
    opacity = opacity + 0.1;
  }, 50);
}