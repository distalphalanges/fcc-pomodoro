// a class for individual chunks of time
var Timer = function(mode, initialTime) {
	this.mode = mode;
	this.initial = initialTime;
	this.remaining = initialTime;
	this.running = false;
}

Timer.prototype.increase = function() {
	this.initial++;
}

Timer.prototype.decrease = function() {
	this.initial--;
}

// starts the timer running; takes two callback functions as arguments:
// 'repeat' is called every second, 'finish' is called when the timer runs out
Timer.prototype.startTimer = function(repeat, finish) {
	var self = this;
	// you can only start a timer if it's not running already
	if(!this.running) {
		this.running = true;
		this.timer = setInterval(function() {
			if(self.remaining <= 0) {
				self.stopTimer();
				finish();
			} else {
				self.tick();
				repeat();
			}
		}, 100);
	}
}

Timer.prototype.tick = function() {
	this.remaining--;
}

Timer.prototype.stopTimer = function() {
	if(this.running) {
		this.running = false;
		clearInterval(this.timer);
	}
}

Timer.prototype.resetTimer = function() {
	this.stopTimer();
	this.remaining = this.initial;
}

function convert(val) {
	var minutes = Math.floor(val / 60);
	var seconds = val % 60;
	return minutes + ':' + seconds.toString().padStart(2, '0');
}