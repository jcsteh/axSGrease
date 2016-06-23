// ==UserScript==
// @name           GitHub Accessibility Fixes
// @namespace      http://axSgrease.nvaccess.org/
// @description    Improves the accessibility of GitHub.
// @author         James Teh <jamie@nvaccess.org>
// @copyright 2015-2016 NV Access Limited
// @license GNU General Public License version 2.0
// @version        2016.1
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

function onDropdownChanged(target) {
	target.firstElementChild.setAttribute("aria-haspopup", "true");
	var expanded = target.classList.contains("active");
	target.children[0].setAttribute("aria-expanded",  expanded ? "true" : "false");
	var items = target.children[1];
	if (expanded) {
		items.removeAttribute("aria-hidden");
		// Focus the first item.
		var elem = items.querySelector("a,button");
		if (elem)
			elem.focus();
	} else {
		// Make sure the items are hidden.
		items.setAttribute("aria-hidden", "true");
	}
}

// Used when we need to generate ids for ARIA.
var idCounter = 0;

function onNodeAdded(target) {
	var elem;
	var res = document.location.href.match(/github.com\/[^\/]+\/[^\/]+(?:\/([^\/]+))?(?:\/([^\/]+))?(?:\/([^\/]+))?(?:\/([^\/]+))?/);
	// res[1] to res[4] are 4 path components of the URL after the project.
	// res[1] will be "issues", "pull", "commit", etc.
	// Empty path components will be undefined.
	if (["issues", "pull", "commit"].indexOf(res[1]) >= 0 && res[2]) {
		// Issue, pull request or commit.
		// Comment headers.
		for (elem of target.querySelectorAll(".timeline-comment-header-text, .discussion-item-header"))
			makeHeading(elem, 3);
	}
	if (res[1] == "commits" || (res[1] == "pull" && res[3] == "commits" && !res[4])) {
		// Commit listing.
		// Commit group headers.
		for (elem of target.querySelectorAll(".commit-group-title"))
			makeHeading(elem, 2);
	} else if ((res[1] == "commit" && res[2]) || (res[1] == "pull" && res[3] == "commits" && res[4])) {
		// Single commit.
		if (elem = target.querySelector(".commit-title"))
			makeHeading(elem, 2);
	} else if (res[1] == "blob") {
		// Viewing a single file.
		// Ensure the table never gets treated as a layout table.
		if (elem = target.querySelector(".js-file-line-container"))
			elem.setAttribute("role", "table");
	} else if (res[1] == "tree" || !res[1]) {
		// A file list is on this page.
		// Ensure the table never gets treated as a layout table.
		if (elem = target.querySelector(".files"))
			elem.setAttribute("role", "table");
	}
	if (["pull", "commit"].indexOf(res[1]) >= 0 && res[2]) {
		// Pull request or commit.
		// Header for each changed file.
		for (elem of target.querySelectorAll(".file-info"))
			makeHeading(elem, 2);
		// Lines of code which can be commented on.
		for (elem of target.querySelectorAll(".add-line-comment")) {
			// Put the comment button after the code instead of before.
			// elem is the Add line comment button.
			elem.setAttribute("id", "axsg-alc" + idCounter);
			// nextElementSibling is the actual code.
			elem.nextElementSibling.setAttribute("id", "axsg-l" + idCounter);
			// Reorder children using aria-owns.
			elem.parentNode.setAttribute("aria-owns", "axsg-l" + idCounter + " axsg-alc" + idCounter);
			++idCounter;
		}
		// Make sure diff tables never get treated as a layout table.
		for (elem of target.querySelectorAll(".diff-table"))
			elem.setAttribute("role", "table");
	}

	// Site-wide stuff.
	// Checkable menu items; e.g. in watch and labels pop-ups.
	for (elem of target.querySelectorAll(".select-menu-item")) {
		elem.setAttribute("role", "menuitem");
		onSelectMenuItemChanged(elem);
	}
	// Table lists; e.g. in issue and commit listings.
	for (elem of target.querySelectorAll(".table-list,.Box-body"))
		elem.setAttribute("role", "table");
	for (elem of target.querySelectorAll(".d-table"))
		elem.setAttribute("role", "presentation");
	for (elem of target.querySelectorAll(".table-list-item,.Box-body-row"))
		elem.setAttribute("role", "row");
	for (elem of target.querySelectorAll(".table-list-cell,.d-table-cell"))
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
	// Tooltipped links (e.g. authors and labels in issue listings) shouldn't get the tooltip as their label.
	for (elem of target.querySelectorAll("a.tooltipped")) {
		if (!elem.textContent || /^\s+$/.test(elem.textContent))
			continue;
		var tooltip = elem.getAttribute("aria-label");
		// This will unfortunately change the visual presentation.
		elem.setAttribute("title", tooltip);
		elem.removeAttribute("aria-label");
	}
	// Dropdowns; e.g. for "Add your reaction".
	if (target.classList && target.classList.contains("dropdown"))
		onDropdownChanged(target);
	else {
		for (elem of target.querySelectorAll(".dropdown"))
			onDropdownChanged(elem);
	}
	// Reactions.
	for (elem of target.querySelectorAll(".add-reactions-options-item"))
		elem.setAttribute("aria-label", elem.getAttribute("data-reaction-label"));
	for (elem of target.querySelectorAll(".user-has-reacted")) {
		var user = elem.getAttribute("aria-label");
		// This will unfortunately change the visual presentation.
		elem.setAttribute("title", user);
		elem.setAttribute("aria-label", user + " " + elem.getAttribute("value"));
	}
}

function onClassModified(target) {
	var classes = target.classList;
	if (!classes)
		return;
	if (classes.contains("select-menu-item")) {
		// Checkable menu items; e.g. in watch and labels pop-ups.
		onSelectMenuItemChanged(target);
	} else if (classes.contains("dropdown")) {
		// Container for a dropdown.
		onDropdownChanged(target);
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

onNodeAdded(document);
