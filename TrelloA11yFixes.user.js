// ==UserScript==
// @name           Trello Accessibility Fixes
// @namespace      http://axSgrease.nvaccess.org/
// @description    Improves the accessibility of Trello.
// @author         James Teh <jamie@nvaccess.org>
// @copyright 2017 NV Access Limited
// @license GNU General Public License version 2.0
// @version        2017.1
// @grant GM_log
// @include https://trello.com/*
// ==/UserScript==

// Used when we need to generate ids for ARIA.
var idCounter = 0;

function tweakCard(card) {
	// Make this a focusable list item.
	card.setAttribute("tabindex", "-1");
	card.setAttribute("role", "listitem");
}

function onNodeAdded(target) {
	if (target.classList.contains("list-card")) {
		// A card just got added.
		tweakCard(target);
		return;
	}
	if (target.classList.contains("badge")) {
		// Label badges.
		var label = target.getAttribute("title");
		// Include the badge count (if any) in the label.
		label += target.textContent;
		target.setAttribute("aria-label", label);
		return;
	}
	for (var list of target.querySelectorAll(".list")) {
		list.setAttribute("role", "list");
		var header = list.querySelector(".list-header-name");
		if (header) {
			// Label the list with its header.
			var id = "axsg-lh" + idCounter++;
			header.setAttribute("id", id);
			list.setAttribute("aria-labelledby", id);
		}
	}
	for (var card of target.querySelectorAll(".list-card")) {
		tweakCard(card);
	}
}

function onClassModified(target) {
	var classes = target.classList;
	if (!classes)
		return;
	if (classes.contains("active-card")) {
		// When the active card changes, focus it.
		target.focus();
	}
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
