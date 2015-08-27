// ==UserScript==
// @name           Simplenote Accessibility Fixes
// @namespace      http://axSGrease.nvaccess.org/
// @description    Improves the accessibility of Simplenote.
// @author         James Teh <jamie@nvaccess.org>
// @copyright 2015 NV Access Limited
// @license GNU General Public License version 2.0
// @version        2015.1
// @grant GM_log
// @include https://app.simplenote.com/
// ==/UserScript==

function init() {
	var elem;

	if (elem = document.querySelector(".notes")) {
		// Notes list.
		elem.setAttribute("role", "list region");
		elem.setAttribute("aria-label", "Notes");
	}

	if (elem = document.querySelector(".note")) // The note itself.
		elem.setAttribute("role", "main");

	for (var elem of document.querySelectorAll(".button"))
		elem.setAttribute("role", "button");

	if (elem = document.querySelector(".searchfield")) // Search box.
		elem.setAttribute("role", "search");
}

function onNodeAdded(target) {
	var elem;

	if (target.id === "details_form") {
		// The Info screen just appeared.
		// Focus the "Pin to top" check box (the first focusable item therein).
		if (elem = document.getElementById("details_pinned_chk"))
			elem.focus();
	}
}

function onClassModified(target) {
	var classes = target.classList;
	if (!classes)
		return;
	if (classes.contains("button"))
		target.setAttribute("aria-pressed", classes.contains("active") ? "true" : "false");
}

var observer = new MutationObserver(function(mutations) {
	for (var mutation of mutations) {
		try {
			if (mutation.type === "childList") {
				for (var node of mutation.addedNodes) {
					if (node.nodeType != Node.ELEMENT_NODE)
						continue;
					onNodeAdded(node);
				}
			} else if (mutation.type === "attributes") {
				if (mutation.attributeName == "class")
					onClassModified(mutation.target);
			}
		} catch (e) {
			// Catch exceptions for individual mutations so other mutations are still handled.
			GM_log("Exception while handling mutation: " + e);
		}
	}
});
observer.observe(document, {childList: true, attributes: true,
	subtree: true, attributeFilter: ["class"]});

init();
