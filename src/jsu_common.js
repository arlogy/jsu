/*
 https://github.com/arlogy/jsu
 Released under the MIT License (see LICENSE file)
 Copyright (c) 2020 https://github.com/arlogy
*/

(function(factory) {
    if (typeof module !== 'undefined' && typeof exports !== 'undefined') {
        // export module in Node.js-like environments
        module.exports = factory();
    }
    else {
        // set global variable
        if(typeof Jsu === 'undefined') Jsu = {};
        if(Jsu.Common) throw new Error('Jsu.Common is already defined');
        Jsu.Common = factory();
    }
})(
function() {
    // --- Local Storage ---

    function setLocalStorageItem(key, value) {
        try { // see (1) below
            if(window.localStorage) {
                window.localStorage.setItem(key, value);
                return true;
            }
        } catch(e) {}
        return false;
    }

    function getLocalStorageItem(key) {
        try { // see (1) below
            return window.localStorage ? window.localStorage.getItem(key)
                                       : null; // returning null because getItem() also returns null when key does not exist
        } catch(e) {}
        return null; // returning null here too
    }

    // (1) An exception might be raised when trying to access window.localStorage,
    //     for example when cookies are blocked. So access to the storage must
    //     be wrapped in a try-catch block.

    // --- UI ---

    function setEltVisible(elt, vis, dsp) {
        elt.style.display = vis ? (dsp && dsp !== 'none' ? dsp : 'revert')
                                : 'none';
    }

    function isEltVisible(elt) {
        return window.getComputedStyle(elt, null).display !== 'none';
        // getComputedStyle() must be used so that styles in external stylesheets are inspected
    }

    function switchEltVisibility(elt, dsp) {
        setEltVisible(elt, !isEltVisible(elt), dsp);
    }

    // --- Type Checker ---

    function isBoolean(value) { return typeof value === 'boolean'; }

    var isNumber = Number.isFinite || function(value) { // polyfill for Number.isFinite()
        return typeof value === 'number' && isFinite(value);
        // Number.isFinite() is used instead of !Number.isNaN() for example
        // because we want to define a number as a finite value (strings
        // excluded); moreover, Number.isNaN(undefined) will return false for
        // example
    };

    function isNumberAlike(value) {
        var tov = typeof value;
        return (tov === 'number' || tov === 'string') && isFinite(value);
    }

    function isString(value) { return typeof value === 'string' || value instanceof String; }

    var isArray = Array.isArray || function(arg) { // polyfill for Array.isArray()
        return Object.prototype.toString.call(arg) === '[object Array]';
    };

    function isCssColor(value) {
        return typeof CSS !== 'undefined' && CSS.supports ? CSS.supports('color', value) : null;
    }

    function isCssColorOrString(value) {
        var isColor = isCssColor(value);
        return isColor !== null ? isColor : isString(value);
    }

    // --- Property Accessor/Modifier ---

    function copyPropsNoCheck(propNames, fromObj, toObj) {
        for(var i = 0; i < propNames.length; i++) {
            var pn = propNames[i];
            toObj[pn] = fromObj[pn];
        }
    }

    function copyPropsAndCheck(propNames, fromObj, toObj, checker) {
        for(var i = 0; i < propNames.length; i++) {
            var pn = propNames[i];
            var fpn = fromObj[pn];
            if(checker(fpn)) toObj[pn] = fpn;
        }
    }

    // --- Formatter ---

    function formatString(str, fmt) {
        return str.replace(/{(\w+)}/g, function(match, c) { // c is the value captured in the match
            return c in fmt ? fmt[c] : match;
        });
    }

    function setStringPrototypeFormat() {
        if(String.prototype.format === undefined) {
            String.prototype.format = function() {
                return formatString(this, arguments);
            };
            String.prototype.format.jsu = true;
            return true;
        }

        var formatSetByJsu = false;
        try {
            // an exception will be thrown if String.prototype.format is not an object for example
            formatSetByJsu = String.prototype.format.jsu === true;
        }
        catch(e) {}
        return formatSetByJsu;
    }

    // --- Parser ---

    function parseInlineCssStyle(styleStr) {
        var elt = document.createElement('span');
        elt.style = styleStr;
        return elt.style; // a CSSStyleDeclaration object
    }

    function parseSuffixedValue(value) {
        var retVal = null;
        var match = (value + '').match(/^\s*(-?[0-9]+\.?[0-9]*)\s*([^\s]*(?:\s+[^\s]+)*)\s*$/); // ?: allows to not create a capturing group
        if(match !== null) {
            retVal = {
                'number': parseFloat(match[1]),
                'suffix': match[2],
            };
        }
        return retVal;
    }

    function parseSpaceAsPerJsonStringify(space) {
        if(isNumber(space) && space >= 0) {
            space = Math.min(Math.floor(space), 10);
            var spaceStr = '';
            for(var i = 0; i < space; i++)
                spaceStr += ' ';
            return spaceStr;
        }
        if(isString(space)) return space.substring(0, 10);
        return '';
    }

    function matchAllAndIndex(str, pattern, ignoreCase) {
        // avoid implicit infinite matches (thus infinite loop) as explained in
        // the notes accompanying the documentation of this function concerning
        // the pattern parameter
        if(pattern === '') pattern = null;

        var flags = 'g';
        if(ignoreCase) flags += 'i';
        var regex = new RegExp(pattern, flags);

        var retVal = {};
        var match = null;
        while((match = regex.exec(str)) !== null) {
            retVal[match.index] = match[0];
        }
        return Object.keys(retVal).length === 0 ? null : retVal;
    }

    function isolateMatchingData(str, pattern, ignoreCase) {
        var retVal = [];
        var matchesByIndex = matchAllAndIndex(str, pattern, ignoreCase);
        if(!matchesByIndex) matchesByIndex = {};
        for(var i = 0; i < str.length;) {
            var iHasAMatch = i in matchesByIndex;
            var iStr = iHasAMatch ? matchesByIndex[i] : str[i];
            retVal.push({
                'value': iStr,
                'matched': iHasAMatch,
                'index': i,
            });
            i += iStr.length;
        }
        return retVal;
    }

    function isolateMatchingValues(str, pattern, ignoreCase) {
        return isolateMatchingData(str, pattern, ignoreCase).map(function(data) {
            return data.value;
        });
    }

    return {
        'setLocalStorageItem': setLocalStorageItem,
        'getLocalStorageItem': getLocalStorageItem,

        'setEltVisible': setEltVisible,
        'isEltVisible': isEltVisible,
        'switchEltVisibility': switchEltVisibility,

        'isBoolean': isBoolean,
        'isNumber': isNumber,
        'isNumberAlike': isNumberAlike,
        'isString': isString,
        'isArray': isArray,
        'isCssColor': isCssColor,
        'isCssColorOrString': isCssColorOrString,

        'copyPropsNoCheck': copyPropsNoCheck,
        'copyPropsAndCheck': copyPropsAndCheck,

        'formatString': formatString,
        'setStringPrototypeFormat': setStringPrototypeFormat,

        'parseInlineCssStyle': parseInlineCssStyle,
        'parseSuffixedValue': parseSuffixedValue,
        'parseSpaceAsPerJsonStringify': parseSpaceAsPerJsonStringify,

        'matchAllAndIndex': matchAllAndIndex,
        'isolateMatchingData': isolateMatchingData,
        'isolateMatchingValues': isolateMatchingValues,
    };
}
);
