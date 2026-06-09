// Shared config + session + API helpers for Contact Manager.

// Same-origin in production avoids CORS. For local dev against a remote API,
// change this to the full base, e.g. 'https://yourdomain.xyz/LAMPAPI'.
const urlBase = 'https://cis4004-evan5253641.xyz/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = '';
let lastName = '';

// POST a JSON object to an endpoint and resolve with the parsed JSON response.
async function apiPost(endpoint, payload) {
	const res = await fetch(`${urlBase}/${endpoint}.${extension}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json; charset=UTF-8' },
		body: JSON.stringify(payload),
	});
	if (!res.ok) {
		throw new Error(`Server returned ${res.status}`);
	}
	return res.json();
}

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime() + (minutes * 60 * 1000));
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString() + ";path=/";
}

// Reads the session cookie. Returns true if a valid user is present.
function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for (let i = 0; i < splits.length; i++)
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if (tokens[0] == "firstName")
		{
			firstName = tokens[1];
		}
		else if (tokens[0] == "lastName")
		{
			lastName = tokens[1];
		}
		else if (tokens[0] == "userId")
		{
			userId = parseInt(tokens[1]);
		}
	}
	return userId > 0;
}

function clearCookie()
{
	document.cookie = "firstName= ; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
	userId = 0;
	firstName = "";
	lastName = "";
}

// Redirect to login if there is no valid session. Call on protected pages.
function requireSession()
{
	if (!readCookie())
	{
		window.location.href = "index.html";
		return false;
	}
	return true;
}

function doLogout()
{
	clearCookie();
	window.location.href = "index.html";
}

// Build the decorative slime scene: grass field, a roaming blob, top drips,
// and melty drips on cards. Purely cosmetic — hidden from assistive tech.
function buildScene() {
	if (document.querySelector('.scene')) return;

	const scene = document.createElement('div');
	scene.className = 'scene';
	scene.setAttribute('aria-hidden', 'true');

	const grass = document.createElement('div');
	grass.className = 'grass';
	const blades = 24;
	for (let i = 0; i < blades; i++) {
		const blade = document.createElement('span');
		blade.className = 'blade';
		const back = Math.random() < 0.45;
		const h = (back ? 28 : 52) + Math.random() * (back ? 34 : 72);
		const hue = 96 + Math.random() * 28;
		const light = back ? 26 : 42;
		blade.style.left = (i / blades) * 100 + Math.random() * 1.4 + '%';
		blade.style.height = h + 'px';
		blade.style.width = 6 + Math.random() * 5 + 'px';
		blade.style.background = `linear-gradient(to top, hsl(${hue} 70% ${light - 14}%), hsl(${hue} 82% ${light}%))`;
		blade.style.setProperty('--tilt', Math.random() * 12 - 6 + 'deg');
		blade.style.setProperty('--sway', 2.6 + Math.random() * 2.6 + 's');
		blade.style.animationDelay = -Math.random() * 4 + 's';
		blade.style.opacity = back ? '0.6' : '1';
		if (back) blade.style.filter = 'blur(1px)';
		grass.appendChild(blade);
	}

	const blob = document.createElement('div');
	blob.className = 'slime-blob';
	blob.innerHTML = '<span class="eye eye-l"></span><span class="eye eye-r"></span><span class="shine"></span>';

	const topDrips = document.createElement('div');
	topDrips.className = 'top-drips';
	// Many drips spread evenly across the full width (with jitter) so the whole
	// top edge looks like it's oozing.
	const dripCount = Math.max(20, Math.round(window.innerWidth / 42));
	for (let i = 0; i < dripCount; i++) {
		const d = document.createElement('span');
		d.className = 'ooze';
		d.style.left = (i / dripCount) * 100 + Math.random() * (90 / dripCount) + '%';
		d.style.height = 30 + Math.random() * 100 + 'px';
		d.style.setProperty('--dur', 5 + Math.random() * 5 + 's');
		d.style.animationDelay = -Math.random() * 6 + 's';
		topDrips.appendChild(d);
	}

	scene.appendChild(grass);
	scene.appendChild(blob);
	scene.appendChild(topDrips);
	document.body.appendChild(scene);

	document.querySelectorAll('.btn-block').forEach(addButtonOoze);
}

// A few of the same oozing drips (as the top of the screen) hanging off the
// bottom edge of a block button — fewer, evenly spread, with varied length.
function addButtonOoze(btn) {
	const next = btn.nextElementSibling;
	if (next && next.classList.contains('btn-ooze')) return;
	const row = document.createElement('div');
	row.className = 'btn-ooze';
	row.setAttribute('aria-hidden', 'true');
	const n = 5;
	for (let i = 0; i < n; i++) {
		const d = document.createElement('span');
		d.className = 'ooze';
		d.style.left = 9 + (i / (n - 1)) * 82 + (Math.random() * 4 - 2) + '%';
		d.style.height = 22 + Math.random() * 26 + 'px';
		d.style.setProperty('--dur', 4 + Math.random() * 4 + 's');
		d.style.animationDelay = -Math.random() * 5 + 's';
		row.appendChild(d);
	}
	btn.insertAdjacentElement('afterend', row);
}

// Defer the decorative scene until the browser is idle so it never
// interferes with Lighthouse's FCP / TBT / LCP measurement window.
if ('requestIdleCallback' in window) {
	requestIdleCallback(buildScene, { timeout: 2000 });
} else {
	window.addEventListener('load', function() {
		setTimeout(buildScene, 500);
	});
}
// Escape user-supplied text before inserting into innerHTML.
function escapeHtml(str) {
	return String(str ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}