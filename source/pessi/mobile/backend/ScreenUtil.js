(function () {
    function getSafeAreaInsets() {
        var style = getComputedStyle(document.documentElement);

        function readInset(name) {
            var value = style.getPropertyValue(name);
            return parseInt(value, 10) || 0;
        }

        return {
            top: readInset("--safe-area-top") || readInset("env(safe-area-inset-top)") || 0,
            right: readInset("--safe-area-right") || 0,
            bottom: readInset("--safe-area-bottom") || 0,
            left: readInset("--safe-area-left") || 0
        };
    }

    function computeSafeAreaInsets() {
        var probe = document.createElement("div");
        probe.style.position = "fixed";
        probe.style.top = "0";
        probe.style.left = "0";
        probe.style.width = "0";
        probe.style.height = "0";
        probe.style.paddingTop = "env(safe-area-inset-top)";
        probe.style.paddingRight = "env(safe-area-inset-right)";
        probe.style.paddingBottom = "env(safe-area-inset-bottom)";
        probe.style.paddingLeft = "env(safe-area-inset-left)";
        document.body.appendChild(probe);

        var computed = getComputedStyle(probe);
        var insets = {
            top: parseInt(computed.paddingTop, 10) || 0,
            right: parseInt(computed.paddingRight, 10) || 0,
            bottom: parseInt(computed.paddingBottom, 10) || 0,
            left: parseInt(computed.paddingLeft, 10) || 0
        };

        document.body.removeChild(probe);

        return insets;
    }

    function getOrientation() {
        if (screen.orientation && screen.orientation.type) {
            return screen.orientation.type.indexOf("landscape") !== -1 ? "landscape" : "portrait";
        }

        return window.innerWidth >= window.innerHeight ? "landscape" : "portrait";
    }

    function isPortrait() {
        return getOrientation() === "portrait";
    }

    function isLandscape() {
        return getOrientation() === "landscape";
    }

    function lockOrientation(type) {
        if (screen.orientation && screen.orientation.lock) {
            return screen.orientation.lock(type).catch(function () {});
        }
        return Promise.resolve();
    }

    function unlockOrientation() {
        if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
        }
    }

    function getDevicePixelRatio() {
        return window.devicePixelRatio || 1;
    }

    function getScreenSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    }

    function isTouchDevice() {
        return "ontouchstart" in window || navigator.maxTouchPoints > 0;
    }

    function isStandalone() {
        return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    }

    function isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    function isAndroid() {
        return /Android/.test(navigator.userAgent);
    }

    function isMobile() {
        return isIOS() || isAndroid() || (isTouchDevice() && Math.min(window.innerWidth, window.innerHeight) <= 820);
    }

    function onOrientationChange(callback) {
        var handler = function () {
            callback(getOrientation());
        };

        if (screen.orientation) {
            screen.orientation.addEventListener("change", handler);
        } else {
            window.addEventListener("orientationchange", handler);
        }

        return handler;
    }

    function offOrientationChange(handler) {
        if (screen.orientation) {
            screen.orientation.removeEventListener("change", handler);
        } else {
            window.removeEventListener("orientationchange", handler);
        }
    }

    window.ScreenUtil = {
        getSafeAreaInsets: computeSafeAreaInsets,
        getOrientation: getOrientation,
        isPortrait: isPortrait,
        isLandscape: isLandscape,
        lockOrientation: lockOrientation,
        unlockOrientation: unlockOrientation,
        getDevicePixelRatio: getDevicePixelRatio,
        getScreenSize: getScreenSize,
        isTouchDevice: isTouchDevice,
        isStandalone: isStandalone,
        isIOS: isIOS,
        isAndroid: isAndroid,
        isMobile: isMobile,
        onOrientationChange: onOrientationChange,
        offOrientationChange: offOrientationChange
    };
})();
