// ==UserScript==
// @name           Google Code Accessibility Fixes
// @namespace      http://www.jantrid.net/axSGrease/
// @description    Improves the accessibility of Google Code.
// @author James Teh <jamie@nvaccess.org>
// @copyright 2014 James Teh
// @license GNU General Public License version 2.0
// @version 0.20140214.01
// @include https://code.google.com/p/*/issues/*
// ==/UserScript==

function fixStar(node) {
	node.setAttribute("role", "checkbox");
	node.setAttribute("aria-checked",
		(node.src.indexOf("star_on.gif") == -1) ? "false" : "true");
}

var observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		try {
			if (mutation.type === "attributes") {
				if (mutation.attributeName == "src" && mutation.target.id == "star")
					fixStar(mutation.target);
			}
		} catch (e) {
			// Catch exceptions for individual mutations so other mutations are still handled.
			GM_log("Exception while handling mutation: " + e);
		}
	});
});
observer.observe(document, {attributes: true,
	subtree: true, attributeFilter: ["src"]});
fixStar(document.getElementById("star"));
