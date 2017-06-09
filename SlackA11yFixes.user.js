// ==UserScript==
// @name           Slack Accessibility Fixes
// @namespace      http://axSgrease.nvaccess.org/
// @description    Improves the accessibility of Slack.
// @author         James Teh <jamie@nvaccess.org>
// @copyright 2017 NV Access Limited
// @license GNU General Public License version 2.0
// @version        2017.1
// @grant GM_log
// @include https://*.slack.com/*
// ==/UserScript==

function initial() {
	var elem;
	// In DOM order, the footer is earlier than the messages.
	// Put it below for a11y (as it appears visually).
	if (elem = document.querySelector("#col_messages"))
		elem.setAttribute("aria-owns", "messages_container footer");
	// Same for the unread messages status, which appears below in DOM order but earlier visually.
	if (elem = document.querySelector("#messages_container")) {
		// We must specify all children so we can guarantee the order.
		// The children have different ids in Firefox and Chrome.
		var owns = "messages_unread_status";
		for (var child of elem.children) {
			if (child.id && child.id != "messages_unread_status") {
				owns += " " + child.id;
			}
		}
		elem.setAttribute("aria-owns", owns);
	}
}

// Make the starred status accessible.
function setStarred(elem) {
	elem.setAttribute("aria-pressed",
		elem.classList.contains("starred") ? "true" : "false");
}

function message(text) {
	var live = document.getElementById("aria_live_announcer");
	live.textContent = text;
}

function onNodeAdded(target) {
	if (target.classList.contains("ts_icon")) {
		// Icon with tooltip such as the options which appear when you mouse over a message.
		target.setAttribute("role", "button");
		target.setAttribute("aria-label", target.getAttribute("title"));
		return;
	}
	if (target.matches(".offscreen[contenteditable]")) {
		// Hidden contentEditable near the bottom which doesn't seem to be relevant to the user.
		target.setAttribute("role", "presentation");
		return;
	}
	// Report incoming messages and make them list items.
	if (target.matches("#msgs_div .message:last-child, #threads_msgs .message:last-child, #convo_container .message:last-child") && !target.classList.contains("unprocessed")) {
		// Just shove text into a live region that's already used for stuff like this.
		// It'd better/less hacky if the messages area itself were a live region,
		// but doing this results in double/triple speaking for some reason.
		// We also don't want the time reported in this case.
		sender = target.querySelector(".message_sender").textContent;
		body = target.querySelector(".message_body").textContent;
		message(sender + " " + body);
		target.setAttribute("role", "listitem");
	}
	var elem;
	// Make existing messages list items.
	for (elem of target.querySelectorAll("#msgs_div .message, #threads_msgs .message, #convo_container .message"))
		elem.setAttribute("role", "listitem");
	for (elem of target.querySelectorAll(".copy_only")) {
		// This includes text such as the brackets around message times.
		// These chunks of text are block elements, even though they're on the same line.
		// Remove the elements from the tree so the text becomes inline.
		elem.setAttribute("role", "presentation");
	}
	// Channel/message star controls.
	for (elem of target.querySelectorAll(".star")) {
		elem.setAttribute("aria-label", "star");
		setStarred(elem);
	}
	// Make headings for day separators in message history, about channel pane heading.
	for (elem of target.querySelectorAll(".day_divider,.heading")) {
		elem.setAttribute("role", "heading");
		elem.setAttribute("aria-level", "2");
	}
	// Kill some extraneous white space.
	for (elem of target.querySelectorAll(".message_gutter, .message_content > i.copy_only br")) {
		elem.setAttribute("aria-hidden", "true");
	}
}

function onClassModified(target) {
	var classes = target.classList;
	if (!classes)
		return;
	if (classes.contains("star")) {
		// Starred state changed.
		setStarred(target);
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

initial();
