// ==UserScript==
// @name           Telegram Accessibility Fixes
// @namespace      http://axSGrease.nvaccess.org/
// @description    Improves the accessibility of Telegram.
// @author         Michael Curran <mick@nvaccess.org>
// @copyright 2017 NV Access Limited
// @license GNU General Public License version 2.0
// @version        2017.1
// @grant GM_log
// @include https://web.telegram.org/*
// ==/UserScript==

function init() {
	var elem;

	if (elem = document.querySelector(".im_history_messages_peer")) {
		// Chat history.
		elem.setAttribute("aria-live", "polite");
	}
}

function onNodeAdded(target) {
	if(target.classList.contains('im_content_message_wrap')) {
		target.setAttribute("aria-live", "polite");
	}
}

function onClassModified(target) {
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
