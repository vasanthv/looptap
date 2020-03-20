const loopTapApp = new Vue({
	el: '#canvas',
	data: {
		arc: [180, 270],
		score: 0,
		state: 'init',
		prevTapTime: 0,
		colors: [
			'#ED5565',
			'#D9444F',
			'#ED5F56',
			'#DA4C43',
			'#F87D52',
			'#E7663F',
			'#FAB153',
			'#F59B43',
			'#FDCE55',
			'#F6BA43',
			'#C2D568',
			'#B1C353',
			'#99D469',
			'#83C251',
			'#42CB70',
			'#3CB85D',
			'#47CEC0',
			'#3BBEB0',
			'#4FC2E7',
			'#3CB2D9',
			'#5C9DED',
			'#4C8CDC',
			'#9398EC',
			'#7277D5',
			'#CC93EF',
			'#B377D9',
			'#ED87BF',
			'#D870AE'
		]
	},
	computed: {
		arcDValue: function() {
			return this.describeArc(50, 50, 40, this.arc[0], this.arc[1]);
		}
	},
	methods: {
		polarToCartesian: function(centerX, centerY, radius, angleInDegrees) {
			const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
			return {
				x: centerX + radius * Math.cos(angleInRadians),
				y: centerY + radius * Math.sin(angleInRadians)
			};
		},

		describeArc: function(x, y, radius, startAngle, endAngle) {
			const start = this.polarToCartesian(x, y, radius, endAngle);
			const end = this.polarToCartesian(x, y, radius, startAngle);
			const arcFlag = endAngle - startAngle <= 180 ? '0' : '1';
			const d = ['M', start.x, start.y, 'A', radius, radius, 0, arcFlag, 0, end.x, end.y].join(' ');
			return d;
		},

		getAngle: function(cx, cy, ex, ey) {
			const dy = ey - cy;
			const dx = ex - cx;
			let theta = Math.atan2(dx, -dy);
			theta *= 180 / Math.PI;
			theta = theta < 0 ? theta + 360 : theta;
			return theta;
		},

		getBallAngle: function() {
			const bg = document.getElementById('bg').getBoundingClientRect();
			const bgCenter = { x: bg.left + bg.width / 2, y: bg.top + bg.height / 2 };
			const ball = document.getElementById('ball').getBoundingClientRect();
			const ballCenter = { x: ball.left + ball.width / 2, y: ball.top + ball.height / 2 };
			return this.getAngle(bgCenter.x, bgCenter.y, ballCenter.x, ballCenter.y);
		},

		setArc: function() {
			const random = (i, j) => Math.floor(Math.random() * (j - i)) + i;
			arc = [];
			arc.push(random(0, 300));
			arc.push(random(arc[0] + 10, arc[0] + 110));
			arc[1] = arc[1] > 360 ? 360 : arc[1];
			this.arc = arc;
		},

		startPlay: function() {
			this.state = 'started';
			this.score = 0;
			this.prevTapTime = Date.now();
		},
		stopPlay: function() {
			if (this.state === 'started') {
				this.state = 'stopped';
				if (this.score > window.localStorage.best) window.localStorage.best = this.score;
			}
		},

		tap: function(e) {
			e.preventDefault();
			e.stopPropagation();
			const ballAngle = this.getBallAngle();
			// adding a 6 for better accuracy as the arc stroke extends beyond the angle.
			if (ballAngle + 6 > this.arc[0] && ballAngle - 6 < this.arc[1]) {
				const currentTapTime = Date.now();
				const tapInterval = currentTapTime - this.prevTapTime;
				console.log(tapInterval);
				this.score = this.score + (tapInterval < 500 ? 10 : tapInterval < 1000 ? 5 : 1);
				console.log(this.score);
				this.prevTapTime = currentTapTime;
				this.setArc();
			} else this.stopPlay();
		}
	}
});

if ('ontouchstart' in window) {
	window.addEventListener('touchstart', loopTapApp.tap);
} else {
	window.addEventListener('mousedown', loopTapApp.tap);
	window.onkeypress = e => {
		if (e.keyCode == 32) loopTapApp.tap(e);
	};
}

// loopTapApp.setArc();

// let arc = [];
// let score = 0;

// let state = 'init';

// const compose = (...fs) => x => fs.reduce((acc, f) => f(acc), x);

// function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
// 	const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
// 	return {
// 		x: centerX + radius * Math.cos(angleInRadians),
// 		y: centerY + radius * Math.sin(angleInRadians)
// 	};
// }

