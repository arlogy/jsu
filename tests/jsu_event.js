/*
 https://github.com/arlogy/jsu
 Released under the MIT License (see LICENSE file)
 Copyright (c) 2022 https://github.com/arlogy
*/

const JsuEvt = require('../src/jsu_event.js');
const { jsImpl, objectHasOnlyProperties } = require('./utils_core.js');
const { funcParams } = require('./utils_test_data.js');
const assert = require('assert');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

(function() {
    // very simple implementation
    const CustomEventImpl = class CustomEvent extends Event {
        constructor(type, options) {
            super(type, options);

            let detail = options.detail;
            // just because the documentation of the JavaScript CustomEvent() constructor states that detail defaults to null
            if(detail === undefined) detail = null;
            this.detail = detail;
        }
    };

    // same implementation as in the code to be tested
    function isNumber(value) {
        return typeof value === 'number' && isFinite(value);
    }

    (function() {
        const dom = new JSDOM('<!DOCTYPE html><html></html>');
        const window = dom.window;
        const document = window.document;
        const mockData = [
            {EventTarget:undefined},
            {EventTarget:window.EventTarget},
        ];
        describe('new JsuEventTarget(), whether JavaScript EventTarget() constructor is supported or not', () => {
            it('should be an instance of JsuEvt.EventTarget', () => {
                jsImpl.mockIn(function() {
                    mockData.forEach(function(mdata) {
                        jsImpl.mock(mdata);
                        if(mdata.EventTarget === undefined) jsImpl.mock({document:document});
                        assert.strictEqual(new JsuEvt.EventTarget() instanceof JsuEvt.EventTarget, true);
                    });
                });
            });
            it('should only have the expected properties', () => {
                const expectedProps = [
                    'addEventListener', 'dispatchEvent', 'removeEventListener',
                ];
                jsImpl.mockIn(function() {
                    mockData.forEach(function(mdata) {
                        jsImpl.mock(mdata);
                        if(mdata.EventTarget === undefined) jsImpl.mock({document:document});
                        const eTarget = new JsuEvt.EventTarget();
                        assert.strictEqual(objectHasOnlyProperties(eTarget, expectedProps), true);
                    });
                });
            });
            it('should correctly handle event listeners', () => {
                jsImpl.mockIn(function() {
                    jsImpl.mock({Event:window.Event});
                    mockData.forEach(function(mdata) {
                        jsImpl.mock(mdata);
                        if(mdata.EventTarget === undefined) jsImpl.mock({document:document});
                        const eventPool = [
                            new Event('acc'), new Event('acc'), new Event('acc'),
                        ];
                        let acc = 0; // accumulator
                        const accumulate = (e) => {
                            if(eventPool.indexOf(e) !== -1) {
                                if(typeof acc === 'number') acc += 5;
                            }
                            else acc = 'Received an event that was not or should not have been dispatched';
                        };
                        const eTarget = new JsuEvt.EventTarget();
                        // add event listener
                        eTarget.addEventListener('acc', accumulate);
                        eTarget.dispatchEvent(eventPool[0]);
                        eTarget.dispatchEvent(eventPool[1]);
                        eTarget.dispatchEvent(new Event('unhandled')); // the listener will not be called
                        assert.strictEqual(acc, 10);
                        // remove event listener
                        eTarget.removeEventListener('unhandled', null); // the listener will not be removed
                        eTarget.dispatchEvent(eventPool[2]);
                        assert.strictEqual(acc, 15);
                        eTarget.removeEventListener('acc', accumulate); // the listener is now removed
                        eTarget.dispatchEvent(new Event('acc'));
                        assert.strictEqual(acc, 15);
                    });
                });
            });
        });
    })();

    (function() {
        const NTL = -1; // no timeout limit (value used when no timeout limit is set for a timer)

        const timeDels = [NTL, ...funcParams]; // values can be used as timeout limits or delays

        const convertTimeoutLimit = (val) => {
            if(isNumber(val)) {
                val = Math.floor(val);
                if(val > 0) return val;
            }
            return NTL;
        };

        const convertDelay = (val) => {
            return isNumber(val) && val >= 0 ? val : 0;
        };

        const testLimit = 9;

        describe('createTimer() from config parameter', () => {
            it('should return a valid timer object', () => {
                const expectedProps = [
                    ...Object.getOwnPropertyNames(new JsuEvt.EventTarget()),
                    'getDelay', 'getTimeoutCount', 'getTimeoutLimit', 'isRunning', 'isSingleShot', 'start', 'stop',
                ];
                timeDels.forEach(function(limit) {
                    const timerData = [
                        {timer:JsuEvt.createTimer(limit), limInConfig:false},
                        {timer:JsuEvt.createTimer({wrongProperty:limit}), limInConfig:false},
                        {timer:JsuEvt.createTimer({timeoutLimit:limit}), limInConfig:true, limVal:limit},
                    ];
                    if(typeof limit !== 'symbol') {
                        const limitStr = limit+'';
                        timerData.push({timer:JsuEvt.createTimer({timeoutLimit:limitStr}), limInConfig:true, limVal:limitStr});
                    }
                    timerData.forEach(function(tdata) {
                        const timer = tdata.timer;
                        const rlimit = tdata.limInConfig ? convertTimeoutLimit(tdata.limVal) : NTL; // real limit
                        assert.strictEqual(timer instanceof JsuEvt.EventTarget, true);
                        assert.strictEqual(objectHasOnlyProperties(timer, expectedProps), true);
                        assert.strictEqual(timer.isRunning(), false);
                        assert.strictEqual(timer.getDelay(), 0);
                        assert.strictEqual(timer.getTimeoutCount(), 0);
                        assert.strictEqual(timer.getTimeoutLimit(), rlimit);
                        assert.strictEqual(timer.isSingleShot(), rlimit === 1);
                    });
                });
            });
        });

        describe('createTimer() then starting and stopping the timer', () => {
            before(() => {
                // runs once before the first test in this block
                // using new JSDOM(...).window.CustomEvent instead of CustomEventImpl results in errors
                jsImpl.mock({CustomEvent:CustomEventImpl});
            });

            after(() => {
                // runs once after the last test in this block
                jsImpl.resetAll();
            });

            describe('start()', () => {
                it('should correctly set timer properties', () => {
                    timeDels.forEach(function(limit) {
                        const rlimit = convertTimeoutLimit(limit); // real limit
                        timeDels.forEach(function(delay) {
                            const timer = JsuEvt.createTimer({timeoutLimit:limit});
                            timer.start(delay);
                            assert.strictEqual(timer.isRunning(), true);
                            assert.strictEqual(timer.getDelay(), convertDelay(delay));
                            assert.strictEqual(timer.getTimeoutCount(), 0);
                            assert.strictEqual(timer.getTimeoutLimit(), rlimit);
                            assert.strictEqual(timer.isSingleShot(), rlimit === 1);
                            timer.stop();
                        });
                    });
                });

                // passed one argument (onFinished) to it(); see the 'asynchronous code' section in the Mocha documentation
                it('should cause the timer to timeout and stop accordingly', function(onFinished) {
                    this.timeout(3000); // set timeout limit for the test case
                    // set a limit for numbers so that each timer doesn't take too long before it times out
                    const entries = timeDels.filter(e => !isNumber(e) || e <= testLimit);
                    entries.push(testLimit); // so the limit can be reached at least once
                    let stoppedTimersCount = 0;
                    entries.forEach(function(limit) {
                        const rlimit = convertTimeoutLimit(limit); // real limit
                        entries.forEach(function(delay) {
                            const rdelay = convertDelay(delay);
                            const timer = JsuEvt.createTimer({timeoutLimit:limit});
                            assert.strictEqual('testTimeoutCount' in timer, false);
                            timer.testTimeoutCount = 0; // custom data
                            timer.addEventListener('timeout', function(e) {
                                timer.testTimeoutCount++;
                                assert.strictEqual(e instanceof CustomEvent, true);
                                assert.deepStrictEqual(e.detail, {count:timer.testTimeoutCount, source:timer});
                                assert.strictEqual(timer.isRunning(), true);
                                assert.strictEqual(timer.getDelay(), rdelay);
                                assert.strictEqual(timer.getTimeoutCount(), timer.testTimeoutCount);
                                assert.strictEqual(timer.getTimeoutLimit(), rlimit);
                                assert.strictEqual(timer.isSingleShot(), rlimit === 1);
                                if(timer.getTimeoutLimit() !== NTL) {
                                    // no need to stop() the timer as it is supposed to timeout as many times as requested
                                }
                                else {
                                    if(timer.testTimeoutCount === 51) // just to stop the timer
                                        timer.stop();
                                }
                            });
                            timer.addEventListener('stopped', function(e) {
                                assert.strictEqual(e instanceof CustomEvent, true);
                                assert.deepStrictEqual(e.detail, {count:timer.testTimeoutCount, source:timer});
                                assert.strictEqual(timer.isRunning(), false);
                                assert.strictEqual(timer.getDelay(), rdelay);
                                assert.strictEqual(timer.getTimeoutCount(), timer.testTimeoutCount);
                                assert.strictEqual(timer.getTimeoutLimit(), rlimit);
                                assert.strictEqual(timer.isSingleShot(), rlimit === 1);
                                // complete the test case when all timers created in the nested for loops are stopped
                                if(++stoppedTimersCount === entries.length * entries.length) onFinished();
                            });
                            timer.start(delay);
                            timer.start(delay); // starting timer more than once should not change anything
                        });
                    });
                });
            });

            describe('stop() without a preceding start()', () => {
                it('should meet expectations on timer properties', () => {
                    timeDels.forEach(function(limit) {
                        const rlimit = convertTimeoutLimit(limit)
                        timeDels.forEach(function(delay) {
                            const timer = JsuEvt.createTimer({timeoutLimit:limit});
                            timer.stop();
                            assert.strictEqual(timer.isRunning(), false);
                            assert.strictEqual(timer.getDelay(), 0);
                            assert.strictEqual(timer.getTimeoutCount(), 0);
                            assert.strictEqual(timer.getTimeoutLimit(), rlimit);
                            assert.strictEqual(timer.isSingleShot(), rlimit === 1);
                        });
                    });
                });
            });
        });
    })();
})();
