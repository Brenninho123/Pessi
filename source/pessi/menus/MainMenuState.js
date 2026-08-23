(function () {
    function MainMenuState() {
        this.canvas = document.getElementById("game-canvas");
        this.ctx = this.canvas.getContext("2d");

        this.options = ["Play", "Options"];
        this.selected = 0;

        this.background = new Image();
        this.background.src = Paths.image("menuBG");

        this.discordUser = null;
        this.discordLoading = false;

        this.onKeyDown = this.onKeyDown.bind(this);
        this.render = this.render.bind(this);
    }

    MainMenuState.prototype.create = function () {
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("game-pause", this.pause.bind(this));
        window.addEventListener("game-resume", this.resume.bind(this));

        this.active = true;
        this.refreshDiscordStatus();

        requestAnimationFrame(this.render);
    };

    MainMenuState.prototype.refreshDiscordStatus = function () {
        if (!DiscordLogin.isLoggedIn()) {
            this.discordUser = null;
            return;
        }

        this.discordLoading = true;

        DiscordLogin.getCurrentUser().then(function (user) {
            this.discordUser = user;
            this.discordLoading = false;
        }.bind(this)).catch(function () {
            this.discordUser = null;
            this.discordLoading = false;
        }.bind(this));
    };

    MainMenuState.prototype.onKeyDown = function (e) {
        if (e.key === "ArrowUp") {
            this.selected = (this.selected - 1 + this.options.length) % this.options.length;
        } else if (e.key === "ArrowDown") {
            this.selected = (this.selected + 1) % this.options.length;
        } else if (e.key === "Enter") {
            this.confirm();
        }
    };

    MainMenuState.prototype.confirm = function () {
        window.dispatchEvent(new CustomEvent("menu-select", { detail: this.options[this.selected] }));
    };

    MainMenuState.prototype.pause = function () {
        this.active = false;
    };

    MainMenuState.prototype.resume = function () {
        this.active = true;
        this.refreshDiscordStatus();
        requestAnimationFrame(this.render);
    };

    MainMenuState.prototype.render = function () {
        if (!this.active) {
            return;
        }

        var ctx = this.ctx;
        var width = this.canvas.width;
        var height = this.canvas.height;

        ctx.clearRect(0, 0, width, height);

        if (this.background.complete) {
            ctx.drawImage(this.background, 0, 0, width, height);
        }

        ctx.textAlign = "center";
        ctx.font = "48px sans-serif";

        for (var i = 0; i < this.options.length; i++) {
            ctx.fillStyle = i === this.selected ? "#ffffff" : "#888888";
            ctx.fillText(this.options[i], width / 2, height / 2 + i * 60);
        }

        ctx.font = "20px sans-serif";
        ctx.textAlign = "left";

        if (this.discordLoading) {
            ctx.fillStyle = "#cccccc";
            ctx.fillText("Connecting to Discord...", 20, height - 20);
        } else if (this.discordUser) {
            ctx.fillStyle = "#7289da";
            ctx.fillText("Logged in as " + this.discordUser.username, 20, height - 20);
        } else {
            ctx.fillStyle = "#888888";
            ctx.fillText("Not logged in", 20, height - 20);
        }

        requestAnimationFrame(this.render);
    };

    MainMenuState.prototype.destroy = function () {
        this.active = false;
        window.removeEventListener("keydown", this.onKeyDown);
    };

    window.MainMenuState = MainMenuState;
})();
