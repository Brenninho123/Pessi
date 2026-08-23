(function () {
    var defaultVertexSource = [
        "attribute vec2 a_position;",
        "attribute vec2 a_texCoord;",
        "varying vec2 v_texCoord;",
        "void main() {",
        "    gl_Position = vec4(a_position, 0.0, 1.0);",
        "    v_texCoord = a_texCoord;",
        "}"
    ].join("\n");

    var defaultFragmentSource = [
        "precision mediump float;",
        "varying vec2 v_texCoord;",
        "uniform sampler2D u_texture;",
        "void main() {",
        "    gl_FragColor = texture2D(u_texture, v_texCoord);",
        "}"
    ].join("\n");

    function compileShader(gl, type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            var info = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error("Shader compile error: " + info);
        }

        return shader;
    }

    function createProgram(gl, vertexSource, fragmentSource) {
        var vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
        var fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            var info = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error("Program link error: " + info);
        }

        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        return program;
    }

    function Shader(gl, fragmentSource, vertexSource) {
        this.gl = gl;
        this.program = createProgram(gl, vertexSource || defaultVertexSource, fragmentSource || defaultFragmentSource);
        this.uniformLocations = {};
        this.attribLocations = {};

        this.quadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 0, 0,
            1, -1, 1, 0,
            -1, 1, 0, 1,
            1, 1, 1, 1
        ]), gl.STATIC_DRAW);
    }

    Shader.prototype.getUniformLocation = function (name) {
        if (!(name in this.uniformLocations)) {
            this.uniformLocations[name] = this.gl.getUniformLocation(this.program, name);
        }
        return this.uniformLocations[name];
    };

    Shader.prototype.getAttribLocation = function (name) {
        if (!(name in this.attribLocations)) {
            this.attribLocations[name] = this.gl.getAttribLocation(this.program, name);
        }
        return this.attribLocations[name];
    };

    Shader.prototype.use = function () {
        this.gl.useProgram(this.program);
    };

    Shader.prototype.setUniform1f = function (name, value) {
        this.use();
        this.gl.uniform1f(this.getUniformLocation(name), value);
    };

    Shader.prototype.setUniform2f = function (name, x, y) {
        this.use();
        this.gl.uniform2f(this.getUniformLocation(name), x, y);
    };

    Shader.prototype.setUniform3f = function (name, x, y, z) {
        this.use();
        this.gl.uniform3f(this.getUniformLocation(name), x, y, z);
    };

    Shader.prototype.setUniform4f = function (name, x, y, z, w) {
        this.use();
        this.gl.uniform4f(this.getUniformLocation(name), x, y, z, w);
    };

    Shader.prototype.setUniform1i = function (name, value) {
        this.use();
        this.gl.uniform1i(this.getUniformLocation(name), value);
    };

    Shader.prototype.drawFullscreenQuad = function (texture) {
        var gl = this.gl;

        this.use();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);

        var positionLoc = this.getAttribLocation("a_position");
        var texCoordLoc = this.getAttribLocation("a_texCoord");

        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 16, 0);

        gl.enableVertexAttribArray(texCoordLoc);
        gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 16, 8);

        if (texture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            this.setUniform1i("u_texture", 0);
        }

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    Shader.prototype.destroy = function () {
        var gl = this.gl;
        gl.deleteProgram(this.program);
        gl.deleteBuffer(this.quadBuffer);
    };

    function fromSource(gl, fragmentSource, vertexSource) {
        return new Shader(gl, fragmentSource, vertexSource);
    }

    function createContext(canvas) {
        return canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    }

    window.ShaderSystem = {
        Shader: Shader,
        fromSource: fromSource,
        createContext: createContext,
        defaultVertexSource: defaultVertexSource,
        defaultFragmentSource: defaultFragmentSource
    };
})();
