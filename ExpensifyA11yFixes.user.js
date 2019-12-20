// ==UserScript==
// @name           Expensify Accessibility Fixes
// @namespace      http://axSgrease.nvaccess.org/
// @description    Improves the accessibility of Expensify.
// @author         James Teh <jteh@mozilla.com>
// @copyright 2019 Mozilla Corporation, Derek Riemer
// @license Mozilla Public License version 2.0
// @version        2019.1
// @include https://www.expensify.com/*
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
	if (label) {
		el.setAttribute("aria-label", label);
	}
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

var idCounter = 0;
// Get a node's id. If it doesn't have one, make and set one first.
function setAriaIdIfNecessary(elem) {
	if (!elem.id) {
		elem.setAttribute("id", "axsg-" + idCounter++);
	}
	return elem.id;
}

function makeElementOwn(parentElement, listOfNodes){
	ids = [];
	for(let node of listOfNodes){
		ids.push(setAriaIdIfNecessary(node));
	}
	parentElement.setAttribute("aria-owns", ids.join(" "));
}

// Focus something even if it wasn't made focusable by the author.
function forceFocus(el) {
	let focusable = el.hasAttribute("tabindex");
	if (focusable) {
		el.focus();
		return;
	}
	el.setAttribute("tabindex", "-1");
	el.focus();
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
			try {
				applyTweak(el, tweak);
			} catch (e) {
				console.log("Exception while applying tweak for '" + tweak.selector + "': " + e);
			}
		}
		if (checkRoot && root.matches(tweak.selector)) {
			try {
				applyTweak(root, tweak);
			} catch (e) {
				console.log("Exception while applying tweak for '" + tweak.selector + "': " + e);
			}
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
			console.log("Exception while handling mutation: " + e);
		}
	}
});

function init() {
	applyTweaks(document, LOAD_TWEAKS, false);
	applyTweaks(document, DYNAMIC_TWEAKS, false);
	options = {childList: true, subtree: true};
	if (DYNAMIC_TWEAK_ATTRIBS.length > 0) {
		options.attributes = true;
		options.attributeFilter = DYNAMIC_TWEAK_ATTRIBS;
	}
	observer.observe(document, options);
}

/*** Define the actual tweaks. ***/

// Tweaks that only need to be applied on load.
const LOAD_TWEAKS = [
];

// Attributes that should be watched for changes and cause dynamic tweaks to be
// applied. For example, if there is a dynamic tweak which handles the state of
// a check box and that state is determined using an attribute, that attribute
// should be included here.
const DYNAMIC_TWEAK_ATTRIBS = ["class"];

// Tweaks that must be applied whenever a node is added/changed.
const DYNAMIC_TWEAKS = [
	// Label text/combo boxes that don't have a properly associated label; e.g.
	// in the Edit Expense dialog.
	{selector: 'li input[type="text"], li div[role="combobox"]',
		tweak: el => {
			let li = el.closest("li");
			let label = li.querySelector("label");
			if (label) {
				el.setAttribute("aria-label", label.textContent);
			}
		}},
	// Edit transaction button in the expenses table for a report.
	{selector: '.editTransaction a .sr-only',
		tweak: makeButton},
	// Kill redundant edit transaction text.
	{selector: '.editTransaction > .sr-only',
		tweak: makeHidden},
	// Deal with dialogs that appear but don't get focus; e.g. Edit Expense,
	// Add Expenses to Report.
	{selector: '.dialog:not(.hidden), .modal',
		tweak: el => {
			if (!el.hasAttribute("role")) {
				el.setAttribute("role", "dialog");
			}
			// Focus the first heading.
			let heading = el.querySelector("h1, h3");
			forceFocus(heading);
		}},
	// Expense rows on the main Expenses screen.
	{selector: '.expenseRows',
		// This is really more of a table, but it's just too complicated.
		tweak: el => el.setAttribute("role", "list")},
	{selector: '.expenseRow[role="button"]',
		tweak: el => {
			// No, Expensify, these *really* aren't buttons.
			el.setAttribute("role", "listitem");
			// Make it easy to get to the policy, which you can activate to edit the
			// expense.
			let policy = el.querySelector(".policy");
			if (policy) {
				policy.setAttribute("role", "button");
			}
		}},
	// Deal with dropdown menus like the New Expense button.
	{selector: '.icon-list-group:not(.hidden)',
		tweak: el => {
			// Focus the first button.
			let button = el.querySelector('[role="button"]');
			button.focus();
		}},
	// Deal with SPA page changes.
	{selector: '#content_wrapper > :first-child',
		tweak: el => {
			let main = el.parentNode;
			// Focus the first h1, or if there isn't one, the first link.
			for (let selector of ["h1", "a"]) {
				let target = main.querySelector(selector);
				if (target) {
					return forceFocus(target);
				}
			}
		}},
];

/*** Lights, camera, action! ***/
init();
