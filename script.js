var modes = ['task','rest','long'];

var rhythms = {
	'Pomodoro' : ['Pomodoro', 25,5,30,4],
	'DeskTime' : ['DeskTime',52,17],
	'Ultradian' : ['Ultradian',90,15]
};

var app = {

	init: function(rhythm, taskLength, restLength, longBreakLength, numTasks) {

		this.rhythm = rhythm || this.rhythm;
		this.task = taskLength * 60 || this.task;
		this.rest = restLength * 60 || this.rest;
		this.long = longBreakLength * 60 || this.long;
		this.numTasks = numTasks || 4;
		this.currentTimer = new Timer('task', this.task);
		this.timeLeft = this.task;
		this.completed = this.completed || 0;
		this.resting = false;
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

	complete: function() {
		this.completed++;
		view.render();
	},

	switchMode: function(long) {
		this.stop();
		this.resting = +!this.resting;
		if(long) {
			this.currentTimer = new Timer('long', this.long);
		} else {
			this.currentTimer = new Timer(modes[+this.resting], this[modes[+this.resting]]);
		}
		view.render();
		view.ding();
	},

	next: function() {
		this.running = false;
		switch(modes[+this.resting]) {

			case 'task':
				this.complete();
				if(this.completed === this.numTasks && this.numTasks >= 2) {
					view.show(document.getElementById('complete'));
					this.switchMode(true);
					this.start();
					break;
				}

			case 'rest':
				this.switchMode();
				this.start();
				break;

		}

	},

	stop: function() {
		this.running = false;
		this.currentTimer.stopTimer();
	},

	continue: function() {
		this.numTasks += 4;
		app.next();
		view.hide(document.getElementById('complete'));
	}

};

var view = {

	hide: function(element) {
		element.classList.add('hidden');
	},

	show: function(element) {
		element.classList.remove('hidden');
	},

	ding: function() {
		document.getElementById('ding').play();
	},

	render: function() {

		var fields = [ 
			{ id: 'timeLeft', data: convert(app.timeLeft) },
			{ id: 'numTasks', data: app.numTasks },
			{ id: 'taskLength', data: convert(app.task) },
			{ id: 'restLength', data: convert(app.rest) },
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
			toggleTask: function() {
				if(app.resting) {
					app.next();
				}
			},
			toggleBreak	: function() {
				if(!app.resting) {
					app.next();
				}
			},
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
				app.adjust('rest', -60);
			},
			increaseBreak: function() {
				app.adjust('rest', 60);
			},
			showSettings: function() { 
				view.show(document.getElementById('settings'));
				view.render();
			},
			hideSettings: function() {
				view.hide(document.getElementById('settings'));
				view.render();
			}
		}

		var controls =[
			'start', 'pause', 'reset',
			'toggleTask', 'toggleBreak',
			'increaseNumTasks','decreaseNumTasks',
			'decreaseTask', 'increaseTask',	
			'decreaseBreak', 'increaseBreak',
			'showSettings', 'hideSettings',
			'apply'];

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
