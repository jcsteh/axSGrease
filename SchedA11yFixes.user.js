// ==UserScript==
// @name           Sched Accessibility Fixes
// @namespace      http://axSgrease.nvaccess.org/
// @description    Improves the accessibility of Sched.
// @author         James Teh <jteh@mozilla.com>
// @copyright 2018 Mozilla Corporation
// @license Mozilla Public License version 2.0
// @version        2018.1
// @grant GM_log
// @include https://*.sched.com/*
// ==/UserScript==

/*** Functions for common tweaks. ***/

function makeHeading(el, level) {
	el.setAttribute("role", "heading");
	el.setAttribute("aria-level", level);
}

function makeRegion(el, label) {
	el.setAttribute("role", "region");
	el.setAttribute("aria-label", label);
}

function makeButton(el, label) {
	el.setAttribute("role", "button");
	el.setAttribute("aria-label", label);
}

function makePresentational(el) {
	el.setAttribute("role", "presentation");
}

function setLabel(el, label) {
	el.setAttribute("aria-label", label);
}

function makeHidden(el) {
	el.setAttribute("aria-hidden", "true");
}

function setExpanded(el, expanded) {
	el.setAttribute("aria-expanded", expanded ? "true" : "false");
}

/*** Code to apply the tweaks when appropriate. ***/

function applyTweak(el, tweak) {
	if (Array.isArray(tweak.tweak)) {
		let [func, ...args] = tweak.tweak;
		func(el, ...args);
	} else {
		tweak.tweak(el);
	}
}

function applyTweaks(root, tweaks, checkRoot) {
	for (let tweak of tweaks) {
		for (let el of root.querySelectorAll(tweak.selector)) {
			applyTweak(el, tweak);
		}
		if (checkRoot && root.matches(tweak.selector)) {
			applyTweak(root, tweak);
		}
	}
}

function init() {
	applyTweaks(document, LOAD_TWEAKS, false);
	applyTweaks(document, DYNAMIC_TWEAKS, false);
}

let observer = new MutationObserver(function(mutations) {
	for (let mutation of mutations) {
		try {
			if (mutation.type === "childList") {
				for (let node of mutation.addedNodes) {
					if (node.nodeType != Node.ELEMENT_NODE) {
						continue;
					}
					applyTweaks(node, DYNAMIC_TWEAKS, true);
				}
			} else if (mutation.type === "attributes") {
				if (mutation.attributeName == "class") {
					applyTweaks(mutation.target, DYNAMIC_TWEAKS, true);
				}
			}
		} catch (e) {
			// Catch exceptions for individual mutations so other mutations are still handled.
			GM_log("Exception while handling mutation: " + e);
		}
	}
});
observer.observe(document, {childList: true, attributes: true,
	subtree: true, attributeFilter: ["class"]});

/*** Define the actual tweaks. ***/

// Tweaks that only need to be applied on load.
const LOAD_TWEAKS = [
	{selector: '#sched-logo a',
		tweak: [setLabel, "Home"]},
	{selector: '.sched-share-mobile',
		tweak: [setLabel, "Mobile App + iCal"]},
	{selector: '.sched-container-header',
		tweak: [makeHeading, 2]},
	// Text on event pages which says "Click here to add to My Sched". Redundant
	// because clicking it does nothing and the actual button is labeled below.
	{selector: '#add-reminder',
		tweak: makeHidden},
	// Avatars are unlabelled. They have tool tips, but they get assigned to
	// aria-describedby and only after mouse hover.
	// Fortunately, the tool tip text is stored in an "oldtitle" attribute.
	{selector: '.sched-avatar',
		tweak: el => {
			let label = el.getAttribute("oldtitle");
			if (label) {
				el.setAttribute("aria-label", label);
			}
		}},
]

// Tweaks that must be applied whenever a node is added/changed.
const DYNAMIC_TWEAKS = [
	{selector: ':not(.sub)>.ev-save',
		tweak: [makeButton, "Add to My Sched"]},
	{selector: '.sub>.ev-save',
		tweak: [makeButton, "Remove from My Sched"]},
	{selector: '.dropdown:not(.open)>.dropdown-toggle',
		tweak: [setExpanded, false]},
	{selector: '.dropdown.open>.dropdown-toggle',
		tweak: [setExpanded, true]},
]

/*** Lights, camera, action! ***/
init();
