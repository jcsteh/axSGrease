# Usage

1. Copy `axSGreaseSkeleton.js` to a new file with a `.user.js` extension; e.g. `SomeSiteA11yFixes.user.js`.
2. Edit the metadata at the top as appropriate, especially the `@name` and `@include` keys.
3. Configure and add tweaks in the section starting with the comment: "Define the actual tweaks."
    See below for more information about defining tweaks.

You shouldn't need to edit anything in other sections of the file.
However, you may wish to explore the functions in the section entitled "Functions for common tweaks."
You can use these instead of writing your own functions for common scenarios.
For example, `makeHeading` makes the target element into a heading with the specified level.

# Defining Tweaks

There are two arrays of tweaks:

- `LOAD_TWEAKS`: Tweaks that only need to be applied on load.
- `dynamic_tweaks`: Tweaks that must be applied whenever an element is added or when an observed attribute changes.

The `DYNAMIC_TWEAK_ATTRIBS` array allows you to specify names of attributes which should be observed for changes.
For example, if there is a dynamic tweak which handles the state of a check box and that state is determined using an attribute, that attribute should be included here.
It is often necessary to observe the `class` attribute, as this often indicates changes to the state of a control.
In some cases, it can be necessary to observe the `style` attribute if the site applies style changes directly to an element rather than via style sheets.
if `DYNAMIC_TWEAK_ATTRIBS` is empty, no attributes will be observed.

In the `LOAD_TWEAKS` and `DYNAMIC_TWEAKS` arrays, each tweak is an object with these keys:

- `selector`: A CSS selector for the element(s) you want to tweak.
- `tweak`: Either:
    1. A function which is passed a single element to tweak.
        For example:
        * `tweak: makePresentationl`
        * `tweak: el => el.setAttribute("role", "cell")`
    2. An array of `[func, ...args]`.
        The function will be passed an element, along with the arguments in the array.
        For example:

        `tweak: [makeHeading, 2]`

        will call `makeHeading(element, 2)`.
