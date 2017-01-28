// ==UserScript==
// @name           ElPais Accessibility Fixes
// @namespace      http://nvdaes.github.io/grease
// @description    Improves the accessibility of Diario El País.
// @description:es    Mejora la accesibilidad del Diario El País
// @author         Noelia Ruiz Martínez <nrm1977@gmail.com>
// @copyright 2017 Noelia Ruiz Martínez
// @license GNU General Public License version 2.0
// @version        2017.1.1
// @grant       none
// @include http://*elpais.com/*
// ==/UserScript==

function labelControls() {
	for (element of document.querySelectorAll(".boton-nombre")) {
		label = element.textContent;
	element.parentNode.setAttribute("aria-label", label);
	}
}

labelControls()
