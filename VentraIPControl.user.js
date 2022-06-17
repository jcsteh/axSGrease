// ==UserScript==
// @name VIPControl Accessibility Fixes
// @namespace      http://axSgrease.nvaccess.org/
// @description    Improves the accessibility of VentraIP VIPControl.
// @author         James Teh <jamie@jantrid.net>
// @copyright 2019-2022 James Teh, Mozilla Corporation, Derek Riemer
// @license Mozilla Public License version 2.0
// @version        2022.1
// @include https://vip.ventraip.com.au/*
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

function applyTweaks(root, tweaks, checkRoot, forAttrChange=false) {
	for (let tweak of tweaks) {
		if (!forAttrChange || tweak.whenAttrChangedOnAncestor !== false) {
			for (let el of root.querySelectorAll(tweak.selector)) {
				try {
					applyTweak(el, tweak);
				} catch (e) {
					console.log("Exception while applying tweak for '" + tweak.selector + "': " + e);
				}
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
				applyTweaks(mutation.target, DYNAMIC_TWEAKS, true, true);
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
// applied.
const DYNAMIC_TWEAK_ATTRIBS = [];

// Tweaks that must be applied whenever an element is added/changed.
const DYNAMIC_TWEAKS = [
	{selector: '.sharedTable__table',
		tweak: el => el.setAttribute("role", "table")},
	{selector: '.sharedTable__head, .sharedTable__row',
		tweak: el => el.setAttribute("role", "row")},
	// Intervening div between rows and cells which interferes with table
	// structure.
	{selector: '.sharedTable__details',
		tweak: makePresentational},
	{selector: '.sharedTable__head--text',
		tweak: el => el.setAttribute("role", "columnheader")},
	{selector: '.sharedTable__column, .sharedTable__details--actions',
		tweak: el => el.setAttribute("role", "cell")},
	// IconButton is a <button> wrapping an icon, but the <button> doesn't
	// handle clicks. We make the icon itself a button below. role="presentation"
	// doesn't work because it's focusable, so we hackily use role="group" instead.
	{selector: '.IconButton, button.Tooltip__icon',
		tweak: el => el.setAttribute("role", "group")},
	{selector: '.icon-edit',
		tweak: [makeButton, "Edit"]},
	{selector: '.icon-delete',
		tweak: [makeButton, "Delete"]},
	{selector: '.icon-check',
		tweak: [makeButton, "Confirm"]},
	{selector: '.icon-x',
		tweak: [makeButton, "Cancel"]},
	{selector: '.add .icon-plus-faq',
		tweak: [makeButton, "Add"]},
	{selector: '.Tooltip__icon .icon-alert-circle',
		tweak: [makeButton, "Help"]},
	// Indicate buttons which open popup menus; e.g. the button to choose the
	// type of DNS record to add.
	{selector: '.ccp__select--toggle',
		tweak: el => el.setAttribute("aria-haspopup", "true")},
	// Focus the first button in a popup menu when it appears; e.g. the menu to
	// choose the type of DNS record to add.
	{selector: '.ccp__select--menu',
		tweak: el => el.querySelector("button").focus()},
];

/*** Lights, camera, action! ***/
init();
