/*
 https://github.com/arlogy/jsu
 Released under the MIT License (see LICENSE file)
 Copyright (c) 2022 https://github.com/arlogy
*/

// helps to simulate (mock) JavaScript implementations
const jsImpl = {
    'mock': function(dataMap) { // dataMap contains key/value pairs
                                // example using jsdom: {'document': new JSDOM('<!DOCTYPE html><html></html>').window.document}
        const initialObj = this._initial;
        for(const prop in dataMap) {
            if(prop in initialObj) global[prop] = dataMap[prop];
            else throw new Error("Unable to mock unknown native '" + prop + "' property");
        }
    },
    'resetAll': function() {
        const initialObj = this._initial;
        for(const prop in initialObj) {
            const initialImpl = initialObj[prop];
            global[prop] = initialImpl.value;
            if(!initialImpl.inGlobal) delete global[prop];
        }
    },
    'mockIn': function(mockingFunc) {
        try { mockingFunc(); }
        finally { this.resetAll(); }
    },
    '_initial': { // contains initial information about native JavaScript features
        'CSS': {
            'value': typeof CSS === 'undefined' ? undefined : CSS,
            'inGlobal': 'CSS' in global,
        },
        'CustomEvent': {
            'value': typeof CustomEvent === 'undefined' ? undefined : CustomEvent,
            'inGlobal': 'CustomEvent' in global,
        },
        'document': {
            'value': typeof document === 'undefined' ? undefined : document,
            'inGlobal': 'document' in global,
        },
        'Event': {
            'value': typeof Event === 'undefined' ? undefined : Event,
            'inGlobal': 'Event' in global,
        },
        'EventTarget': {
            'value': typeof EventTarget === 'undefined' ? undefined : EventTarget,
            'inGlobal': 'EventTarget' in global,
        },
        'window': {
            'value': typeof window === 'undefined' ? undefined : window,
            'inGlobal': 'window' in global,
        },
    },
};

function objectHasOnlyProperties(obj, props) {
    // all properties in obj (own or inherited from its prototype chain) must be in props
    for(const p in obj) {
        if(props.indexOf(p) === -1) return false;
    }
    // all properties in props must be in obj
    return props.every(p => p in obj);
}

module.exports = {
    jsImpl,
    objectHasOnlyProperties
};
