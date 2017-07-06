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

var idCounter = 0;
// Get a node's id. If it doesn't have one, make and set one first.
function setAriaIdIfNecessary(elem) {
	if (elem.id) {
		return elem.id;
	}
	console.log(elem);
	elem.setAttribute("id", "axsg-" + idCounter++);
	return elem.id;
}

function makeElementOwn(parentElement, listOfNodes){
	ids = [];
	for(let node of listOfNodes){
		ids.push(setAriaIdIfNecessary(node));
	}
	parentElement.setAttribute("aria-owns", ids.join(" "));
}

function onSelectMenuItemChanged(target) {
	target.setAttribute("aria-checked", target.classList.contains("selected") ? "true" : "false");
}

function onDropdownChanged(target) {
	target.firstElementChild.setAttribute("aria-haspopup", "true");
	var expanded = target.classList.contains("active");
	target.firstElementChild.setAttribute("aria-expanded",  expanded ? "true" : "false");
	var items = target.children[1];
	if (!items) {
		return;
	}
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


function doGlobal(target){
	var elem;
	// Site-wide stuff.
	// Checkable menu items; e.g. in watch and labels pop-ups.
	if (target.classList.contains("select-menu-item")) {
		target.setAttribute("role", "menuitemcheckbox");
		onSelectMenuItemChanged(target);
	} else {
		for (elem of target.querySelectorAll(".select-menu-item")) {
			elem.setAttribute("role", "menuitemcheckbox");
			onSelectMenuItemChanged(elem);
		}
	}
	// Table lists; e.g. in issue and commit listings.
	for (elem of target.querySelectorAll(".table-list,.Box-body,ul.js-navigation-container"))
		elem.setAttribute("role", "table");
	for (elem of target.querySelectorAll(".table-list-item,.Box-body-row,.Box-row"))
		elem.setAttribute("role", "row");
	for (elem of target.querySelectorAll(".Box-body-row,.Box-row .d-table")) {
		// There's one of these inside every .Box-body-row/Box-row.
		// It's purely presentational.
		elem.setAttribute("role", "presentation");
		// Its children are the cells, but they have no common class.
		for (elem of elem.children)
			elem.setAttribute("role", "cell");
	}
	for (elem of target.querySelectorAll(".table-list-cell"))
		elem.setAttribute("role", "cell");
	// Tables in Markdown content get display: block, which causes them not to be treated as tables.
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

function onNodeAdded(target) {
	var elem;
	if(document.location.pathname.match(/\/(?:[^\/]+\/[^\/]+\/)?notifications\/?/)){
		// Notifications page.
		//First, make sure the h3 with the repo becomes an h2, so we can set the notifications for that repos as an h3.
		for(elem of target.querySelectorAll(".notifications-repo-link"))
			makeHeading(elem.parentNode, 2);
		//Now, set the link marking each notification as an h3.
		for(elem of target.querySelectorAll(".list-group-item-link")){
			// Make the parent span a heading, but aria-owns the image to the end of this heading for niceity.
			makeElementOwn(elem.parentNode, [elem, elem.previousElementSibling]);
			makeHeading(elem.parentNode, 3);
		}
		//firefox   overrides title as if it was aria-label. Remove title here because it might mask the issue contents or other info.
		//This unfortunately breaks visual content, but it doesn't really matter.
		elem.removeAttribute("title"); 
		return;
	}
	var res = document.location.pathname.match(/\/[^\/]+\/[^\/]+(?:\/([^\/?]+))?(?:\/([^\/?]+))?(?:\/([^\/?]+))?(?:\/([^\/?]+))?/);
	//In some cases (main page) res[1] is null. Thou shal not pass.
	if(res[1] === null)
		return;
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
	} else if (res[1] == "compare") {
		// Branch selector buttons.
		// These have an aria-label which masks the name of the branch, so kill it.
		for (elem of target.querySelectorAll("button.select-menu-button"))
			elem.removeAttribute("aria-label");
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
			// nextElementSibling is the actual code.
			// Reorder children using aria-owns.
			makeElementOwn(elem.parentNode, [elem, elem.nextElementSibling]);
		}
		// Make sure diff tables never get treated as a layout table.
		for (elem of target.querySelectorAll(".diff-table"))
			elem.setAttribute("role", "table");
		// Review comment headers.
		for (elem of target.querySelectorAll(".review-comment-contents > strong"))
			makeHeading(elem, 3);
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
					doGlobal(node);
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
doGlobal(document);
