// ==UserScript==
// @name           Hipchat Accessibility Fixes
// @namespace      http://axSgrease.nvaccess.org/
// @description    Improves the accessibility of Hipchat.
// @author         Christopher Toth <q@q-continuum.net>
// @copyright 2017
// @license GNU General Public License version 2.0
// @version        2017.1
// @grant GM_log
// @include https://*.hipchat.com/*
// @require  http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==

const MESSAGE_LIST_SELECTOR = '.hc-messages';
const HEADING_SELECTOR = '.aui-nav-heading';

waitForKeyElements(MESSAGE_LIST_SELECTOR, initialize);
  waitForKeyElements(HEADING_SELECTOR, addMarkupToHeadings);

function initialize() {
  makeStatusesAccessible();
  makeMessagesAccessible();
}

function makeStatusesAccessible() {
  var peopleList = document.querySelectorAll('.hc-person');
  var roomList = document.querySelectorAll('.hc-room');
  for (var elem of peopleList) {
    fixLinkLabel(elem);
  }
}
  
function fixLinkLabel(elem) {
  var link = elem.querySelector('.aui-nav-item');
  link.removeAttribute('aria-label');
      setLabelFromStatus(elem);
}

function setLabelFromStatus(elem) {
  var label = '';
  var name = elem.querySelector('.room-name').textContent;
  var mentionsElement = elem.querySelector('.hc-mention')
  var mentions = 0;
  if (mentionsElement) {
    mentions = parseInt(mentionsElement.textContent);
  }
  var status = getTitleFromStatusIcon(elem);
  var mentionsString = ''
  if (mentions) {
    mentionsString = mentions===1? ' mention': ' mentions';
    mentionsString = mentions + mentionsString;
  }
  label = name + ' ' + mentionsString + ' (' + status + ')'
  var link = elem.querySelector('.aui-nav-item');
  link.setAttribute('aria-label', label);
}

function makeMessagesAccessible() {
  // Turn date blocks into headings
  var messageList = document.querySelector(MESSAGE_LIST_SELECTOR);
  markAsLive(messageList, 'assertive');
  setRole(messageList, 'list');
  var dateBlocks = document.querySelectorAll('.date-divider');
  for (var dateBlock of dateBlocks) {
    makeHeading(dateBlock, 4);
  }
  // Turn Messages into list items
  var messages = document.querySelectorAll('.hc-chat-row');
  for (var message of messages) {
    setRole(message, 'listitem');
  }
}

function addMarkupToHeadings() {
  var headings = document.querySelectorAll(HEADING_SELECTOR);
  for (var heading of headings){
    makeHeading(heading, 2);
  }
}

function markAsLive(elem, value) {
  elem.setAttribute("aria-live", value);
}

function setRole(elem, role) {
  elem.setAttribute('role', role);
}

function makeHeading(elem, level) {
	elem.setAttribute("role", "heading");
	elem.setAttribute("aria-level", level);
}

function getTitleFromStatusIcon(elem) {
  var iconId = elem.querySelector('use').href.baseVal;
  var icon = document.querySelector(iconId);
  var title = titleFromIcon(icon);
  title = title.slice(0, title.indexOf('-selected'));
  return title;
}

function titleFromIcon(iconElem) {
  var title = iconElem.querySelector('title').textContent;
    return title;
}
