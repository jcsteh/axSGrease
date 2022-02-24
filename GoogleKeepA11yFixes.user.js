// ==UserScript==
// @name Google Keep Accessibility Fixes
// @namespace      http://axSgrease.nvaccess.org/
// @description    Improves the accessibility of Google Keep.
// @author         James Teh <jamie@jantrid.net>
// @copyright 2022 James Teh, Mozilla Corporation, Derek Riemer
// @license Mozilla Public License version 2.0
// @version        2022.1
// @include https://keep.google.com/*
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
	// Set role="application" because the most efficient way to
	// navigate Google Keep is with keyboard shortcuts and browse mode makes that
	// harder. Also handle certain key presses.
	{selector: 'body',
		tweak: el => {
			el.setAttribute("role", "application");
			el.addEventListener("keydown", evt => {
				// Make alt+enter open a link if a link bubble is shown.
				if (evt.key == "Enter" && evt.altKey) {
					evt.preventDefault();
					evt.stopPropagation();
					const openLink = document.querySelector(".IZ65Hb-hSRGPd-V68bde-hSRGPd");
					if (openLink && openLink.clientWidth > 0) {
						openLink.click();
					}
				}
			}, { capture: true });
		}},
];

// Attributes that should be watched for changes and cause dynamic tweaks to be
// applied.
const DYNAMIC_TWEAK_ATTRIBS = ["style", "class"];

// Tweaks that must be applied whenever an element is added/changed.
const DYNAMIC_TWEAKS = [
	// The container for a note which gets focused when navigating between notes.
	{selector: '.IZ65Hb-n0tgWb',
		tweak: el => {
			el.setAttribute("role", "group");
			// Label it using its title, which is the first contentEditable descendant.
			const content = el.querySelector('[contenteditable]');
			if (content) {
				el.setAttribute("aria-labelledby", setAriaIdIfNecessary(content));
			}
			el.removeAttribute("aria-description");
			if (el.classList.contains("IZ65Hb-bJ69tf")) {
				el.setAttribute("aria-description", "pinned");
			}
		}},
	// Check boxes in lists.
	{selector: '[role="checkbox"]',
		tweak: el => {
			// Label it using its content.
			const content = el.parentNode.parentNode.querySelector('[aria-multiline="true"]');
			if (content) {
				// The label of the content is "List item", which isn't useful and would
				// become part of the check box label.
				content.removeAttribute("aria-label");
				el.setAttribute("aria-labelledby", setAriaIdIfNecessary(content));
			}
		}},
	// When the Clear search button disappears after dismissing search, move focus
	// away from the search box so keyboard shortcuts work without having to
	// tab.
	{selector: '.gb_nf',
		whenAttrChangedOnAncestor: false,
		tweak: el => {
			if (el.style.visibility == "hidden") {
				document.activeElement.blur();
			}
		}},
];

/*** Lights, camera, action! ***/
init();
