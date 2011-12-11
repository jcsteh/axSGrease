// ==UserScript==
// @name           Kill Windowless Flash
// @namespace      http://www.jantrid.net/gmScripts/
// @description    Makes windowless (transparent or opaque) Adobe Flash objects windowed so they have a chance of being accessible.
// @author James Teh <jamie@jantrid.net>
// @version 0.20111126.02
// ==/UserScript==

function killWindowlessFlash() {
	// First, deal with embed elements.
	var elms = document.getElementsByTagName("embed");
	for (var i = 0; i < elms.length; ++i) {
		var elm = elms[i];
		if (elm.getAttribute("type") != "application/x-shockwave-flash")
			continue;
		if (elm.getAttribute("wmode") == "window")
			continue;
		elm.setAttribute("wmode", "window");
		// Parameters are only read when Flash is loaded,
		// so reinsert the element to reload it.
		elm.parentNode.replaceChild(elm, elm);
	}

	// Now, deal with object elements.
	var elms = document.getElementsByTagName("object");
	for (var i = 0; i < elms.length; ++i) {
		var elm = elms[i];
		if (elm.getAttribute("type") != "application/x-shockwave-flash")
			continue;
		var params = elm.getElementsByTagName("param");
		for (var j = 0; j < params.length; ++j) {
			var param = params[j];
			if (param.getAttribute("name") != "wmode")
				continue;
			if (param.getAttribute("value") == "window")
				continue;
			param.setAttribute("value", "window");
			// Parameters are only read when Flash is loaded,
			// so reinsert the element to reload it.
			elm.parentNode.replaceChild(elm, elm);
			break;
		}
	}
}

function onLoad(evt) {
	killWindowlessFlash();
}

window.addEventListener("load", onLoad);
