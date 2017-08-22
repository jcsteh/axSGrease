# AxSGrease

- Author: James Teh &lt;jamie@nvaccess.org&gt; & other contributors
- Copyright: 2011-2017 NV Access Limited

AxSGrease is a set of user scripts (also known as GreaseMonkey scripts) to improve the accessibility of various websites.

## Installation
Before you can install any of these scripts, you must first install a user script manager for your browser.
For Firefox, you can install [GreaseMonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/).
For Chrome, you can install [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo).
There are also user script managers for other browsers.
See [Greasy Fork's page on How to install user scripts](https://greasyfork.org/en/help/installing-user-scripts) for more details.

Once you have a user script manager installed, simply activate the download link for the relevant script below to download and install it.

## Scripts
Following is information about each script.

### Bugzilla Accessibility Fixes
[Download Bugzilla Accessibility Fixes](https://github.com/nvaccess/axSGrease/raw/master/BugzillaA11yFixes.user.js)

This script improves the accessibility of bug pages in the [Bugzilla](http://www.bugzilla.org/) bug tracker used by many projects.
It does the following:

- Makes the bug title, attachments heading and comment number headings accessible as headings.
- Sets alternate text for user images so that screen readers don't derive an unfriendly name from the URL.

### GitHub Accessibility Fixes
[Download GitHub Accessibility Fixes](https://github.com/nvaccess/axSGrease/raw/master/GitHubA11yFixes.user.js)

This script improves the accessibility of [GitHub](https://github.com/).
It does the following:

- Makes various headings accessible as headings, including:
 - Comment headers in issues, pull requests and commits
 - Commit group headers in commit listings
 - The commit title for single commits
 - The header for each changed file in pull requests and commits
- Ensures that various data tables aren't treated as layout tables, including:
 - The file content when viewing a single file
 - File listings
 - Diff content
 - Tables in Markdown content
- When there are lines of code which can be commented on (e.g. a pull request or commit), puts the comment buttons after (rather than before) the code.
- Makes the state of checkable menu items accessible; e.g. in the watch and labels pop-ups.
- Marks "Add your reaction" buttons as having a pop-up, focuses the first reaction when the add button is pressed and makes the labels of the reaction buttons less verbose.

### Kill Windowless Flash
[Download Kill Windowless Flash](https://github.com/nvaccess/axSGrease/raw/master/KillWindowlessFlash.user.js)

Adobe Flash objects can be made to be accessible.
Even if they aren't and only contain unlabelled controls, it might still be possible to use these objects with some initial sighted help or by trial and error.
However, it's impossible for accessibility tools to interact at all with Flash objects that are "windowless" (also known as transparent or opaque).
This script makes windowless Flash objects windowed so that there may be a chance of accessing them.

### Monorail Accessibility Fixes
[Download Monorail Accessibility Fixes](https://github.com/nvaccess/axSGrease/raw/master/MonorailA11yFixes.user.js)

This script improves the accessiblity of the [Monorail](https://bugs.chromium.org/) issue tracker used by Google for Chromium-related projects.
It does the following:

- Makes issue titles and comment headings accessible as headings.
- Makes the star control and status accessible.

### Slack Accessibility Fixes
[Download Slack Accessibility Fixes](https://github.com/nvaccess/axSGrease/raw/master/SlackA11yFixes.user.js)

This script improves the accessibility of [Slack](https://www.slack.com/).
It does the following:

- Reorders some elements which appear in the wrong place for accessibility. For example, using this script, the input area appears near the bottom of the page as it does visually instead of at the top.
- Makes messages accessible as list items.
- Makes message timestamps appear on a single line instead of crossing several lines.
- Makes star controls (and their statuses) accessible.
- Makes options for each message (Start a thread, Share message, etc.) accessible.
 To access these, move the mouse to the text of a message.
 They then appear above the author's name as buttons.
- Makes the current channel/direct message title, day separators in the message history, the headers of individual search results and the headers of individual threads in All Threads accessible as headings.
- Reports incoming messages automatically (using a live region).
- Hides an editable area which isn't shown visually.
- Reports suggestions in various autocompletes such as the Quick Switcher and direct messages menu.

### Telegram accessibility fixes
[Download Telegram Accessibility Fixes](https://github.com/nvaccess/axSGrease/raw/master/TelegramA11yFixes.user.js)

This script improves the accessibility of the [Telegram instant messaging](https://web.telegram.org/) web interface.

It so far does the following:

- Marks the chat history as a live region so new messages are announced automatically.

### Trello Accessibility Fixes
[Download Trello Accessibility Fixes](https://github.com/nvaccess/axSGrease/raw/master/TrelloA11yFixes.user.js)

This script improves the accessibility of [Trello](https://trello.com/).
It does the following:

- Makes lists and cards accessible as lists and list items, respectively.
- Focuses the active card when moving between lists and cards with the arrow keys.
 If you are using a screen reader, you will need to ensure that the arrow keys are passed to the application to make use of this.
 For NVDA, you can achieve this by switching to focus mode to move through cards.
- Labels badges in cards.
- Makes list headers and activity item headers accessible as headings.
- Prevents loss of position for screen reader users when pressing the control key.
- Adds a shift+m keyboard shortcut to quickly move a card.
- Makes checklists accessible.
- Makes the checkbox for due date completion accessible.
