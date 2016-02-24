// ==UserScript==
// @name           Monorail Accessibility Fixes
// @namespace      http://axSGrease.nvaccess.org/
// @description    Improves the accessibility of Google Code.
// @author James Teh <jamie@nvaccess.org>
// @copyright 2016 NV Access Limited
// @license GNU General Public License version 2.0
// @version 2016.1
// @include https://bugs.chromium.org/p/*/issues/*
// ==/UserScript==

function fixStar(node) {
	node.setAttribute("role", "checkbox");
	node.setAttribute("aria-checked",
		(node.src.indexOf("star_on.gif") == -1) ? "false" : "true");
}

function makeHeading(elem, level) {
	elem.setAttribute("role", "heading");
	elem.setAttribute("aria-level", level);
}

function makeHeadings() {
	// Title.
	var elem = document.querySelector(".issueheader");
	makeHeading(elem, 1);

	// Comments.
	for (elem of document.getElementsByClassName("issuecommentheader"))
		makeHeading(elem, 2);

	// Add a comment heading.
	var elem = document.querySelector("#makechanges div.h4");
	makeHeading(elem, 2);
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
makeHeadings();
