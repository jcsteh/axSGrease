// ==UserScript==
// @name           Greenhouse Accessibility Fixes
// @namespace      http://axSgrease.nvaccess.org/
// @description    Improves the accessibility of Greenhouse.
// @author         James Teh <jteh@mozilla.com>
// @copyright 2019 Mozilla Corporation
// @license Mozilla Public License version 2.0
// @version        2019.1
// @grant GM_log
// @include https://*.greenhouse.io/*
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

function labelRating(el, ratingText) {
	let name = el.getAttribute("title");
	setLabel(el, name + ": " + ratingText);
}

// Tweaks that only need to be applied on load.
const LOAD_TWEAKS = [
	{selector: '.tabs-nav',
		tweak: el => el.setAttribute("role", "tablist")},
	{selector: '.tabs-nav > li',
		tweak: makePresentational},
];

// Attributes that should be watched for changes and cause dynamic tweaks to be
// applied. For example, if there is a dynamic tweak which handles the state of
// a check box and that state is determined using an attribute, that attribute
// should be included here.
const DYNAMIC_TWEAK_ATTRIBS = ["class"];

// Tweaks that must be applied whenever a node is added/changed.
const DYNAMIC_TWEAKS = [
	{selector: '.thumbs-up:not(.rating-with-name)',
		tweak: [labelRating, "thumbs up"]},
	{selector: '.two-thumbs-up:not(.rating-with-name)',
		tweak: [labelRating, "two thumbs up"]},
	{selector: '.mixed-rating:not(.rating-with-name)',
		tweak: [labelRating, "mixed"]},
	{selector: '.tabs-nav a',
		tweak: el => {
			el.setAttribute("role", "tab");
			let selected = el.parentElement.classList.contains("selected");
			el.setAttribute("aria-selected", selected ? "true" : "false");
		}},
	{selector: '.closed',
		tweak: [setExpanded, false]},
	{selector: '.open',
		tweak: [setExpanded, true]},
	{selector: '.scorecard-attributes-table .name.focus',
		tweak: el => {
			// Importance is only indicated through colour.
			// We can't just set aria-label here because it doesn't replace the content
			// for table cells.
			// Therefore, create a visually hidden indicator.
			let important = document.createElement("span");
			important.style = "position: absolute; left: -1000px; width: 1px; height: 1px;";
			important.setAttribute("aria-label", "important");
			el.insertBefore(important, el.firstChild);
		}},
	{selector: '.selectable',
		tweak: el => {
			el.setAttribute("role", "radio");
			let checked = el.classList.contains("selected");
			el.setAttribute("aria-checked", checked ? "true" : "false");
		}},
];

/*** Lights, camera, action! ***/
init();
