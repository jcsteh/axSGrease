// ==UserScript==
// @name           Searchfox Accessibility Fixes
// @namespace      http://axSgrease.nvaccess.org/
// @description    Improves the accessibility of Searchfox.
// @author         James Teh <jteh@mozilla.com>
// @copyright 2018 Mozilla Corporation
// @license Mozilla Public License version 2.0
// @version        2018.1
// @grant GM_log
// @include https://searchfox.org/*
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

/*
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
*/

/*** Define the actual tweaks. ***/

// Tweaks that only need to be applied on load.
const LOAD_TWEAKS = [
	// We'll fake our own table below, since this HTML table is only 2 x 2 and
	// browsers get confused when you mix HTML and ARIA tables.
	{selector: '#file, #file tbody, #file tbody tr, #file td.code',
		tweak: makePresentational},
	// We don't really care about the header row. It's visually hidden anyway.
	// We also don't need the line numbers cell. We'll aria-owns each line number
	// inside it later.
	{selector: '#file thead, #line-numbers',
		tweak: makeHidden},
	{selector: '#file pre',
		tweak: el => el.setAttribute("role", "table")},
	{selector: '.line-number',
		tweak: el => el.setAttribute("role", "cell")},
	// Expose the blame strip for each line number.
	{selector: '.blame-strip',
		tweak: [makeButton, "blame"]},
	{selector: 'code',
		tweak: code => {
			code.setAttribute("role", "cell");
			// We need a container to be our row.
			let row = document.createElement("span");
			row.setAttribute("role", "row");
			// code.id is "line-nnn".
			let lineNum = code.id.substring(5); // Strip "line-" prefix.
			// The row will have two cells: the line number and the line of code.
			// We make them children of the row using aria-owns.
			row.setAttribute("aria-owns", "l" + lineNum + " " + code.id);
			code.parentNode.insertBefore(row, code);
		}},
]

// Tweaks that must be applied whenever a node is added/changed.
const DYNAMIC_TWEAKS = [
]

/*** Lights, camera, action! ***/
init();
