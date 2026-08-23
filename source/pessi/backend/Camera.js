(function () {
    function Camera(canvas) {
        this.canvas = canvas;
        this.x = 0;
        this.y = 0;
        this.zoom = 1;
        this.rotation = 0;

        this.target = null;
        this.followLerp = 0.1;

        this.bounds = null;

        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
    }

    Camera.prototype.follow = function (target, lerp) {
        this.target = target;
        if (lerp !== undefined) {
            this.followLerp = lerp;
        }
    };

    Camera.prototype.unfollow = function () {
        this.target = null;
    };

    Camera.prototype.setBounds = function (minX, minY, maxX, maxY) {
        this.bounds = { minX: minX, minY: minY, maxX: maxX, maxY: maxY };
    };

    Camera.prototype.clearBounds = function () {
        this.bounds = null;
    };

    Camera.prototype.shake = function (intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    };

    Camera.prototype.applyBounds = function () {
        if (!this.bounds) {
            return;
        }

        var halfWidth = (this.canvas.width / this.zoom) / 2;
        var halfHeight = (this.canvas.height / this.zoom) / 2;

        var minX = this.bounds.minX + halfWidth;
        var maxX = this.bounds.maxX - halfWidth;
        var minY = this.bounds.minY + halfHeight;
        var maxY = this.bounds.maxY - halfHeight;

        if (minX <= maxX) {
            this.x = Math.max(minX, Math.min(maxX, this.x));
        }
        if (minY <= maxY) {
            this.y = Math.max(minY, Math.min(maxY, this.y));
        }
    };

    Camera.prototype.update = function (delta) {
        if (this.target) {
            var targetX = this.target.x;
            var targetY = this.target.y;

            this.x += (targetX - this.x) * this.followLerp;
            this.y += (targetY - this.y) * this.followLerp;
        }

        if (this.shakeDuration > 0) {
            this.shakeDuration -= delta;

            var angle = Math.random() * Math.PI * 2;
            var magnitude = this.shakeIntensity * (this.shakeDuration > 0 ? 1 : 0);

            this.shakeOffsetX = Math.cos(angle) * magnitude;
            this.shakeOffsetY = Math.sin(angle) * magnitude;

            if (this.shakeDuration <= 0) {
                this.shakeOffsetX = 0;
                this.shakeOffsetY = 0;
            }
        }

        this.applyBounds();
    };

    Camera.prototype.begin = function (ctx) {
        ctx.save();

        var centerX = this.canvas.width / 2;
        var centerY = this.canvas.height / 2;

        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(-this.x + this.shakeOffsetX, -this.y + this.shakeOffsetY);
    };

    Camera.prototype.end = function (ctx) {
        ctx.restore();
    };

    Camera.prototype.worldToScreen = function (worldX, worldY) {
        var centerX = this.canvas.width / 2;
        var centerY = this.canvas.height / 2;

        return {
            x: centerX + (worldX - this.x) * this.zoom,
            y: centerY + (worldY - this.y) * this.zoom
        };
    };

    Camera.prototype.screenToWorld = function (screenX, screenY) {
        var centerX = this.canvas.width / 2;
        var centerY = this.canvas.height / 2;

        return {
            x: this.x + (screenX - centerX) / this.zoom,
            y: this.y + (screenY - centerY) / this.zoom
        };
    };

    window.Camera = Camera;
})();
