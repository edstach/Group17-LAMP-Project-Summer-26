// Contact CRUD for contacts.html — talks to the LAMPAPI endpoints and is
// scoped to the logged-in user (userId comes from the session cookie via app.js).

let searchTimer = null;
let pendingDeleteId = null;

document.addEventListener("DOMContentLoaded", function () {
	// Bounce to the login page if there is no valid session.
	if (!requireSession()) {
		return;
	}

	// Show the real logged-in user instead of "Demo User".
	document.getElementById("userName").textContent = firstName + " " + lastName;

	// Load THIS account's contacts.
	loadContacts("");
});

// Type-to-search with a small debounce.
function onSearchInput() {
	clearTimeout(searchTimer);
	searchTimer = setTimeout(searchContacts, 300);
}

function searchContacts() {
	let searchText = document.getElementById("searchText").value.trim();
	loadContacts(searchText);
}

// Always a fresh server round-trip, scoped to this user. The list is cleared
// before rendering so one account never shows another account's contacts.
async function loadContacts(search) {
	showMessage("contactSearchResult", "Searching...", false);

	try {
		let data = await apiPost("SearchContacts", { search: search, userId: userId });
		let results = data.results || [];
		renderContacts(results);

		if (results.length === 0) {
			showMessage("contactSearchResult", "0 contacts found.", false);
		} else {
			showMessage(
				"contactSearchResult",
				results.length + " contact" + (results.length === 1 ? "" : "s") + " found.",
				false
			);
		}
	} catch (err) {
		renderContacts([]);
		showMessage("contactSearchResult", err.message, true);
	}
}

function renderContacts(contacts) {
	let list = document.getElementById("contactList");
	list.innerHTML = "";

	if (contacts.length === 0) {
		list.innerHTML = '<li class="empty-state">No contacts to show. Add one above or try a different search.</li>';
		return;
	}

	for (let i = 0; i < contacts.length; i++) {
		let c = contacts[i];

		let details = [];
		if (c.phone) details.push("Phone: " + escapeHtml(c.phone));
		if (c.email) details.push("Email: " + escapeHtml(c.email));
		if (c.mediaUsername) details.push("Social: " + escapeHtml(c.mediaUsername));

		let li = document.createElement("li");
		li.className = "contact-card";
		li.innerHTML =
			'<div class="contact-info">' +
				'<p class="contact-name">' + escapeHtml(c.firstName) + " " + escapeHtml(c.lastName) + "</p>" +
				'<p class="contact-detail">' + (details.length ? details.join(" &bull; ") : "No extra details saved.") + "</p>" +
			"</div>" +
			'<div class="contact-actions">' +
				'<button type="button" class="btn btn-small">Edit</button>' +
				'<button type="button" class="btn btn-small btn-danger-outline">Delete</button>' +
			"</div>";

		// Wire the buttons to THIS specific contact.
		let buttons = li.querySelectorAll("button");
		buttons[0].onclick = function () { openEdit(c); };
		buttons[1].onclick = function () { openDelete(c); };

		list.appendChild(li);
	}
}

// --- Add ---

async function addContact(event) {
	event.preventDefault();
	showMessage("contactAddResult", "", false);

	let social = document.getElementById("addSocialMedia").value.trim();

	let payload = {
		userId: userId,
		firstName: document.getElementById("addFirstName").value.trim(),
		lastName: document.getElementById("addLastName").value.trim(),
		phone: document.getElementById("addPhone").value.trim(),
		email: document.getElementById("addEmail").value.trim(),
		// The backend stores social media as four separate fields. We collect a
		// single string, so it goes in mediaUsername and the rest stay blank.
		mediaApp: "",
		mediaUsername: social,
		mediaIsLink: "0",
		mediaLink: ""
	};

	if (payload.firstName === "" || payload.lastName === "") {
		showMessage("contactAddResult", "Please enter at least a first and last name.", true);
		return;
	}

	try {
		let data = await apiPost("AddContact", payload);
		if (data.error && data.error.trim() !== "") {
			showMessage("contactAddResult", data.error, true);
			return;
		}
		document.getElementById("addContactForm").reset();
		showMessage("contactAddResult", "Contact added successfully.", false);
		loadContacts(document.getElementById("searchText").value.trim());
	} catch (err) {
		showMessage("contactAddResult", err.message, true);
	}
}

// --- Edit ---

function openEdit(c) {
	document.getElementById("editId").value = c.id;
	document.getElementById("editFirstName").value = c.firstName || "";
	document.getElementById("editLastName").value = c.lastName || "";
	document.getElementById("editPhone").value = c.phone || "";
	document.getElementById("editEmail").value = c.email || "";
	document.getElementById("editSocialMedia").value = c.mediaUsername || "";
	showMessage("editResult", "", false);
	openOverlay("editOverlay");
	document.getElementById("editFirstName").focus();
}

function closeEdit() {
	closeOverlay("editOverlay");
}

async function saveEdit(event) {
	event.preventDefault();

	let social = document.getElementById("editSocialMedia").value.trim();

	let payload = {
		contactId: document.getElementById("editId").value,
		userId: userId,
		firstName: document.getElementById("editFirstName").value.trim(),
		lastName: document.getElementById("editLastName").value.trim(),
		phone: document.getElementById("editPhone").value.trim(),
		email: document.getElementById("editEmail").value.trim(),
		mediaApp: "",
		mediaUsername: social,
		mediaIsLink: "0",
		mediaLink: ""
	};

	if (payload.firstName === "" || payload.lastName === "") {
		showMessage("editResult", "First and last name are required.", true);
		return;
	}

	try {
		let data = await apiPost("EditContact", payload);
		if (data.error && data.error.trim() !== "") {
			showMessage("editResult", data.error, true);
			return;
		}
		closeEdit();
		loadContacts(document.getElementById("searchText").value.trim());
	} catch (err) {
		showMessage("editResult", err.message, true);
	}
}

// --- Delete (the one allowed confirmation) ---

function openDelete(c) {
	pendingDeleteId = c.id;
	document.getElementById("deleteText").textContent =
		"Delete " + c.firstName + " " + c.lastName + "? This action cannot be undone.";
	openOverlay("deleteOverlay");
}

function closeDelete() {
	pendingDeleteId = null;
	closeOverlay("deleteOverlay");
}

async function confirmDelete() {
	if (pendingDeleteId === null) {
		return;
	}
	try {
		await apiPost("DeleteContact", { contactId: pendingDeleteId, userId: userId });
		closeDelete();
		loadContacts(document.getElementById("searchText").value.trim());
	} catch (err) {
		closeDelete();
		showMessage("contactSearchResult", err.message, true);
	}
}

// --- Small helpers ---

function showMessage(id, message, isError) {
	let element = document.getElementById(id);
	element.textContent = message;
	element.classList.toggle("is-error", isError);
	element.classList.toggle("is-ok", !isError && message !== "");
}

function openOverlay(id) {
	let el = document.getElementById(id);
	el.classList.remove("is-hidden");
	el.hidden = false;
}

function closeOverlay(id) {
	let el = document.getElementById(id);
	el.classList.add("is-hidden");
	el.hidden = true;
}

// Close any open modal with Escape.
document.addEventListener("keydown", function (e) {
	if (e.key === "Escape") {
		closeEdit();
		closeDelete();
	}
});
