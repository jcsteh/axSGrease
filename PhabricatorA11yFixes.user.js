// ==UserScript==
// @name           Phabricator Accessibility Fixes
// @namespace      http://axSgrease.nvaccess.org/
// @description    Improves the accessibility of Phabricator.
// @author         James Teh <jteh@mozilla.com>
// @copyright 2018 Mozilla Corporation
// @license Mozilla Public License version 2.0
// @version        2018.2
// @grant GM_log
// @include https://phabricator.services.mozilla.com/D*
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

/*** Code to apply the tweaks when appropriate. ***/

function applyTweaks(root, tweaks) {
	for (let tweak of tweaks) {
		for (let el of root.querySelectorAll(tweak.selector)) {
			if (Array.isArray(tweak.tweak)) {
				let [func, ...args] = tweak.tweak;
				func(el, ...args);
			} else {
				tweak.tweak(el);
			}
		}
	}
}

function init() {
	applyTweaks(document, LOAD_TWEAKS);
	applyTweaks(document, DYNAMIC_TWEAKS);
}

let observer = new MutationObserver(function(mutations) {
	for (let mutation of mutations) {
		try {
			if (mutation.type === "childList") {
				for (let node of mutation.addedNodes) {
					if (node.nodeType != Node.ELEMENT_NODE) {
						continue;
					}
					applyTweaks(node, DYNAMIC_TWEAKS);
				}
			}/* else if (mutation.type === "attributes") {
				if (mutation.attributeName == "class") {
					onClassModified(mutation.target);
				}
			}*/
		} catch (e) {
			// Catch exceptions for individual mutations so other mutations are still handled.
			GM_log("Exception while handling mutation: " + e);
		}
	}
});
observer.observe(document, {childList: true,/* attributes: true,*/
	subtree: true/*, attributeFilter: ["class"]*/});

/*** Define the actual tweaks. ***/

// Tweaks that only need to be applied on load.
const LOAD_TWEAKS = [
	// There are some off-screen headings to denote various sections, but they
	// are h3 instead of h1 as they should be.
	{selector: '.phui-main-column .phui-timeline-view h3.aural-only, .phui-comment-preview-view .phui-timeline-view h3.aural-only, .phui-comment-form-view h3.aural-only',
		tweak: [makeHeading, 1]},
	// The diff is an h1, so the files inside the diff should be an h2, not an h1.
	{selector: '.differential-file-icon-header',
		tweak: [makeHeading, 2]},
]

// Tweaks that must be applied whenever a node is added.
const DYNAMIC_TWEAKS = [
	// Timeline headings, "Summary" heading.
	{selector: '.phui-timeline-title, .phui-property-list-section-header',
		tweak: [makeHeading, 2]},
	// Inline comment headings.
	{selector: '.differential-inline-comment-head .inline-head-left',
		tweak: [makeHeading, 3]},
	{selector: '.phui-timeline-image, .phui-head-thing-image',
		tweak: makePresentational},
	// Code line numbers.
	{selector: '.remarkup-code th',
		// We don't want these to be header cells, as this causes a heap of spurious
		// verbosity.
		tweak: el => el.setAttribute("role", "cell")},
]

/*** Lights, camera, action! ***/
init();
