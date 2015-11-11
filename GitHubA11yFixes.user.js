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
	for (elem of target.querySelectorAll(".select-menu-item")) {
		elem.setAttribute("role", "menuitem");
		onSelectMenuItemChanged(elem);
	}
}

function onClassModified(target) {
	var classes = target.classList;
	if (!classes)
		return;
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
