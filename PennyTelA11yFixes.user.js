// ==UserScript==
// @name PennyTel Accessibility Fixes
// @namespace http://www.jantrid.net/gmScripts/
// @description Improves the accessibility of the PennyTel customer portal.
// @author James Teh <jamie@jantrid.net>
// @version 0.20110803.01
// @include https://www.pennytel.com/*.jsp
// @include https://www.pennytel.com/*.jsp?*
// ==/UserScript==

const BUTTON_LABELS = {
	"btn_Edit.gif": "Edit",
	"btn_Add_2.gif": "Add",
	"btn_Delete_2.gif": "Delete",
	"btn_Save.gif": "Save",
	"btn_Cancel.gif": "Cancel",
	"btn_Login.gif": "Login",
	"btn_Settings.gif": "Settings",
	"btn_More.gif": "More",
	"btn_Update.gif": "Update",
	"btn_Listen.gif": "Listen",
	"btn_Mark_as_Read.gif": "Mark as read",
	"btn_Mark_as_Unread.gif": "Mark as unread",
	"btn_remove_2.gif": "Remove",
	"btn_Change.gif": "Change",
};

// Make sidebar menu items into links.
var elements = document.evaluate("//td[@class='tdSideMenu']",
	document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
for (var i = 0; i < elements.snapshotLength; ++i) {
	var element = elements.snapshotItem(i);
	element.setAttribute("role", "link");
}

// Fix images.
var elements = document.getElementsByTagName("img");
for (var i = 0; i < elements.length; ++i) {
	var element = elements[i];
	var fileName = element.getAttribute("src").split("/");
	fileName = fileName[fileName.length - 1];
	var label;
	if (label = BUTTON_LABELS[fileName]) {
		// Button.
		element.setAttribute("role", "button");
		element.setAttribute("aria-label", label);
	} else if (/btn_Return_.*\.gif/.test(fileName)) {
		// Return button.
		element.setAttribute("role", "button");
		element.setAttribute("aria-label", "Continue");
	} else if (element.getAttribute("onclick") && element.getAttribute("alt") === "") {
		// This image has an onClick handler, but has @alt="".
		// This is incorrect and will cause screen readers not to render the image.
		element.removeAttribute("alt");
	} else if (fileName === "radio_check.gif") {
		// Checked disabled radio button.
		element.setAttribute("role", "radio");
		element.setAttribute("aria-disabled", "true");
		element.setAttribute("aria-checked", "true");
	} else if (fileName === "radio_uncheck.gif") {
		// Unchecked disabled radio button.
		element.setAttribute("role", "radio");
		element.setAttribute("aria-disabled", "true");
		element.setAttribute("aria-checked", "false");
	}
}
