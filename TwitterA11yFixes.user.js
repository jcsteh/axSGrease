// ==UserScript==
// @name           Twitter Accessibility Fixes
// @namespace      http://www.jantrid.net/axSGrease/
// @description    Improves the accessibility of Twitter.
// @author James Teh <jamie@jantrid.net>
// @copyright 2011-2012 James Teh
// @license GNU General Public License version 2.0
// @version 0.20120727.01
// @include        https://twitter.com/*
// @include        http://twitter.com/*
// @homepageURL http://userscripts.org/scripts/show/120210
// @updateURL https://userscripts.org/scripts/source/120210.user.js
// ==/UserScript==

var lastFocusedTweet = null;

function onClassModified(target) {
	var classes = target.classList;
	if (!classes)
		return;
	if (classes.contains("stream-item")) {
		if (classes.contains("hovered-stream-item")) {
			// This tweet just got focus.
			// Twitter doesn't use real focus for this, so screen readers don't know which tweet has focus.
			// Force real focus.
			lastFocusedTweet = target;
			if (!target.getAttribute("tabindex")) {
				// Make the node focusable and accessible.
				target.setAttribute("tabindex", "-1");
				// Unfortunately, changing the role causes Gecko to lag.
			}
			var orig = target.getElementsByClassName("original-tweet")[0];
			target.setAttribute("aria-label", (
				orig.getElementsByClassName("account-group")[0].textContent
				+ orig.getElementsByClassName("js-tweet-text")[0].textContent
				+ orig.getElementsByClassName("context")[0].textContent
				+ orig.getElementsByClassName("time")[0].textContent
			));
			target.setAttribute("aria-expanded",
				(classes.contains("open")) ? "true" : "false");
			target.focus();
		} else
			lastFocusedTweet = null;
	}
}

function onNodeRemoved(target) {
	if (!lastFocusedTweet)
		return;
	if (target.nodeType != Node.ELEMENT_NODE)
		return;
	var classes = target.classList;
	if (!classes)
		return;
	if (classes .contains("twttr-dialog-container")) {
		// A dialog was just dismissed.
		// Focus the last focused tweet.
		lastFocusedTweet.focus();
	}
}

var idCounter = 0;
function onFocus(evt) {
	var target = evt.target;
	if (target == document)
		return;
	var tag = target.tagName;
	var classes = target.classList;

	if (tag == "INPUT" && classes.contains("twttr-hidden-input")) {
		// This is an input field for a confirmation prompt.
		// Pressing enter here will activate the OK button.
		if (target.getAttribute("aria-activedescendant"))
			return;
		// Make the OK button accessible and fake focus on it,
		// which makes much more sense to the user.
		var elm = target.parentNode.getElementsByClassName("primary-btn")[0];
		var id = "ok" + ++idCounter;
		elm.setAttribute("id", id);
		elm.setAttribute("role", "button");
		target.setAttribute("aria-activedescendant", id);

	} else if (tag == "TEXTAREA" && classes.contains("tweet-box")) {
		// This is a tweet box.
		if (target.getAttribute("aria-describedby"))
			return;
		// Make the tweet counter the description of the tweet box for easy access.
		var elm = target.parentNode.parentNode.getElementsByClassName("tweet-counter")[0];
		var id = "counter" + ++idCounter;
		elm.setAttribute("id", id);
		target.setAttribute("aria-describedby", id);
	}
}

var observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		if (mutation.type === "childList") {
			for (var i = 0; i < mutation.removedNodes.length; ++i)
				onNodeRemoved(mutation.removedNodes[i]);
		} else if (mutation.type === "attributes") {
			// This observer only watches the class attribute.
			onClassModified(mutation.target);
		}
	});
});
observer.observe(document, {childList: true, attributes: true,
	subtree: true, attributeFilter: ["class"]});
document.addEventListener("focus", onFocus, true);
