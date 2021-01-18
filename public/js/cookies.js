document.getElementById("cookie-form").onsubmit = function(e){
 	e.preventDefault();
	document.getElementsByClassName("cookieAcc")[0].style.display="none";
	document.getElementsByTagName("body")[0].style.overflow="auto";
	document.getElementsByClassName("login")[0].style.display="block";
	setCookie('clicked',true,365);
}

function setCookie(CookieName, CookieValue, expirationDays) {
	let date = new Date();
	date.setTime(date.getTime() + (expirationDays*24*60*60*1000));
	let expires = "expires="+ date.toUTCString();
	document.cookie = CookieName + "=" + CookieValue + ";" + expires + ";path=/";
}

function getCookie(CookieName) {
	let name = CookieName+"=";
	let cookies = decodeURIComponent(document.cookie).split(';');//speciální znaky a split
	for(let i = 0; i <cookies.length; i++){
		let c = cookies[i];
		while (c.charAt(0) == ' ')//mezery pryc
			c = c.substring(1);
		if (c.indexOf(name) == 0)//return
			return c.substring(name.length, c.length);
	}
	return "";
}