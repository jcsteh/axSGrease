// ==UserScript==
// @name           Bugzilla Accessibility Fixes
// @namespace      http://www.jantrid.net/axSGrease/
// @description    Improves the accessibility of Bugzilla.
// @author         James Teh <jamie@nvaccess.org>
// @copyright 2014 James Teh
// @license GNU General Public License version 2.0
// @version        2014.1
// @include */show_bug.cgi?*
// ==/UserScript==

function makeHeading(elem, level) {
	elem.setAttribute("role", "heading");
	elem.setAttribute("aria-level", level);
}

function tweak() {
	var elem = document.getElementById("short_desc_nonedit_display");
	if (!elem)
		return; // Not a Bugzilla bug.
	// Bug title.
	makeHeading(elem, 1);

	// Attachments heading.
	if (elem = document.getElementById("attachment_table"))
		makeHeading(elem.rows[0].cells[0], 2);

	// Comment numbers.
	for (elem of document.getElementsByClassName("bz_comment_number"))
		makeHeading(elem, 2);
}

tweak();
