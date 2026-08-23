(function () {
    var defaultBinds = {
        LEFT: ["ArrowLeft", "a"],
        DOWN: ["ArrowDown", "s"],
        UP: ["ArrowUp", "w"],
        RIGHT: ["ArrowRight", "d"],
        ACCEPT: ["Enter"],
        BACK: ["Escape"],
        PAUSE: ["Escape", "p"]
    };

    var gamepadBinds = {
        LEFT: [14],
        DOWN: [13],
        UP: [12],
        RIGHT: [15],
        ACCEPT: [0],
        BACK: [1],
        PAUSE: [9]
    };

    var keyBinds = JSON.parse(JSON.stringify(defaultBinds));

    var pressed = {};
    var justPressed = {};
    var justReleased = {};
    var virtualPressed = {};
    var gamepadIndex = null;

    function resolveAction(key) {
        for (var action in keyBinds) {
            if (keyBinds[action].indexOf(key) !== -1) {
                return action;
            }
        }
        return null;
    }

    function setPressed(action, state) {
        if (state && !pressed[action]) {
            justPressed[action] = true;
        }
        if (!state && pressed[action]) {
            justReleased[action] = true;
        }
        pressed[action] = state;
    }

    function onKeyDown(e) {
        var action = resolveAction(e.key);
        if (action) {
            setPressed(action, true);
        }
    }

    function onKeyUp(e) {
        var action = resolveAction(e.key);
        if (action) {
            setPressed(action, false);
        }
    }

    function onGamepadConnected(e) {
        gamepadIndex = e.gamepad.index;
    }

    function onGamepadDisconnected(e) {
        if (gamepadIndex === e.gamepad.index) {
            gamepadIndex = null;
        }
    }

    function pollGamepad() {
        if (gamepadIndex === null) {
            return;
        }

        var pads = navigator.getGamepads ? navigator.getGamepads() : [];
        var pad = pads[gamepadIndex];

        if (!pad) {
            return;
        }

        for (var action in gamepadBinds) {
            var buttons = gamepadBinds[action];
            var state = false;

            for (var i = 0; i < buttons.length; i++) {
                var button = pad.buttons[buttons[i]];
                if (button && button.pressed) {
                    state = true;
                    break;
                }
            }

            var axisThreshold = 0.5;
            if (action === "LEFT" && pad.axes[0] < -axisThreshold) state = true;
            if (action === "RIGHT" && pad.axes[0] > axisThreshold) state = true;
            if (action === "UP" && pad.axes[1] < -axisThreshold) state = true;
            if (action === "DOWN" && pad.axes[1] > axisThreshold) state = true;

            if (!virtualPressed[action]) {
                setPressed(action, state);
            }
        }
    }

    function pollVirtual() {
        for (var action in virtualPressed) {
            if (virtualPressed[action]) {
                setPressed(action, true);
            }
        }
    }

    function update() {
        pollGamepad();
        pollVirtual();

        for (var action in justPressed) {
            justPressed[action] = false;
        }
        for (var action in justReleased) {
            justReleased[action] = false;
        }
    }

    function isPressed(action) {
        return !!pressed[action];
    }

    function isJustPressed(action) {
        return !!justPressed[action];
    }

    function isJustReleased(action) {
        return !!justReleased[action];
    }

    function rebind(action, key) {
        if (!keyBinds[action]) {
            return false;
        }
        keyBinds[action] = [key];
        return true;
    }

    function resetBinds() {
        keyBinds = JSON.parse(JSON.stringify(defaultBinds));
    }

    function getBinds() {
        return JSON.parse(JSON.stringify(keyBinds));
    }

    function setVirtual(action, state) {
        virtualPressed[action] = state;
        if (!state) {
            setPressed(action, false);
        }
    }

    function init() {
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        window.addEventListener("gamepadconnected", onGamepadConnected);
        window.addEventListener("gamepaddisconnected", onGamepadDisconnected);
        window.addEventListener("blur", function () {
            pressed = {};
            virtualPressed = {};
        });
    }

    window.Controls = {
        init: init,
        update: update,
        pressed: isPressed,
        justPressed: isJustPressed,
        justReleased: isJustReleased,
        rebind: rebind,
        resetBinds: resetBinds,
        getBinds: getBinds,
        setVirtual: setVirtual
    };
})();
