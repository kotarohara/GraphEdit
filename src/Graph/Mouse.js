function Mouse () {
	// https://stackoverflow.com/questions/2601097/how-to-get-the-mouse-position-without-events-without-moving-the-mouse
	var self = this;
	var prevCursorX = null, prevCursorY = null;
	var cursorX = null, cursorY = null;
	var frequency = 1000. / 60;

	function handleMouseMove(e) {
		cursorX = e.pageX;
		cursorY = e.pageY;
	}

	function checkCursor () {
		var velocity = self.getVelocity();

		prevCursorX = cursorX;
		prevCursorY = cursorY;

		document.getElementById("mousex").textContent = cursorX;
		document.getElementById("mousey").textContent = cursorY;
		document.getElementById("mousevx").textContent = velocity.x;
		document.getElementById("mousevy").textContent = velocity.y;
	}

	self.getPosition = function () {
		return { x: cursorX, y: cursorY };
	}

	self.getVelocity = function () {
		if (prevCursorX) {
			return {
				x: cursorX - prevCursorX,
			  	y: cursorY - prevCursorY
			  };
		} else {
			return {
				x: 0,
				y: 0
			};
		}
	};

	document.onmousemove = handleMouseMove;
	setInterval(checkCursor, frequency);

	return self;
}