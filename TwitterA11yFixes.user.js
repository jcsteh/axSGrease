// ==UserScript==
// @name           Twitter Accessibility Fixes
// @namespace      http://www.jantrid.net/axSGrease/
// @description    Improves the accessibility of Twitter.
// @author James Teh <jamie@jantrid.net>
// @copyright 2011 James Teh
// @license GNU General Public License version 2.0
// @version 0.20111212.01
// @include        https://twitter.com/*
// @include        http://twitter.com/*
// ==/UserScript==

var lastFocusedTweet = null;

function onAttrModified(evt) {
	var attrName = evt.attrName;
	if (attrName != "class")
		return;
	var target = evt.target;
	var classes = target.getAttribute("class");
	if (!classes)
		return;
	if (classes.indexOf(" stream-item") != -1) {
		if (classes.indexOf("hovered-stream-item") != -1) {
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
				+ orig.getElementsByClassName("tweet-stats-container")[0].textContent
				+ orig.getElementsByClassName("metadata")[0].textContent
			));
			target.setAttribute("aria-expanded",
				(classes.indexOf(" open ") == -1) ? "false" : "true");
			target.focus();
		} else
			lastFocusedTweet = null;
	}
}

function onNodeRemoved(evt) {
	if (!lastFocusedTweet)
		return;
	var target = evt.target;
	if (target.nodeType != Node.ELEMENT_NODE)
		return;
	var classes = target.getAttribute("class");
	if (!classes)
		return;
	if (classes == "twttr-dialog-container") {
		// A dialog was just dismissed.
		// Focus the last focused tweet.
		lastFocusedTweet.focus();
	}
}

var idCounter = 0;
function onFocus(evt) {
	var target = evt.target;
	var tag = target.tagName;
	var classes = target.getAttribute("class");

	if (tag == "INPUT" && classes == "twttr-hidden-input") {
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

	} else if (tag == "TEXTAREA" && classes == "twitter-anywhere-tweet-box-editor") {
		// This is a tweet box.
		if (target.getAttribute("aria-describedby"))
			return;
		// Make the tweet counter the description of the tweet box for easy access.
		var elm = target.parentNode.parentNode.parentNode.getElementsByClassName("tweet-counter")[0];
		var id = "counter" + ++idCounter;
		elm.setAttribute("id", id);
		target.setAttribute("aria-describedby", id);
	}
}

document.addEventListener("DOMAttrModified", onAttrModified, false);
document.addEventListener("DOMNodeRemoved", onNodeRemoved, false);
document.addEventListener("focus", onFocus, true);
