# jsu_event

- [EventTarget()](#jsuevteventtarget)
- [createTimer()](#jsuevtcreatetimerconfig)

## JsuEvt.EventTarget()

Constructor function implementing the JavaScript `EventTarget` interface.
Returns a new object hosting functions of the interface thereof as custom
properties. The returned object can be extended with new properties if
necessary.

```javascript
// Example
(function() {
    const accelerate = function(e) { console.log('speed increased!'); };
    const decelerate = function(e) { console.log('speed decreased!'); };

    const eTarget = new JsuEvt.EventTarget();
    eTarget.addEventListener('faster', accelerate);
    eTarget.addEventListener('slower', decelerate);

    // events will be dispatched
    eTarget.dispatchEvent(new Event('faster'));
    eTarget.dispatchEvent(new Event('faster'));
    eTarget.dispatchEvent(new Event('slower'));

    eTarget.removeEventListener('faster', accelerate);
    eTarget.removeEventListener('slower', decelerate);

    // events will not be dispatched
    eTarget.dispatchEvent(new Event('faster'));
    eTarget.dispatchEvent(new Event('slower'));
})();
```

## JsuEvt.createTimer(config)

Creates and returns a timer object which is an instance of `JsuEvt.EventTarget`.
- `config`: optional object to use to configure the timer; can have the
following optional properties.
    - `timeoutLimit`: indicates the number of timeout allowed for the timer
    before it is automatically stopped; must be a number greater than or equal
    to 1, otherwise no limit is set (i.e. the timeout limit is -1 and an
    explicit `stop()` is necessary to stop the timer). Note that floating point
    numbers will be truncated using `Math.floor()` to get an integer.

The returned object provides the following functions.
- `start(delay)`: starts the timer given a delay parameter in milliseconds which
must be positive, otherwise `0` is assumed; does nothing if the timer has
already started. Note that a timer times out on every delay until it is stopped:
a `'timeout'` event is sent to the timer each time and a `'stopped'` event is
sent to the timer only after it has stopped.
- `stop()`: stops the timer; does nothing if the timer is not running.
- `isRunning()`: returns whether the timer is running (i.e. it has been started
but not stopped).
- `getDelay()`: returns the delay value set internally on `start()`.
- `getTimeoutCount()`: returns the number of times the timer has timed out since
`start()`; so the number of timeouts is only cleared on `start()`, not when
`stop()` is called.
- `getTimeoutLimit()`: returns the timeout limit set internally for the timer
upon creation.
- `isSingleShot()`: returns whether the timeout limit is 1 (i.e. the timer is a
single-shot timer).

```javascript
// Basic example
(function() {
    const timer = JsuEvt.createTimer({'timeoutLimit': 2});
    timer.addEventListener('timeout', function(e) {
        console.log('timer timed out', e.detail.count, e.detail.source.isRunning());
    });
    timer.addEventListener('stopped', function(e) {
        console.log('timer stopped', e.detail.count, e.detail.source.isRunning());
    });
    timer.start(100);
})();
```

```javascript
// Detailed example
(function() {
    function logTimerEvent(e, msg) {
        console.log(
            '(' + e.detail.count + ') ' + msg + ':',
            e.detail.source.getTimeoutLimit(),
            e.detail,
        );
    }

    console.log('sTimer stands for "single-shot timer" (timeout limit set to 1)');
    console.log('iTimer stands for "infinite timer" (timeout limit not set)');
    console.log('---');

    const sTimer = JsuEvt.createTimer({'timeoutLimit': 1});
    sTimer.addEventListener('timeout', function(e) {
        logTimerEvent(e, 'sTimer event');
    });
    sTimer.addEventListener('stopped', function(e) {
        console.log('sTimer stopped');
    });
    sTimer.start(200);
    console.log('sTimer started');

    const iTimer = JsuEvt.createTimer();
    iTimer.addEventListener('timeout', function(e) {
        logTimerEvent(e, 'iTimer event');
        if(e.detail.count === 3) {
            console.log('explicitly stop iTimer after %d timeouts', e.detail.count);
            e.detail.source.stop(); // same as iTimer.stop()
        }
    });
    iTimer.addEventListener('stopped', function(e) {
        console.log('iTimer stopped');
    });
    iTimer.start(25);
    console.log('iTimer started');

    const cTimer = JsuEvt.createTimer(); // checker timer
    cTimer.addEventListener('timeout', function(e) {
        if(!sTimer.isRunning() && !iTimer.isRunning()) {
            console.log('---');
            console.log('no more timer running');
            cTimer.stop();
        }
    });
    cTimer.start(300);
})();
```
