(function () {
    var ASSET_ROOT = "assets";

    function image(name) {
        return ASSET_ROOT + "/images/" + name + ".png";
    }

    function sound(name) {
        return ASSET_ROOT + "/sounds/" + name + ".ogg";
    }

    function music(name) {
        return ASSET_ROOT + "/music/" + name + ".ogg";
    }

    function vertShader(name) {
        return ASSET_ROOT + "/shaders/" + name + ".vert";
    }

    function fragShader(name) {
        return ASSET_ROOT + "/shaders/" + name + ".frag";
    }

    function file(path, extension) {
        return ASSET_ROOT + "/" + path + "." + extension;
    }

    window.Paths = {
        image: image,
        sound: sound,
        music: music,
        vertShader: vertShader,
        fragShader: fragShader,
        file: file
    };
})();
