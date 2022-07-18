/*
 https://github.com/arlogy/jsu
 Released under the MIT License (see LICENSE file)
 Copyright (c) 2022 https://github.com/arlogy
*/

// taken from CSS display documentation
const cssDisplays = Object.freeze([
    'block', 'inline', 'run-in',
    'flow', 'flow-root', 'table', 'flex', 'grid', 'ruby',
    'block flow', 'inline table', 'flex run-in',
    'list-item', 'list-item block', 'list-item inline', 'list-item flow',
        'list-item flow-root', 'list-item block flow',
        'list-item block flow-root', 'flow list-item block',
    'table-row-group', 'table-header-group', 'table-footer-group',
        'table-row', 'table-cell', 'table-column-group', 'table-column',
        'table-caption', 'ruby-base', 'ruby-text', 'ruby-base-container',
        'ruby-text-container',
    'contents', 'none',
    'inline-block', 'inline-table', 'inline-flex', 'inline-grid',
    'inherit', 'initial', 'unset',
]);

// floating point precision with relatively long fractional digits
const pi = 3.14159265359;

// values picked so that one can easily spot bugs when switching between
// Math.round(), Math.floor, ... from one function implementation to another for
// example
const numbers = [
    -99, -20, -pi, -1.75, -1.5, -1.25, -1, -0.75, -0.5, -0.25, 0,
     99,  20,  pi,  1.75,  1.5,  1.25,  1,  0.75,  0.5,  0.25,
];

// list of parameters that can be passed to a function, taking into account
// different data types and key values for each type; they are based on the
// documentation of the typeof operator; they can be supplemented with other
// values specific to each test need, and unexpected values can also be filtered
// out
const funcParams = Object.freeze([
    undefined,
    null,
    true, false, new Boolean(true), new Boolean(false),
    ...numbers, ...numbers.map(n => new Number(n)), Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, NaN,
    BigInt(1), BigInt(Number.MAX_SAFE_INTEGER) + 1n,
    '', '0', '1', 'a', 'az', new String(''), new String('0'), new String('1'), new String('a'), new String('az'),
    Symbol(), Symbol('a'),
    {}, [], [[], []], function() {}, () => {},
]);

// tag names for visual HTML elements; they are taken from HTML elements
// reference
const htmlVisualTagNames =  Object.freeze([
    // sectioning root
        'body',
    // content sectioning
        'address', 'article', 'aside', 'footer', 'header', 'h1', 'h2', 'h3',
        'h4', 'h5', 'h6', 'main', 'nav', 'section',
    // text content
        'blockquote', 'dd', 'div', 'dl', 'dt', 'figcaption', 'figure', 'hr',
        'li', 'menu', 'ol', 'p', 'pre', 'ul',
    // inline text semantics
        'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'dfn', 'em', 'i',
        'kbd', 'mark', 'q', 'ruby', 's', 'samp', 'small', 'span', 'strong',
        'sub', 'sup', 'time', 'u', 'var',
    // image and multimedia
        'audio', 'img', 'video',
    // embedded content
        'embed', 'iframe', 'object', 'picture', 'portal',
    // scripting
        'canvas',
    // demarcating edits
        'del', 'ins',
    // table content
        'caption', 'col', 'colgroup', 'table', 'tbody', 'td', 'tfoot', 'th',
        'thead', 'tr',
    // forms
        'button', 'fieldset', 'form', 'input', 'label', 'legend', 'meter',
        'optgroup', 'option', 'output', 'progress', 'select', 'textarea',
    // interactive elements
        'details', 'dialog', 'summary',
    // web Components
        'slot', 'template',
]);

module.exports = {
    cssDisplays,
    funcParams,
    htmlVisualTagNames,
};
