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
    var API = {};

    // --- Local Storage ---

    API.setLocalStorageItem = function(key, value) {
        try { // see (1) below
            if(window.localStorage) {
                window.localStorage.setItem(key, value);
                return true;
            }
        } catch(e) {}
        return false;
    };

    API.getLocalStorageItem = function(key) {
        try { // see (1) below
            return window.localStorage ? window.localStorage.getItem(key)
                                       : null; // returning null because getItem() also returns null when key does not exist
        } catch(e) {}
        return null; // returning null here too
    };

    // (1) An exception might be raised when trying to access window.localStorage,
    //     for example when cookies are blocked. So access to the storage must
    //     be wrapped in a try-catch block.

    // --- CSS Visibility ---

    API.setEltVisible = function(elt, vis, dsp) {
        elt.style.display = vis ? (dsp && dsp !== 'none' ? dsp : 'revert')
                                : 'none';
    };

    API.isEltVisible = function(elt) {
        return window.getComputedStyle(elt, null).display !== 'none';
        // getComputedStyle() must be used so that styles in external stylesheets are inspected
    };

    API.switchEltVisibility = function(elt, dsp) {
        API.setEltVisible(elt, !API.isEltVisible(elt), dsp);
    };

    // --- Type Checker ---

    API.isBoolean = function(value) { return typeof value === 'boolean'; };

    API._getIsNumberImpl = function() { // introduced so that all implementations can be easily tested
        return Number.isFinite || function(value) { // polyfill for Number.isFinite()
            return typeof value === 'number' && isFinite(value);
        }; // Number.isFinite() is used because we want to define a number as a finite value (strings excluded)
    };
    API.isNumber = API._getIsNumberImpl();

    API.isNumberAlike = function(value) {
        var tov = typeof value;
        return (tov === 'number' || tov === 'string') && isFinite(value);
    };

    API.isString = function(value) { return typeof value === 'string' || value instanceof String; };

    API._getIsArrayImpl = function() { // introduced so that all implementations can be easily tested
        return Array.isArray || function(value) { // polyfill for Array.isArray()
            return Object.prototype.toString.call(value) === '[object Array]';
        };
    };
    API.isArray = API._getIsArrayImpl();

    API.isCssColor = function(value) {
        return typeof CSS !== 'undefined' && CSS.supports ? CSS.supports('color', value) : null;
    };

    API.isCssColorOrString = function(value) {
        var isColor = API.isCssColor(value);
        return isColor !== null ? isColor : API.isString(value);
    };

    // for internal use, regardless of whether the corresponding API.* property
    // is later changed, because its initial value is sufficient
    var _isArray = API.isArray;

    // --- Property Accessor/Modifier ---

    API.copyPropsNoCheck = function(propNames, fromObj, toObj) {
        for(var i = 0; i < propNames.length; i++) {
            var pn = propNames[i];
            toObj[pn] = fromObj[pn];
        }
    };

    API.copyPropsAndCheck = function(propNames, fromObj, toObj, checker) {
        for(var i = 0; i < propNames.length; i++) {
            var pn = propNames[i];
            var fpn = fromObj[pn];
            if(checker(fpn)) toObj[pn] = fpn;
        }
    };

    // --- Formatter ---

    API.formatString = function(str, fmt) {
        return str.replace(/{(\w+)}/g, function(match, c) { // c is the value captured in the match
            return c in fmt ? fmt[c] : match;
        });
    };

    API.setStringPrototypeFormat = function() {
        if(String.prototype.format === undefined) {
            String.prototype.format = function() {
                return API.formatString(this, arguments);
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
    };

    // --- Parser ---

    API.parseInlineCssStyle = function(styleStr) {
        var elt = document.createElement('span');
        elt.style = styleStr;
        return elt.style; // a CSSStyleDeclaration object
    };

    API.parseSuffixedValue = function(value) {
        var retVal = null;
        var match = (value + '').match(/^\s*(-?[0-9]+\.?[0-9]*)\s*([^\s]*(?:\s+[^\s]+)*)\s*$/); // ?: allows to not create a capturing group
        if(match !== null) {
            retVal = {
                'number': parseFloat(match[1]),
                'suffix': match[2],
            };
        }
        return retVal;
    };

    API.parseSpaceAsPerJsonStringify = function(space) {
        if(API.isNumber(space) && space >= 0) {
            space = Math.min(Math.floor(space), 10);
            var spaceStr = '';
            for(var i = 0; i < space; i++)
                spaceStr += ' ';
            return spaceStr;
        }
        if(API.isString(space)) return space.substring(0, 10);
        return '';
    };

    API.matchAllAndIndex = function(str, pattern, ignoreCase) {
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
    };

    API.isolateMatchingData = function(str, pattern, ignoreCase) {
        var retVal = [];
        var matchesByIndex = API.matchAllAndIndex(str, pattern, ignoreCase);
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
    };

    API.isolateMatchingValues = function(str, pattern, ignoreCase) {
        return API.isolateMatchingData(str, pattern, ignoreCase).map(function(data) {
            return data.value;
        });
    };

    // --- Others ---

    function _cloneDeep(value, cache, cloneCustomImpl) {
        switch(typeof value) {
            case 'undefined':
            case 'boolean':
            case 'number':
            case 'bigint':
            case 'string':
            case 'function':
                return value;

            case 'symbol': {
                var copy1 = cache.get(value);
                return copy1 !== undefined ? copy1 : cache.add(value, Symbol(value.description));
            }

            default: { // case 'object'
                if(value === null) return value;

                var copy2 = cache.get(value);
                if(copy2 !== undefined) return copy2;
                if(value instanceof Boolean) return cache.add(value, new Boolean(value.valueOf()));
                if(value instanceof Date) return cache.add(value, new Date(value.valueOf()));
                if(value instanceof Number) return cache.add(value, new Number(value.valueOf()));
                if(value instanceof String) return cache.add(value, new String(value.valueOf()));

                var i = -1;
                if(_isArray(value)) {
                    copy2 = [];
                    cache.add(value, copy2); // cache data before the recursive _cloneDeep() calls below
                    var valueLen = value.length;
                    for(i = 0; i < valueLen; i++) {
                        copy2.push(_cloneDeep(value[i], cache, cloneCustomImpl));
                    }
                }
                else if(cloneCustomImpl && ((copy2 = cloneCustomImpl(value, cache)) !== undefined)) {
                    // nothing to do because value is already cloned
                }
                else {
                    // clone object based on Object.keys()
                    //     i.e. inherited and non-enumerable properties are ignored
                    // this is enough for object literals ({...})
                    //     e.g. {x:3, y:{}, z:[null, {}, Symbol()]}
                    // all the JavaScript built-in objects that one might want to support can be found at
                    //     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
                    copy2 = {};
                    cache.add(value, copy2); // cache data before the recursive _cloneDeep() calls below
                    var valueKeys = Object.keys(value);
                    var valueKeysLen = valueKeys.length;
                    for(i = 0; i < valueKeysLen; i++) {
                        var prop = valueKeys[i];
                        copy2[prop] = _cloneDeep(value[prop], cache, cloneCustomImpl);
                    }
                }
                return copy2;
            }
        }
    }

    API.cloneDeep = function(value, cache, cloneCustomImpl) {
        if(!cache) {
            cache = {
                _keys: [],
                _vals: [],
                // returns the value to which key is mapped, or undefined if key is not found
                // key can be anything including an object
                get: function(key) {
                    var idx = this._keys.indexOf(key);
                    return idx !== -1 ? this._vals[idx] : undefined;
                },
                // maps key to val (which must not be undefined because get() returns undefined if key is not found)
                // must be called only if get(key) did not find an entry
                //     this is to prevent key from being added more than once
                // returns val
                add: function(key, val) {
                    this._keys.push(key);
                    this._vals.push(val);
                    return val;
                },
            };
        }
        return _cloneDeep(value, cache, cloneCustomImpl);
    };

    return API;
}
);
