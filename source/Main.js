(function () {
    var canvas = document.getElementById("game-canvas");
    var container = document.getElementById("game-container");

    var currentState = null;
    var paused = false;
    var lastTime = 0;
    var fps = 0;
    var fpsAccumulator = 0;
    var fpsFrames = 0;

    function resizeCanvas() {
        var dpr = window.devicePixelRatio || 1;
        var rect = container.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + "px";
        canvas.style.height = rect.height + "px";

        if (currentState && typeof currentState.onResize === "function") {
            currentState.onResize(rect.width, rect.height);
        }
    }

    function setViewportHeight() {
        var vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--vh", vh + "px");
    }

    function preventGesture(e) {
        e.preventDefault();
    }

    function preventDoubleTapZoom() {
        var lastTouch = 0;
        document.addEventListener("touchend", function (e) {
            var now = Date.now();
            if (now - lastTouch <= 300) {
                e.preventDefault();
            }
            lastTouch = now;
        }, { passive: false });
    }

    function preventOverscroll() {
        document.body.addEventListener("touchmove", function (e) {
            e.preventDefault();
        }, { passive: false });
    }

    function handleVisibilityChange() {
        if (document.hidden) {
            window.dispatchEvent(new Event("game-pause"));
        } else {
            window.dispatchEvent(new Event("game-resume"));
        }
    }

    function switchState(StateClass) {
        if (currentState && typeof currentState.destroy === "function") {
            currentState.destroy();
        }

        currentState = new StateClass();
        currentState.create();
    }

    var states = {
        MainMenu: MainMenuState,
        Options: OptionsState
    };

    function handleMenuSelect(e) {
        var choice = e.detail;

        if (choice === "Play") {
            if (states.PlayState) {
                switchState(states.PlayState);
            }
        } else if (choice === "Options") {
            switchState(states.Options);
        } else if (choice === "Back") {
            switchState(states.MainMenu);
        }
    }

    function updateFps(delta) {
        fpsAccumulator += delta;
        fpsFrames++;

        if (fpsAccumulator >= 1) {
            fps = fpsFrames;
            fpsFrames = 0;
            fpsAccumulator = 0;
        }
    }

    function gameLoop(timestamp) {
        var delta = lastTime ? (timestamp - lastTime) / 1000 : 0;
        lastTime = timestamp;

        if (!paused) {
            Controls.update();
            updateFps(delta);

            if (currentState && typeof currentState.update === "function") {
                currentState.update(delta);
            }
        }

        requestAnimationFrame(gameLoop);
    }

    function onError(message, source, lineno, colno, error) {
        console.error("[Pessi] " + message + " at " + source + ":" + lineno + ":" + colno);
    }

    function init() {
        window.onerror = onError;

        DiscordLogin.handleRedirect();

        setViewportHeight();
        resizeCanvas();
        preventDoubleTapZoom();
        preventOverscroll();

        window.addEventListener("resize", function () {
            setViewportHeight();
            resizeCanvas();
        });

        window.addEventListener("orientationchange", function () {
            setTimeout(function () {
                setViewportHeight();
                resizeCanvas();
            }, 100);
        });

        window.addEventListener("game-pause", function () {
            paused = true;
        });

        window.addEventListener("game-resume", function () {
            paused = false;
            lastTime = 0;
        });

        window.addEventListener("menu-select", handleMenuSelect);

        document.addEventListener("contextmenu", preventGesture);
        document.addEventListener("gesturestart", preventGesture);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        Controls.init();

        switchState(states.MainMenu);

        requestAnimationFrame(gameLoop);
    }

    window.Pessi = {
        switchState: switchState,
        registerState: function (name, StateClass) {
            states[name] = StateClass;
        },
        getFps: function () {
            return fps;
        }
    };

    document.addEventListener("DOMContentLoaded", init);
})();
