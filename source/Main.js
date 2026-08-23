(function () {
    var canvas = document.getElementById("game-canvas");
    var container = document.getElementById("game-container");

    function resizeCanvas() {
        var dpr = window.devicePixelRatio || 1;
        var rect = container.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + "px";
        canvas.style.height = rect.height + "px";
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

    function init() {
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

        document.addEventListener("contextmenu", preventGesture);
        document.addEventListener("gesturestart", preventGesture);
        document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    document.addEventListener("DOMContentLoaded", init);
})();
