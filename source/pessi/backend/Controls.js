(function () {
    var keyBinds = {
        LEFT: ["ArrowLeft", "a"],
        DOWN: ["ArrowDown", "s"],
        UP: ["ArrowUp", "w"],
        RIGHT: ["ArrowRight", "d"],
        ACCEPT: ["Enter"],
        BACK: ["Escape"],
        PAUSE: ["Escape", "p"]
    };

    var pressed = {};
    var justPressed = {};
    var justReleased = {};

    function resolveAction(key) {
        for (var action in keyBinds) {
            if (keyBinds[action].indexOf(key) !== -1) {
                return action;
            }
        }
        return null;
    }

    function onKeyDown(e) {
        var action = resolveAction(e.key);
        if (!action) {
            return;
        }

        if (!pressed[action]) {
            justPressed[action] = true;
        }

        pressed[action] = true;
    }

    function onKeyUp(e) {
        var action = resolveAction(e.key);
        if (!action) {
            return;
        }

        pressed[action] = false;
        justReleased[action] = true;
    }

    function update() {
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

    function init() {
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        window.addEventListener("blur", function () {
            pressed = {};
        });
    }

    window.Controls = {
        init: init,
        update: update,
        pressed: isPressed,
        justPressed: isJustPressed,
        justReleased: isJustReleased
    };
})();
