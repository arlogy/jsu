/*
 https://github.com/arlogy/jsu
 Released under the MIT License (see LICENSE file)
 Copyright (c) 2022 https://github.com/arlogy
*/

let { randomUUID } = require('crypto');
if(!randomUUID) { // in browsers for example
    randomUUID = () => new Date().toISOString() + Math.random();
}

// returns an arbitrary unique value that we don't care what it is
const dummy = () => 'dummy-' + randomUUID();

// returns if an object has only certain specific properties
const objectHasOnlyProperties = (obj, props) => {
    // all properties in obj (own or inherited from its prototype chain) must be in props
    for(const p in obj) {
        if(props.indexOf(p) === -1) return false;
    }
    // all properties in props must be in obj
    return props.every(p => p in obj);
};

module.exports = {
    dummy,
    objectHasOnlyProperties,
};
