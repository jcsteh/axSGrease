// ==UserScript==
// @name           Review Board Accessibility Fixes
// @namespace      http://axSGrease.nvaccess.org/
// @description    Improves the accessibility of Review Board.
// @author         James Teh <jamie@nvaccess.org>
// @copyright 2016 NV Access Limited
// @license GNU General Public License version 2.0
// @version        2016.1
// @grant GM_log
// @include https://reviewboard.*/r/*/diff/*
// ==/UserScript==

function tweakSideBySide(side) {
	// Make the diff file name into a heading instead of a table header.
	// Among other things, this prevents it from being reported as a header for every cell.
	var elem = side.querySelector('thead th');
	if (elem) {
		elem.setAttribute("role", "heading");
		elem.setAttribute("aria-level", "2");
	}
	// Similarly, don't treat the revision cells as headers.
	for (elem of side.querySelectorAll(".revision-col"))
		elem.setAttribute("role", "cell");

	// For changed lines, prefix the right hand line number with off-screen text indicating the type of change.
	for (var tbody of side.querySelectorAll("tbody.insert,tbody.replace")) {
		for (var th of tbody.querySelectorAll("tr th:nth-child(3)"))
			th.innerHTML = '<span style="position: absolute; left: -10000px;">' + tbody.className + '</span> ' + th.innerHTML;
	}
}

function onNodeAdded(target) {
	if (target.classList.contains("sidebyside"))
		tweakSideBySide(target);
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
			}
		} catch (e) {
			// Catch exceptions for individual mutations so other mutations are still handled.
			GM_log("Exception while handling mutation: " + e);
		}
	}
});
observer.observe(document, {childList: true, subtree: true});