// function describeArc(x, y, radius, startAngle, endAngle) {
// 	const start = polarToCartesian(x, y, radius, endAngle);
// 	const end = polarToCartesian(x, y, radius, startAngle);
// 	const arcFlag = endAngle - startAngle <= 180 ? '0' : '1';
// 	const d = ['M', start.x, start.y, 'A', radius, radius, 0, arcFlag, 0, end.x, end.y].join(' ');
// 	return d;
// }

// function angle(cx, cy, ex, ey) {
// 	const dy = ey - cy;
// 	const dx = ex - cx;
// 	let theta = Math.atan2(dx, -dy);
// 	theta *= 180 / Math.PI;
// 	theta = theta < 0 ? theta + 360 : theta;
// 	return theta;
// }

// function getBallAngle() {
// 	const bg = document.getElementById('bg').getBoundingClientRect();
// 	const bgCenter = { x: bg.left + bg.width / 2, y: bg.top + bg.height / 2 };
// 	const ball = document.getElementById('ball').getBoundingClientRect();
// 	const ballCenter = { x: ball.left + ball.width / 2, y: ball.top + ball.height / 2 };
// 	return angle(bgCenter.x, bgCenter.y, ballCenter.x, ballCenter.y);
// }

// function setArc() {
// 	const random = (i, j) => Math.floor(Math.random() * (j - i)) + i;
// 	arc = [];
// 	arc.push(random(0, 300));
// 	arc.push(random(arc[0] + 10, arc[0] + 110));
// 	arc[1] = arc[1] > 360 ? 360 : arc[1];
// 	document.getElementById('arc').setAttribute('d', describeArc(50, 50, 40, arc[0], arc[1]));
// 	document.getElementById('arc').style.stroke = colors[Math.floor(score / 10)];
// }

// function playBtn() {
// 	document.getElementById('play').style.display = state == 'started' ? 'none' : 'block';
// }

// function scoreField() {
// 	const scoreEle = document.getElementById('score');

// 	scoreEle.textContent = score;
// 	scoreEle.style.display = state == 'started' ? 'block' : 'none';
// }

// function animateBall() {
// 	const ballEle = document.getElementById('ball');
// 	if (state == 'started') {
// 		ballEle.style.animationDuration = 2000 - score * 100 + 'ms';
// 	} else {
// 		ballEle.style.animationPlayState = 'paused';
// 	}
// }

// function finalScore() {
// 	const finalScoreEle = document.getElementById('finalscore');
// 	finalScoreEle.textContent = score;
// 	finalScoreEle.style.display = state == 'stopped' ? 'block' : 'none';
// }

// function best() {
// 	const bestEle = document.getElementById('best');
// 	if (window.localStorage.best > 0) {
// 		bestEle.textContent = 'Best: ' + window.localStorage.best;
// 		bestEle.style.display = state == 'started' ? 'none' : 'block';
// 	}
// }
// function hideTip() {
// 	document.getElementById('tip').style.display = 'none';
// 	document.getElementById('about').style.display = 'none';
// }

// function startPlay() {
// 	state = 'started';
// 	score = 0;
// 	compose(hideTip, setArc, playBtn, animateBall, scoreField, finalScore, best)();
// 	document.getElementById('ball').style.animationPlayState = 'running';

// 	// Add the event listnerers for tap sensing
// 	if (is_touch_device()) {
// 		window.addEventListener('touchstart', tap);
// 	} else {
// 		window.addEventListener('mousedown', tap);
// 		window.onkeypress = e => {
// 			if (e.keyCode == 32) tap(e);
// 		};
// 	}
// }
// function stopPlay() {
// 	state = 'stopped';
// 	if (score > window.localStorage.best) window.localStorage.best = score;
// 	compose(playBtn, animateBall, scoreField, finalScore, best)();
// }

// function tap(e) {
// 	e.preventDefault();
// 	e.stopPropagation();
// 	const ballAngle = getBallAngle();
// 	// adding a 5 for better accuracy as the arc stroke extends beyond the angle.
// 	if (ballAngle + 6 > arc[0] && ballAngle - 6 < arc[1]) {
// 		score++;
// 		compose(scoreField, animateBall, setArc)();
// 	} else stopPlay();
// }
// document.getElementById('play').addEventListener('click', startPlay);

// // Set an initial arc just for aesthetics
// setArc();

// // set best localstorage if there is not localstorage variable
// if (!window.localStorage.best) window.localStorage.best = 0;

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/sw.js');
}
