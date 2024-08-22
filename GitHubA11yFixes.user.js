// ==UserScript==
// @name           GitHub Accessibility Fixes
// @namespace      http://axSgrease.nvaccess.org/
// @description    Improves the accessibility of GitHub.
// @author         James Teh <jteh@mozilla.com>, Sascha Cowley <sascha@nvaccess.org>
// @copyright 2019-2024 Mozilla Corporation, Derek Riemer, Sascha Cowley
// @license Mozilla Public License version 2.0
// @version        2024.3
// @include https://github.com/*
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
const DYNAMIC_TWEAK_ATTRIBS = [];

// Tweaks that must be applied whenever a node is added/changed.
const DYNAMIC_TWEAKS = [
	// Lines of code which can be commented on.
	{selector: '.add-line-comment, span.blob-code-inner',
		tweak: el => {
			// Put the comment button after the code instead of before.
			let cell = el.parentNode;
			let code = cell.querySelector('.blob-code-inner');
			let comment = cell.querySelector('.add-line-comment');
			if (code && comment) {
				makeElementOwn(cell, [code, comment]);
			}
		}},
	// Make non-comment events into headings; e.g. closing/referencing an issue,
	// approving/requesting changes to a PR, merging a PR. Exclude commits and
	// commit references because these contain too much detail and there's no
	// way to separate the header from the body.
	{selector: '.TimelineItem:not(.js-commit) .TimelineItem-body:not(.my-0):not(.discussion-comment):not([id^="ref-commit-"])',
		tweak: [makeHeading, 3]},
	// Issue listing tables.
	{selector: '.js-navigation-container:not(.commits-listing)',
		tweak: el => el.setAttribute("role", "table")},
	{selector: '.js-navigation-container:not(.commits-listing) .Box-row',
		tweak: el => el.setAttribute("role", "row")},
	{selector: '.js-navigation-container:not(.commits-listing) .Box-row .d-flex',
		tweak: el => {
			// There's one of these inside every row. It's purely presentational.
			makePresentational(el);
			// Its children are the cells, but they have no common class.
			for (let cell of el.children) {
				cell.setAttribute("role", "cell");
			}
		}},
	// Remove aria-description from things with hovercards.
	{selector: '[data-hovercard-url][aria-description]',
		tweak: el => el.removeAttribute("aria-description")},
	// Remove headings from folder and file lists.
	{selector: 'table[aria-labelledby=folders-and-files] :is(h2, h3)',
		tweak: makePresentational},
	// Make file viewer filenames headings, and the first item in the file viewer.
	{selector: '.file-header .file-info .Truncate:has(.Link--primary)',
		tweak: el => {
			makeHeading(el, 2)
			let headerRow = el.parentElement
			let children = Array.from(headerRow.children)
			// Filename is the last child of .file-info, make it the first
			children.unshift(children.pop())
			if (headerRow) {
				makeElementOwn(headerRow, children);
			}
		}},
	// Label diffs and the like with their filename.
	{selector: '.file',
		tweak: el => {
			label = el.querySelector(".Link--primary")
			file = el.querySelector(".js-file-content")
			if (label && file) {
				makeRegion(file, label.textContent)
			}
		}},
];

/*** Lights, camera, action! ***/
init();
