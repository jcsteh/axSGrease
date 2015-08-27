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

function tweak(target) {
	var res = document.location.href.match(/github.com\/[^\/]+\/[^\/]+\/([^\/]+)(\/?)/);
	if (["issues", "pull"].indexOf(res[1]) >= 0 && res[2] == "/") {
		// Issue or pull request.
		// Comment headers.
		for (elem of target.querySelectorAll(".timeline-comment-header-text, .discussion-item-header"))
			makeHeading(elem, 3);
	} else if (res[1] == "commits" && res[2] == "/") {
		// Commits.
		// Commit group headers.
		for (elem of target.querySelectorAll(".commit-group-title"))
			makeHeading(elem, 2);
	}
}

var observer = new MutationObserver(function(mutations) {
	for (var mutation of mutations) {
		try {
			if (mutation.type === "childList") {
				for (var node of mutation.addedNodes) {
					if (node.nodeType != Node.ELEMENT_NODE)
						continue;
					tweak(node);
				}
			}
		} catch (e) {
			// Catch exceptions for individual mutations so other mutations are still handled.
			GM_log("Exception while handling mutation: " + e);
		}
	}
});
observer.observe(document, {childList: true, subtree: true});

tweak(document);
