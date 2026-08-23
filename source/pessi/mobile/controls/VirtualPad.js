(function () {
    var container = null;
    var fullscreenButton = null;
    var activeTouches = {};

    function isMobileDevice() {
        var hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
        var isSmallScreen = Math.min(window.innerWidth, window.innerHeight) <= 820;
        return hasTouch && isSmallScreen;
    }

    function setPressed(action, state) {
        if (window.Controls && typeof Controls.setVirtual === "function") {
            Controls.setVirtual(action, state);
        }
    }

    function bindButton(button) {
        var action = button.getAttribute("data-action");

        button.addEventListener("touchstart", function (e) {
            e.preventDefault();
            activeTouches[action] = true;
            setPressed(action, true);
            button.classList.add("pressed");
        }, { passive: false });

        button.addEventListener("touchend", function (e) {
            e.preventDefault();
            activeTouches[action] = false;
            setPressed(action, false);
            button.classList.remove("pressed");
        }, { passive: false });

        button.addEventListener("touchcancel", function (e) {
            e.preventDefault();
            activeTouches[action] = false;
            setPressed(action, false);
            button.classList.remove("pressed");
        }, { passive: false });

        button.addEventListener("mousedown", function (e) {
            e.preventDefault();
            setPressed(action, true);
            button.classList.add("pressed");
        });

        button.addEventListener("mouseup", function (e) {
            e.preventDefault();
            setPressed(action, false);
            button.classList.remove("pressed");
        });

        button.addEventListener("mouseleave", function () {
            setPressed(action, false);
            button.classList.remove("pressed");
        });
    }

    function enterFullscreen() {
        var el = document.documentElement;

        if (el.requestFullscreen) {
            el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        }
    }

    function exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }

    function toggleFullscreen() {
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            exitFullscreen();
        } else {
            enterFullscreen();
        }
    }

    function show() {
        if (container) {
            container.classList.add("visible");
        }
    }

    function hide() {
        if (container) {
            container.classList.remove("visible");
        }
    }

    function releaseAll() {
        for (var action in activeTouches) {
            if (activeTouches[action]) {
                setPressed(action, false);
            }
        }
        activeTouches = {};
    }

    function init() {
        container = document.getElementById("touch-controls");
        fullscreenButton = document.getElementById("fullscreen-button");

        if (!container) {
            return;
        }

        var buttons = container.querySelectorAll("button[data-action]");
        for (var i = 0; i < buttons.length; i++) {
            bindButton(buttons[i]);
        }

        if (fullscreenButton) {
            fullscreenButton.addEventListener("click", toggleFullscreen);
            fullscreenButton.style.display = isMobileDevice() ? "none" : "block";
        }

        if (isMobileDevice()) {
            show();
        } else {
            hide();
        }

        window.addEventListener("blur", releaseAll);
        window.addEventListener("resize", function () {
            if (isMobileDevice()) {
                show();
                if (fullscreenButton) {
                    fullscreenButton.style.display = "none";
                }
            } else {
                hide();
                if (fullscreenButton) {
                    fullscreenButton.style.display = "block";
                }
            }
        });
    }

    window.VirtualPad = {
        init: init,
        show: show,
        hide: hide,
        isMobileDevice: isMobileDevice,
        toggleFullscreen: toggleFullscreen
    };
})();
