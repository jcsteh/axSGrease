// ==UserScript==
// @name           Pandora Accessibility Fixes
// @namespace      http://www.jantrid.net/axSGrease/
// @description    Improves the accessibility of Pandora.
// @author James Teh <jamie@jantrid.net>
// @copyright 2013 James Teh
// @license GNU General Public License version 2.0
// @version 0.20130110.01
// @include        http://www.pandora.com/*
// @homepageURL http://userscripts.org/scripts/show/156173
// @updateURL https://userscripts.org/scripts/source/156173.user.js
// ==/UserScript==

BUTTONS_LABELS = {
	"thumbUpButton": "Thumb up",
	"thumbDownButton": "Thumb down",
	"pauseButton": "Pause",
	"playButton": "Play",
	"skipButton": "Skip",
}
function fixButton(target) {
	var classes = target.classList;
	if (!classes)
		return;
	for (var cls in BUTTONS_LABELS) {
		if (!classes.contains(cls))
			continue;
		var button = target.firstChild;
		button.setAttribute("role", "button");
		button.setAttribute("aria-label", BUTTONS_LABELS[cls]);
		if (cls == "thumbUpButton")
			button.setAttribute("aria-pressed",
				classes.contains("indicator") ? "true" : "false");
		break;
	}
}

function onClassModified(target) {
	var classes = target.classList;
	if (!classes)
		return;
	fixButton(target);
	if (classes.contains("stationListItem"))
		target.setAttribute("aria-checked",
			classes.contains("selected") ? "true" : "false");
}

function onNodeAdded(target) {
	var node;
	if (node = document.getElementById("stationList"))
		node.setAttribute("role", "radiogroup");
	var nodes;
	nodes = target.getElementsByClassName("stationListItem");
	for (var i = 0; i < nodes.length; ++i) {
		node = nodes[i];
		node.setAttribute("role", "radio");
		if (node.classList.contains("selected"))
			node.setAttribute("aria-checked", "true");
	}
	nodes = target.getElementsByClassName("stationName");
	for (var i = 0; i < nodes.length; ++i)
		nodes[i].setAttribute("role", "presentation");
	nodes = target.getElementsByClassName("option");
	for (var i = 0; i < nodes.length; ++i)
		nodes[i].setAttribute("role", "button");
}

function onStyleModified(target) {
	var style = target.style;
	if (target.id == "station_menu_dd" && style.visibility == "visible")
		target.getElementsByTagName("a")[0].focus();
}

function init() {
	var nodes;
	nodes = document.getElementsByClassName("buttons")[0].childNodes;
	for (var i = 0; i < nodes.length; ++i)
		fixButton(nodes[i]);
	var node;
	if (node = document.getElementsByClassName("buyButton")[0]) {
		node.setAttribute("role", "button");
		node.setAttribute("aria-label", "Buy");
	}
	// Something causes these nodes to remove ARIA attributes if we set them here,
	// so delay this.
	setTimeout(function() {
		document.getElementById("addArtistSeed").setAttribute("aria-label", "Add artist");
		var nodes = document.getElementsByClassName("deletable");
		for (var i = 0; i < nodes.length; ++i) {
			var node = nodes[i];
			node.setAttribute("role", "button");
			node.setAttribute("aria-label", "Delete");
		}
		var nodes = document.getElementsByClassName("sample");
		for (var i = 0; i < nodes.length; ++i)
			nodes[i].firstChild.setAttribute("aria-label", "Sample");
	}, 7000);
}

var observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		if (mutation.type === "childList") {
			for (var i = 0; i < mutation.addedNodes.length; ++i)
				onNodeAdded(mutation.addedNodes[i]);
		} else if (mutation.type === "attributes") {
			if (mutation.attributeName == "class")
				onClassModified(mutation.target);
			else if (mutation.attributeName == "style")
				onStyleModified(mutation.target);
		}
	});
});
observer.observe(document, {childList: true, attributes: true,
	subtree: true, attributeFilter: ["class", "style"]});
init();
