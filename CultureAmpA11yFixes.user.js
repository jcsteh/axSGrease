// ==UserScript==
// @name           Culture Amp Accessibility Fixes
// @namespace      http://axSgrease.nvaccess.org/
// @description    Improves the accessibility of Culture Amp.
// @author         James Teh <jteh@mozilla.com>
// @copyright 2018 Mozilla Corporation
// @license Mozilla Public License version 2.0
// @version        2018.1
// @grant GM_log
// @include https://*.cultureamp.com/*
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
				applyTweaks(mutation.target, DYNAMIC_TWEAKS, true);
			}
		} catch (e) {
			// Catch exceptions for individual mutations so other mutations are still handled.
			GM_log("Exception while handling mutation: " + e);
		}
	}
});

function init() {
	applyTweaks(document, LOAD_TWEAKS, false);
	applyTweaks(document, DYNAMIC_TWEAKS, false);
	observer.observe(document, {childList: true, attributes: DYNAMIC_TWEAK_ATTRIBS.length > 0,
		subtree: true, attributeFilter: DYNAMIC_TWEAK_ATTRIBS});
}

/*** Define the actual tweaks. ***/

// Tweaks that only need to be applied on load.
const LOAD_TWEAKS = [
	// Make individual questions headings.
	{selector: '.question p',
		tweak: [makeHeading, 4]},
	// Answers should be radio buttons.
	{selector: '.option, .heatbarraterRatingUnit',
		tweak: el => el.setAttribute("role", "radio")},
	// The screen reader only text "You Have Answered" appears after each question.
	// It serves absolutely no purpose, so kill it.
	{selector: '.heatbarraterContainer > .screenreader',
		tweak: makeHidden},
]

// Attributes that should be watched for changes and cause dynamic tweaks to be
// applied. For example, if there is a dynamic tweak which handles the state of
// a check box and that state is determined using an attribute, that attribute
// should be included here.
const DYNAMIC_TWEAK_ATTRIBS = ["class", "data-score", "selected"];

// Tweaks that must be applied whenever a node is added/changed.
const DYNAMIC_TWEAKS = [
	// Expose whether a survey section is expanded or collapsed.
	{selector: '.survey > li',
		tweak: section => {
			let heading = section.querySelector("h3");
			if (!heading) return;
			let expanded = section.classList.contains("selected");
			heading.setAttribute("aria-expanded", expanded ? "true" : "false");
		}},
	// Expose whether an answer is selected.
	{selector: '.option',
		tweak: option => {
			let checked = option.classList.contains("on");
			option.setAttribute("aria-checked", checked ? "true" : "false");
		}},
	{selector: '.heatbarraterContainer',
		tweak: container => {
			// Individual options don't have an attribute we can use to determine
			// selection. However, the container does.
			let score = container.getAttribute("data-score");
			for (let option of container.querySelectorAll('.heatbarraterRatingUnit')) {
				let checked = option.getAttribute("value") == score;
				option.setAttribute("aria-checked", checked ? "true" : "false");
			}
		}},
]

/*** Lights, camera, action! ***/
init();
