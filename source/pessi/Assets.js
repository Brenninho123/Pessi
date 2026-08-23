(function () {
    var imageCache = {};
    var soundCache = {};
    var loadedCount = 0;
    var totalCount = 0;

    function loadImage(name) {
        if (imageCache[name]) {
            return imageCache[name];
        }

        var img = new Image();
        totalCount++;

        img.onload = function () {
            loadedCount++;
        };

        img.onerror = function () {
            loadedCount++;
            console.error("[Assets] failed to load image: " + name);
        };

        img.src = Paths.image(name);
        imageCache[name] = img;

        return img;
    }

    function loadSound(name, isMusic) {
        if (soundCache[name]) {
            return soundCache[name];
        }

        var audio = new Audio();
        totalCount++;

        audio.oncanplaythrough = function () {
            loadedCount++;
        };

        audio.onerror = function () {
            loadedCount++;
            console.error("[Assets] failed to load sound: " + name);
        };

        audio.src = isMusic ? Paths.music(name) : Paths.sound(name);
        audio.preload = "auto";

        soundCache[name] = audio;

        return audio;
    }

    function getImage(name) {
        return imageCache[name] || loadImage(name);
    }

    function getSound(name) {
        return soundCache[name] || loadSound(name, false);
    }

    function getMusic(name) {
        return soundCache[name] || loadSound(name, true);
    }

    function playSound(name, volume) {
        var base = getSound(name);
        var instance = base.cloneNode(true);
        instance.volume = volume !== undefined ? volume : 1;
        instance.play();
        return instance;
    }

    function getProgress() {
        if (totalCount === 0) {
            return 1;
        }
        return loadedCount / totalCount;
    }

    function isReady() {
        return loadedCount >= totalCount;
    }

    function clear() {
        imageCache = {};
        soundCache = {};
        loadedCount = 0;
        totalCount = 0;
    }

    window.Assets = {
        image: loadImage,
        sound: loadSound,
        music: loadSound,
        getImage: getImage,
        getSound: getSound,
        getMusic: getMusic,
        playSound: playSound,
        getProgress: getProgress,
        isReady: isReady,
        clear: clear
    };
})();
