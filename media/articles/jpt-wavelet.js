const canvas = document.getElementById(canvas_id);
const ctx = canvas.getContext("2d");

let verts = [];

function newVert(x) {
	const v = {x: x};
	const i = verts.length;
	verts.push(v);
	return i;
}

let root = {
	desc: null,
	v: [newVert(0), newVert(1024)]
};

function getVert(node, i) {
	return verts[node.v[i % 2]];
}

function getDesc(node, i) {
	if (node.desc) {
		return node.desc[i % 2];
	}
	return null;
}

function subdivide(node) {
	const mid = newVert((getVert(node, 0).x + getVert(node, 1).x) >> 1);
	const nodeL = {
		desc: null,
		v: [node.v[0], mid]
	};
	const nodeR = {
		desc: null,
		v: [mid, node.v[1]]
	};
	node.desc = [nodeL, nodeR];
}

function contains(node, x) {
	return x >= getVert(node, 0).x && x < getVert(node, 1).x;
}

function findLeaf(node, x) {
	let search = node;
	while (search.desc) {
		for (var i = 0; i < 2; i++) {
			const desc = getDesc(search, i);
			if (contains(desc, x)) {
				search = desc;
			}
		}

	}
}

canvas.onclick = function(event) {
	const rect = canvas.getBoundingClientRect();
	const x = event.clientX - rect.left;
	const y = event.clientY - rect.top;
	pts.push({x: x, y: y});
	update();
}

function update() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'red';
	for (pt of pts) {
		ctx.beginPath();
		ctx.ellipse(pt.x, pt.y, 10, 10, 0, 0, 2 * Math.PI);
		ctx.fill();
	}
}