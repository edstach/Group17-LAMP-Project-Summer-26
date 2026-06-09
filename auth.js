if (readCookie())
{
	window.location.href = "contacts.html";
}

function showAuthTab(which)
{
	let isLogin = which === "login";
	document.getElementById("loginTab").classList.toggle("is-active", isLogin);
	document.getElementById("registerTab").classList.toggle("is-active", !isLogin);
	document.getElementById("loginTab").setAttribute("aria-selected", String(isLogin));
	document.getElementById("registerTab").setAttribute("aria-selected", String(!isLogin));
	document.getElementById("authTabs").classList.toggle("show-register", !isLogin);

	showPanel("loginPanel", isLogin, "from-left");
	showPanel("registerPanel", !isLogin, "from-right");
	document.getElementById("loginResult").innerHTML = "";
	document.getElementById("registerResult").innerHTML = "";
}

function showPanel(id, show, slideClass)
{
	let el = document.getElementById(id);
	el.classList.remove("from-left", "from-right");
	el.classList.toggle("is-hidden", !show);
	el.hidden = !show;
	if (show)
	{
		void el.offsetWidth;
		el.classList.add(slideClass);
	}
}

function setMsg(id, text, isError)
{
	let el = document.getElementById(id);
	el.textContent = text;
	el.classList.toggle("is-error", isError);
	el.classList.toggle("is-ok", !isError && text != "");
}

function doLogin(event)
{
	event.preventDefault();

	let login = document.getElementById("loginName").value.trim();
	let password = document.getElementById("loginPassword").value;

	setMsg("loginResult", "", false);

	if (login == "" || password == "")
	{
		setMsg("loginResult", "Please enter your username and password.", true);
		return;
	}

	let tmp = {login:login, password:password};
	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + "/Login." + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function()
		{
			if (this.readyState == 4 && this.status == 200)
			{
				if (!xhr.responseText.trim()) {
					setMsg("loginResult", "Error: Server returned an empty response.", true);
					return;
				}

				let jsonObject = JSON.parse(xhr.responseText);
				userId = jsonObject.id;

				if (userId < 1)
				{
					setMsg("loginResult", "Username / password combination incorrect.", true);
					return;
				}

				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;
				saveCookie();
				window.location.href = "contacts.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		setMsg("loginResult", err.message, true);
	}
}

function doRegister(event)
{
	event.preventDefault();

	let regFirst = document.getElementById("regFirst").value.trim();
	let regLast = document.getElementById("regLast").value.trim();
	let login = document.getElementById("regLogin").value.trim();
	let password = document.getElementById("regPassword").value;

	setMsg("registerResult", "", false);

	if (regFirst == "" || regLast == "" || login == "" || password == "")
	{
		setMsg("registerResult", "Please fill in every field.", true);
		return;
	}

	let tmp = {firstName:regFirst, lastName:regLast, login:login, password:password};
	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + "/Register." + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function()
		{
			if (this.readyState == 4 && this.status == 200)
			{
				if (!xhr.responseText.trim()) {
					setMsg("registerResult", "Error: Server returned an empty response.", true);
					return;
				}

				let jsonObject = JSON.parse(xhr.responseText);

				if (jsonObject.error && jsonObject.error != "")
				{
					setMsg("registerResult", jsonObject.error, true);
					return;
				}

				showAuthTab("login");
				document.getElementById("loginName").value = login;
				setMsg("loginResult", "Account created! Log in to continue.", false);
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		setMsg("registerResult", err.message, true);
	}
}

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime() + (minutes * 60 * 1000));
	document.cookie = `firstName=${firstName},lastName=${lastName},userId=${userId};expires=${date.toGMTString()};path=/`;
}

function readCookie() 
{
	userId = -1;
	let data = document.cookie;
	if (!data) return false;
	
	let splits = data.split(";"); 
	
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		
		if(tokens[0] == "userId") 
		{
			userId = parseInt(tokens[1].trim());
		}
		else if(tokens[0] == "firstName") 
		{
			firstName = tokens[1].trim();
		}
		else if(tokens[0] == "lastName") 
		{
			lastName = tokens[1].trim();
		}
	}
	
	return userId > 0;
}
