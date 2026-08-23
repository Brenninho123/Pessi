(function () {
    var canvas = document.getElementById("game-canvas");
    var container = document.getElementById("game-container");

    var currentState = null;
    var paused = false;
    var lastTime = 0;
    var fps = 0;
    var fpsAccumulator = 0;
    var fpsFrames = 0;
    var booted = false;

    var SAVE_KEY = "pessi_save_data";
    var SAVE_VERSION = 1;

    var defaultSaveData = {
        version: SAVE_VERSION,
        settings: {
            musicVolume: 1,
            soundVolume: 1,
            fullscreen: false
        },
        keyBinds: null,
        progress: {}
    };

    var saveData = null;
    var saveDebounceTimer = null;

    function loadSave() {
        var raw = localStorage.getItem(SAVE_KEY);

        if (!raw) {
            saveData = JSON.parse(JSON.stringify(defaultSaveData));
            return saveData;
        }

        try {
            var parsed = JSON.parse(raw);

            if (parsed.version !== SAVE_VERSION) {
                parsed = migrateSave(parsed);
            }

            saveData = Object.assign(JSON.parse(JSON.stringify(defaultSaveData)), parsed);
            saveData.settings = Object.assign({}, defaultSaveData.settings, parsed.settings);
        } catch (e) {
            saveData = JSON.parse(JSON.stringify(defaultSaveData));
        }

        return saveData;
    }

    function migrateSave(oldData) {
        oldData.version = SAVE_VERSION;
        return oldData;
    }

    function writeSave() {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        } catch (e) {
            console.error("[Pessi] failed to write save data");
        }
    }

    function persistSave() {
        clearTimeout(saveDebounceTimer);
        saveDebounceTimer = setTimeout(writeSave, 300);
    }

    function getSetting(key) {
        return saveData.settings[key];
    }

    function setSetting(key, value) {
        saveData.settings[key] = value;
        persistSave();
        window.dispatchEvent(new CustomEvent("settings-changed", { detail: { key: key, value: value } }));
    }

    function getProgress(key) {
        return saveData.progress[key];
    }

    function setProgress(key, value) {
        saveData.progress[key] = value;
        persistSave();
    }

    function saveKeyBinds() {
        saveData.keyBinds = Controls.getBinds();
        persistSave();
    }

    function loadKeyBinds() {
        if (saveData.keyBinds) {
            for (var action in saveData.keyBinds) {
                var keys = saveData.keyBinds[action];
                if (keys && keys[0]) {
                    Controls.rebind(action, keys[0]);
                }
            }
        }
    }

    function resetSave() {
        saveData = JSON.parse(JSON.stringify(defaultSaveData));
        writeSave();
        Controls.resetBinds();
    }

    function applySettingsToSystems() {
        if (getSetting("fullscreen") && !document.fullscreenElement) {
            VirtualPad.toggleFullscreen();
        }
    }

    function resizeCanvas() {
        var dpr = ScreenUtil.getDevicePixelRatio();
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
        Options: OptionsState,
        Play: PlayState
    };

    function handleMenuSelect(e) {
        var choice = e.detail;

        if (choice === "Play") {
            switchState(states.Play);
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
        var delta = lastTime ? (timestamp - timestamp) / 1000 : 0;
        delta = lastTime ? (timestamp - lastTime) / 1000 : 0;
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

    function applyMobileLayout() {
        var mobile = ScreenUtil.isMobile();

        if (mobile) {
            VirtualPad.show();
        } else {
            VirtualPad.hide();
        }

        document.body.classList.toggle("is-mobile", mobile);
        document.body.classList.toggle("is-desktop", !mobile);
        document.body.classList.toggle("is-touch", ScreenUtil.isTouchDevice());
        document.body.classList.toggle("is-standalone", ScreenUtil.isStandalone());
    }

    function setupOrientationHandling() {
        ScreenUtil.onOrientationChange(function () {
            setTimeout(function () {
                setViewportHeight();
                resizeCanvas();
                applyMobileLayout();
            }, 100);
        });
    }

    function boot() {
        if (booted) {
            return;
        }
        booted = true;

        loadSave();
        Controls.init();
        loadKeyBinds();
        VirtualPad.init();
        applySettingsToSystems();

        switchState(states.MainMenu);

        requestAnimationFrame(gameLoop);
    }

    function init() {
        window.onerror = onError;

        DiscordLogin.handleRedirect();

        setViewportHeight();
        resizeCanvas();
        applyMobileLayout();

        if (ScreenUtil.isTouchDevice()) {
            preventDoubleTapZoom();
            preventOverscroll();
        }

        window.addEventListener("resize", function () {
            setViewportHeight();
            resizeCanvas();
            applyMobileLayout();
        });

        setupOrientationHandling();

        window.addEventListener("game-pause", function () {
            paused = true;
        });

        window.addEventListener("game-resume", function () {
            paused = false;
            lastTime = 0;
        });

        window.addEventListener("menu-select", handleMenuSelect);
        window.addEventListener("beforeunload", writeSave);

        document.addEventListener("contextmenu", preventGesture);
        document.addEventListener("gesturestart", preventGesture);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        boot();
    }

    window.Pessi = {
        switchState: switchState,
        registerState: function (name, StateClass) {
            states[name] = StateClass;
        },
        getFps: function () {
            return fps;
        },
        isPaused: function () {
            return paused;
        },
        save: {
            getSetting: getSetting,
            setSetting: setSetting,
            getProgress: getProgress,
            setProgress: setProgress,
            saveKeyBinds: saveKeyBinds,
            reset: resetSave,
            write: writeSave
        }
    };

    document.addEventListener("DOMContentLoaded", init);
})();
