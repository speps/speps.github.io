const canvas = document.getElementById(canvas_id);
const ctx = canvas.getContext("2d");

const sizeX = 64;
const sizeZ = 256;
const width = 1024;
const marginLeft = Math.floor((canvas.width - width) >> 1);
const marginTop = 0;
const scale = Math.round(width / sizeX);

let values = [];
for (var i = 0; i < sizeX; i++) {
	const x = i / sizeX;
	values.push(25*x*(x-0.25)*(x-0.5)*(x-0.75)*(x-1));
}

let mouseDown = false;
let mousePrevPos = undefined;

canvas.onmousedown = function(event) {
	if (event.button == 0) {
		mouseDown = true;
	}
};

canvas.onmouseup = canvas.onmouseleave = canvas.onmouseout = function(event) {
	mouseDown = false;
};

canvas.onmousemove = function(event) {
	if (!mouseDown) return;
	const rect = canvas.getBoundingClientRect();
	const x = Math.floor(event.clientX - rect.left - marginLeft);
	const z = Math.floor(event.clientY - rect.top - marginTop);
	const pos = Math.floor(x / scale);
	const prevPos = mousePrevPos || pos;
	if (pos > prevPos) {
		for (var i = prevPos; i < pos; i++) {
			if (i >= 0 && i < sizeX && z >= 0 && z < sizeZ) {
				values[i] = z / sizeZ - 0.5;
			}
		}
	} else if (prevPos > pos) {
		for (var i = pos; i < prevPos; i++) {
			if (i >= 0 && i < sizeX && z >= 0 && z < sizeZ) {
				values[i] = z / sizeZ - 0.5;
			}
		}
	}
	update();
	mousePrevPos = pos;
};

function fwt53(v) {
	const n = v.length;
	let x = Array.from(v);
	let a = 0;

	// predict 1
	a = -0.5;
	for (var i = 1; i < n - 2; i += 2) {
		x[i] += a * (x[i - 1] + x[i + 1]);
	}
	x[n - 1] += 2 * a * x[n - 2];

	// update 1
	a = 0.25;
	for (var i = 2; i < n; i += 2) {
		x[i] += a * (x[i - 1] + x[i + 1]);
	}
	x[0] += 2 * a * x[1];

	// scale
	a = Math.sqrt(2);
	for (var i = 0; i < n; i++) {
		if (i % 2 == 0) x[i] *= a;
		else x[i] /= a;
	}

	// pack
	let temp = Array.from(x);
	for (var i = 0; i < n; i++) {
		if (i % 2 == 0) temp[Math.floor(i / 2)] = x[i];
		else temp[Math.floor(n / 2 + i / 2)] = x[i];
	}
	for (var i = 0; i < n; i++) {
		x[i] = temp[i];
	}
	return x;
}

function iwt53(v) {
	const n = v.length;
	let x = Array.from(v);
	let a = 0;

	let temp = Array.from(x);
	for (var i = 0; i < Math.floor(n / 2); i++) {
		temp[i * 2] = x[i];
		temp[i * 2 + 1] = x[i + Math.floor(n / 2)];
	}
	for (var i = 0; i < n; i++) {
		x[i] = temp[i];
	}

	// undo scale
	a = 1 / Math.sqrt(2);
	for (var i = 0; i < n; i++) {
		if (i % 2 == 0) x[i] *= a;
		else x[i] /= a;
	}

	// undo update 1
	a = -0.25;
	for (var i = 2; i < n; i += 2) {
		x[i] += a * (x[i - 1] + x[i + 1]);
	}
	x[0] += 2 * a * x[1];

	// undo predict 1
	a = 0.5;
	for (var i = 1; i < n - 2; i += 2) {
		x[i] += a * (x[i - 1] + x[i + 1]);
	}
	x[n - 1] += 2 * a * x[n - 2];

	return x;
}

function drawValues(left, top, v, color, text) {
	ctx.strokeStyle = '#aaa';
	ctx.strokeRect(left, top, width, sizeZ);

	for (var i = 0; i < sizeX; i++) {
		const x = left + (i + 0.5) * scale;
		const z = top + (v[i] + 0.5) * sizeZ;
		ctx.beginPath();
		ctx.strokeStyle = '#aaa';
		ctx.moveTo(x, z);
		ctx.lineTo(x, top + sizeZ);
		ctx.stroke();
		ctx.beginPath();
		ctx.fillStyle = color;
		ctx.ellipse(x, z, 4, 4, 0, 0, 2 * Math.PI);
		ctx.fill();
	}

	ctx.fillStyle = '#000';
	ctx.font = "10pt monospace";
	ctx.fillText(text, left + 10, top + 20);
}

function update() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	drawValues(marginLeft, marginTop, values, '#999', "Original values (click to change values)");
	let coeffs0 = fwt53(values);
	drawValues(marginLeft, marginTop + sizeZ, coeffs0, '#090', "DWT53 applied once");
	let coeffs1 = fwt53(coeffs0);
	drawValues(marginLeft, marginTop + sizeZ * 2, coeffs1, '#009', "DWT53 applied twice");
	let coeffs5 = fwt53(fwt53(fwt53(fwt53(coeffs1))));
	drawValues(marginLeft, marginTop + sizeZ * 3, coeffs5, '#900', "DWT53 applied until one approximation coefficient left");

	let recons = iwt53(iwt53(iwt53(iwt53(iwt53(iwt53(coeffs5))))));
	drawValues(marginLeft, marginTop + sizeZ * 4, recons, '#990', "Reconstructed values");
}

update();
