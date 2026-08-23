(function () {
    function PlayState() {
        this.canvas = document.getElementById("game-canvas");
        this.ctx = this.canvas.getContext("2d");

        this.camera = new Camera(this.canvas);

        this.player = {
            x: 0,
            y: 0,
            width: 40,
            height: 40,
            speed: 300,
            sprite: Assets.getImage("player")
        };

        this.paused = false;
        this.active = false;

        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.loop = this.loop.bind(this);

        this.lastTime = 0;
    }

    PlayState.prototype.create = function () {
        this.active = true;
        this.paused = false;

        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("game-pause", this.handlePause.bind(this));
        window.addEventListener("game-resume", this.handleResume.bind(this));

        this.camera.follow(this.player, 0.15);

        this.lastTime = 0;
        requestAnimationFrame(this.loop);
    };

    PlayState.prototype.onKeyDown = function (e) {
        if (e.key === "Escape" || e.key === "p") {
            this.togglePause();
        }
    };

    PlayState.prototype.togglePause = function () {
        this.paused = !this.paused;
    };

    PlayState.prototype.handlePause = function () {
        this.active = false;
    };

    PlayState.prototype.handleResume = function () {
        this.active = true;
        this.lastTime = 0;
        requestAnimationFrame(this.loop);
    };

    PlayState.prototype.loop = function (timestamp) {
        if (!this.active) {
            return;
        }

        var delta = this.lastTime ? (timestamp - this.lastTime) / 1000 : 0;
        this.lastTime = timestamp;

        this.update(delta);
        this.render();

        requestAnimationFrame(this.loop);
    };

    PlayState.prototype.update = function (delta) {
        if (this.paused) {
            return;
        }

        var moveX = 0;
        var moveY = 0;

        if (Controls.pressed("LEFT")) moveX -= 1;
        if (Controls.pressed("RIGHT")) moveX += 1;
        if (Controls.pressed("UP")) moveY -= 1;
        if (Controls.pressed("DOWN")) moveY += 1;

        if (moveX !== 0 && moveY !== 0) {
            var length = Math.sqrt(moveX * moveX + moveY * moveY);
            moveX /= length;
            moveY /= length;
        }

        this.player.x += moveX * this.player.speed * delta;
        this.player.y += moveY * this.player.speed * delta;

        if (Controls.justPressed("BACK")) {
            window.dispatchEvent(new CustomEvent("menu-select", { detail: "Back" }));
        }

        this.camera.update(delta);
    };

    PlayState.prototype.render = function () {
        var ctx = this.ctx;
        var width = this.canvas.width;
        var height = this.canvas.height;

        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = "#222222";
        ctx.fillRect(0, 0, width, height);

        this.camera.begin(ctx);

        var sprite = this.player.sprite;
        var drawX = this.player.x - this.player.width / 2;
        var drawY = this.player.y - this.player.height / 2;

        if (sprite.complete && sprite.naturalWidth > 0) {
            ctx.drawImage(sprite, drawX, drawY, this.player.width, this.player.height);
        } else {
            ctx.fillStyle = "#ffcc00";
            ctx.fillRect(drawX, drawY, this.player.width, this.player.height);
        }

        this.camera.end(ctx);

        if (this.paused) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = "#ffffff";
            ctx.font = "48px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Paused", width / 2, height / 2);
        }
    };

    PlayState.prototype.onResize = function () {
        this.camera.applyBounds();
    };

    PlayState.prototype.destroy = function () {
        this.active = false;
        window.removeEventListener("keydown", this.onKeyDown);
    };

    window.PlayState = PlayState;
})();
