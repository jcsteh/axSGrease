// ==UserScript==
// @name           GitHub Accessibility Fixes
// @namespace      http://axSgrease.nvaccess.org/
// @description    Improves the accessibility of GitHub.
// @author         James Teh <jamie@nvaccess.org>
// @copyright 2015 NV Access Limited
// @license GNU General Public License version 2.0
// @version        2015.2
// @grant GM_log
// @include https://github.com/*
// ==/UserScript==

function makeHeading(elem, level) {
	elem.setAttribute("role", "heading");
	elem.setAttribute("aria-level", level);
}

function onSelectMenuItemChanged(target) {
	target.setAttribute("aria-checked", target.classList.contains("selected") ? "true" : "false");
}

function onNodeAdded(target) {
	var elem;
	var res = document.location.href.match(/github.com\/[^\/]+\/[^\/]+\/([^\/]+)(\/?)/);
	if (["issues", "pull"].indexOf(res[1]) >= 0 && res[2] == "/") {
		// Issue or pull request.
		// Comment headers.
		for (elem of target.querySelectorAll(".timeline-comment-header-text, .discussion-item-header"))
			makeHeading(elem, 3);
	} else if (res[1] == "commits") {
		// Commit listing.
		// Commit group headers.
		for (elem of target.querySelectorAll(".commit-group-title"))
			makeHeading(elem, 2);
	} else if (res[1] == "commit" && res[2] == "/") {
		// Single commit.
		if (elem = target.querySelector(".commit-title"))
			makeHeading(elem, 2);
	}

	// Site-wide stuff.
	// Checkable menu items; e.g. in watch and labels pop-ups.
	for (elem of target.querySelectorAll(".select-menu-item")) {
		elem.setAttribute("role", "menuitem");
		onSelectMenuItemChanged(elem);
	}
	// Table lists; e.g. in issue listings.
	for (elem of target.querySelectorAll(".table-list"))
		elem.setAttribute("role", "table");
	for (elem of target.querySelectorAll(".table-list-item"))
		elem.setAttribute("role", "row");
	for (elem of target.querySelectorAll(".table-list-cell"))
		elem.setAttribute("role", "cell");
	// Tables in Markdwn content get display: block, which causes them not to be treated as tables.
	for (elem of target.querySelectorAll(".markdown-body table"))
		elem.setAttribute("role", "table");
	for (elem of target.querySelectorAll(".markdown-body tr"))
		elem.setAttribute("role", "row");
	for (elem of target.querySelectorAll(".markdown-body th"))
		elem.setAttribute("role", "cell");
	for (elem of target.querySelectorAll(".markdown-body td"))
		elem.setAttribute("role", "cell");
}

function onClassModified(target) {
	var classes = target.classList;
	if (!classes)
		return;
	// Checkable menu items; e.g. in watch and labels pop-ups.
	if (classes.contains("select-menu-item"))
		onSelectMenuItemChanged(target);
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

onNodeAdded(document);
