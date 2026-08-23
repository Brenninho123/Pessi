(function () {
    function OptionsState() {
        this.canvas = document.getElementById("game-canvas");
        this.ctx = this.canvas.getContext("2d");

        this.options = ["Login with Discord", "Back"];
        this.selected = 0;

        this.user = null;
        this.loading = false;

        this.onKeyDown = this.onKeyDown.bind(this);
        this.render = this.render.bind(this);
    }

    OptionsState.prototype.create = function () {
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("game-pause", this.pause.bind(this));
        window.addEventListener("game-resume", this.resume.bind(this));

        this.active = true;
        this.refreshLoginState();

        requestAnimationFrame(this.render);
    };

    OptionsState.prototype.refreshLoginState = function () {
        if (!DiscordLogin.isLoggedIn()) {
            this.user = null;
            this.options[0] = "Login with Discord";
            return;
        }

        this.loading = true;

        DiscordLogin.getCurrentUser().then(function (user) {
            this.user = user;
            this.options[0] = "Logout (" + user.username + ")";
            this.loading = false;
        }.bind(this)).catch(function () {
            this.user = null;
            this.options[0] = "Login with Discord";
            this.loading = false;
        }.bind(this));
    };

    OptionsState.prototype.onKeyDown = function (e) {
        if (e.key === "ArrowUp") {
            this.selected = (this.selected - 1 + this.options.length) % this.options.length;
        } else if (e.key === "ArrowDown") {
            this.selected = (this.selected + 1) % this.options.length;
        } else if (e.key === "Enter") {
            this.confirm();
        }
    };

    OptionsState.prototype.confirm = function () {
        if (this.selected === 0) {
            if (this.user) {
                DiscordLogin.logout();
                this.user = null;
                this.options[0] = "Login with Discord";
            } else {
                DiscordLogin.login();
            }
        } else if (this.selected === 1) {
            window.dispatchEvent(new CustomEvent("menu-select", { detail: "Back" }));
        }
    };

    OptionsState.prototype.pause = function () {
        this.active = false;
    };

    OptionsState.prototype.resume = function () {
        this.active = true;
        requestAnimationFrame(this.render);
    };

    OptionsState.prototype.render = function () {
        if (!this.active) {
            return;
        }

        var ctx = this.ctx;
        var width = this.canvas.width;
        var height = this.canvas.height;

        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);

        ctx.textAlign = "center";
        ctx.font = "48px sans-serif";

        for (var i = 0; i < this.options.length; i++) {
            ctx.fillStyle = i === this.selected ? "#ffffff" : "#888888";
            ctx.fillText(this.options[i], width / 2, height / 2 + i * 60);
        }

        if (this.loading) {
            ctx.font = "24px sans-serif";
            ctx.fillStyle = "#cccccc";
            ctx.fillText("Loading...", width / 2, height / 2 + this.options.length * 60 + 40);
        }

        requestAnimationFrame(this.render);
    };

    OptionsState.prototype.destroy = function () {
        this.active = false;
        window.removeEventListener("keydown", this.onKeyDown);
    };

    window.OptionsState = OptionsState;
})();
