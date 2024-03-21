// ==UserScript==
// @name asus router interface Accessibility Fixes
// @grant  unsafeWindow
// @namespace      http://axSgrease.derekriemer.org/
// @description    Improves the accessibility of the asus router management interface
// @author         James Teh <jteh@mozilla.com>, derek riemer <git@derekriemer.com>
// @copyright 2019-2024 Mozilla Corporation, Derek Riemer
// @license Mozilla Public License version 2.0
// @version        2024.1
// @include http://asusrouter.com/*
// @include http://www.asusrouter.com/*
// ==/UserScript==

/*** Functions for common tweaks. ***/

/**
 * Adds text to the given live region, and clears it a second later so it's no
 * longer in the virtual buffer.
 * @param {string} regionid an id of a region.
 */
function announce(text, regionId) {
	getLiveRegion(regionId)
		.then((region) => {
			region.innerText = text;
			setTimeout(() => {
				region.innerText = '';
			}, 1000);
		});
}

/**
 * create or fetch a live region that can be used with updateLiveRegion. Returns a promise with the region.
 * @param {string} id the name of the new live region. This is an html id.
 * @return {!Promise<HTMLElement>} a div that contains the live region. This can typically be ignored, this exxists to aid in chaining creation of non-existant regions.
 */
function getLiveRegion(id) {
	const updatePromise = new Promise((resolve, reject) => {
		if (!id) {
			reject('Need a valid id!');
			return;
		}
		const existingRegion = document.getElementById(id);
		if (existingRegion) {
			resolve(existingRegion);
			return;
		}
		const region = document.createElement('div');
		region.id = id;
		region.setAttribute('aria-live', 'polite');
		region.setAttribute('aria-atomic', 'true');
		region.style.position = 'absolute';
		region.style.width = '50px';
		region.style.height = '50px';
		region.style.opasity = 0;
		document.body.appendChild(region);
		// we need to delay a little to get the new region to actually read contents.
		// A11y api probably don't considder the relevant changes,  additions, until
		//an annimation frame has passed. It may, in reality be more like 2-4
		// annimation frames, so delay 134 ms to be safe.
		setTimeout(() => {
			resolve(region);
		}, 134);
	});
	return updatePromise;
}

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

function setRole(el, role) {
	el.setAttribute('role', role);
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

function makeElementOwn(parentElement, listOfNodes) {
	ids = [];
	for (let node of listOfNodes) {
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

let observer = new MutationObserver(function (mutations) {
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
	options = { childList: true, subtree: true };
	if (DYNAMIC_TWEAK_ATTRIBS.length > 0) {
		options.attributes = true;
		options.attributeFilter = DYNAMIC_TWEAK_ATTRIBS;
	}
	observer.observe(document, options);
}

/*** Define the actual tweaks. ***/

globals = [];
// Tweaks that only need to be applied on load.
const LOAD_TWEAKS = [
	{
		selector: "#op_link",
		tweak: el => {
			const table = el.closest('table');
			setRole(table, 'banner');
			// Because I can, make the tbody a list, and each td a list item.
			setRole(table.firstElementChild, 'list');
			for (let pres of table.firstElementChild.children) {
				makePresentational(pres);
			}
			// td's become listitems
			Array.from(table.querySelectorAll('td')).forEach((e) => setRole(e, e.innerText ? 'listitem' : 'none'));
		},
	},
];

// Attributes that should be watched for changes and cause dynamic tweaks to be
// applied.
const DYNAMIC_TWEAK_ATTRIBS = [];

// Tweaks that must be applied whenever an element is added/changed.
const DYNAMIC_TWEAKS = [
	{
		selector: '.menu_Desc',
		tweak: [setRole, 'link'],
	},
	{
		selector: '.menu_Split',
		tweak: [makeHeading, 2],
	},
	{
		selector: '#mainMenu',
		tweak: [makeRegion, 'main navigation'],
	},
	{
		selector: '#tabMenu',
		tweak: [makeRegion, 'secondary navigation'],
	},
	{
		selector: '#tabMenu td',
		tweak: [setRole, 'link'],
	},
	{
		selector: '.formfonttitle',
		tweak: [makeHeading, 1],
	},
	{
		selector: 'img[src="/switcherplugin/iphone_switch_container_on.png"]',
		tweak: e => {
			e.alt = 'on';
		},
	},
	{
		selector: "#overDiv_table1",
		tweak: e => {
			// on rare occasions, this is delayed while the table renders, so
			// we wait a quarter second.  Also kind of mimics a tutor help
			// with most screen readers.
			setTimeout(() => {
				announce(e.innerText, 'tutor');
			}, 250);
		},
	},
];

/** add your specific initialization here, so that if you ever update the framework from new skeleton your inits are not overridden. */
function userInit() { }

/*** Lights, camera, action! ***/
init();
