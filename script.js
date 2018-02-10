var modes = ['task','break','long'];

var rhythms = {
	'Pomodoro' : ['Pomodoro', 25,5,30,4],
	'DeskTime' : ['DeskTime',52,17],
	'Ultradian' : ['Ultradian',90,15]
};

var app = {

// handles all the application logic,
// doesn't touch the DOM

	init: function(rhythm, taskLength, breakLength, longBreakLength, numTasks) {

		this.rhythm = rhythm || this.rhythm;
		this.task = taskLength * 60 || this.task;
		this.break = breakLength * 60 || this.break;
		this.long = longBreakLength * 60 || this.long;
		this.numTasks = numTasks || 3;
		this.currentTimer = new Timer('task', this.task);
		this.timeLeft = this.task;
		this.completed = this.completed || 0;
		this.mode = 0;
		this.running = false;

		view.render();

	},

	adjust: function(param, value) {
		if(!(this[param] === 0 && value < 0)) {
			this.rhythm = '(custom)';
			this[param] += value;
			view.render();
		}
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
		ding();
		this.running = false;
		switch(modes[this.mode]) {

			case 'task':
				this.completed++;
				if(this.completed === this.numTasks && this.numTasks >= 2) {
					show(document.getElementById('complete'));
					this.mode = 2;
					this.currentTimer = new Timer('long', this.long);
					this.start();
					break;
				}

			case 'break':
				this.mode = +!this.mode;
				this.currentTimer = new Timer(modes[this.mode], this[modes[this.mode]]);
				this.start();
				break;

		}

	},

	toggle: function(m) {
		ding();
		var buttons = document.querySelectorAll('.mode');
		if(m != modes[this.mode]) {
			if(this.mode < 2) {
				if(buttons[this.mode].classList.contains('active')) {
					buttons[this.mode].classList.remove('active');
				}
				buttons[+!this.mode].classList.add('active');
				this.next();
			} else {
				show(document.getElementById('complete'));
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
			{ id: 'numTasks', data: app.numTasks },
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

	bind: function(controls) {

		var handlers = {
			start: app.start.bind(app),
			pause: app.stop.bind(app),
			reset: app.reset.bind(app),
			apply: app.reset.bind(app),
			toggleTask: app.toggle.bind(app, 'task'),
			toggleBreak	: app.toggle.bind(app, 'break'),
			decreaseNumTasks: function() {
				app.adjust('numTasks', -1);
			},
			increaseNumTasks: function() {
				app.adjust('numTasks', 1);
			},
			decreaseTask: function() {
				app.adjust('task', -60);
			},
			increaseTask: function() {
				app.adjust('task', 60);
			},
			decreaseBreak: function() {
				app.adjust('break', -60);
			},
			increaseBreak: function() {
				app.adjust('break', 60);
			},
			showSettings: function() { 
				show(document.getElementById('settings'));
				view.render();
			},
			hideSettings: function() {
				hide(document.getElementById('settings'));
				view.render();
			},
			continue: function() {
				hide(document.getElementById('complete'));
				app.toggle('task');
				app.init();
				app.start();
			}
		}

		var controls =[
			'start', 'pause', 'reset',
			'toggleTask', 'toggleBreak',
			'increaseNumTasks','decreaseNumTasks',
			'decreaseTask', 'increaseTask',	
			'decreaseBreak', 'increaseBreak',
			'showSettings', 'hideSettings',
			'apply', 'continue'];

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

view.bind();
app.init.apply(app, rhythms['Pomodoro']);

function hide(element) {
	element.classList.add('hidden');
}

function show(element) {
	element.classList.remove('hidden');
}

function ding() {
	document.getElementById('ding').play();
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