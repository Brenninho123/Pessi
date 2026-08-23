(function () {
    var CLIENT_ID = "1540653184530251847";
    var REDIRECT_URI = window.location.origin + window.location.pathname;
    var SCOPES = ["identify"];
    var STORAGE_KEY = "pessi_discord_token";

    function buildAuthUrl() {
        var params = {
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            response_type: "token",
            scope: SCOPES.join(" ")
        };

        var query = Object.keys(params)
            .map(function (key) {
                return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
            })
            .join("&");

        return "https://discord.com/api/oauth2/authorize?" + query;
    }

    function login() {
        window.location.href = buildAuthUrl();
    }

    function parseTokenFromHash() {
        if (!window.location.hash) {
            return null;
        }

        var hash = window.location.hash.substring(1);
        var params = {};

        hash.split("&").forEach(function (pair) {
            var parts = pair.split("=");
            params[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1] || "");
        });

        if (params.access_token) {
            return {
                accessToken: params.access_token,
                tokenType: params.token_type || "Bearer",
                expiresIn: parseInt(params.expires_in, 10) || 0,
                obtainedAt: Date.now()
            };
        }

        return null;
    }

    function saveToken(token) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(token));
    }

    function loadToken() {
        var raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return null;
        }

        var token = JSON.parse(raw);

        if (token.expiresIn) {
            var elapsedSeconds = (Date.now() - token.obtainedAt) / 1000;
            if (elapsedSeconds >= token.expiresIn) {
                clearToken();
                return null;
            }
        }

        return token;
    }

    function clearToken() {
        sessionStorage.removeItem(STORAGE_KEY);
    }

    function logout() {
        clearToken();
    }

    function fetchUser(token) {
        return fetch("https://discord.com/api/users/@me", {
            headers: {
                Authorization: (token.tokenType || "Bearer") + " " + token.accessToken
            }
        }).then(function (response) {
            if (!response.ok) {
                throw new Error("Failed to fetch Discord user, status " + response.status);
            }
            return response.json();
        });
    }

    function handleRedirect() {
        var token = parseTokenFromHash();

        if (token) {
            saveToken(token);
            history.replaceState(null, "", window.location.pathname + window.location.search);
        }

        return loadToken();
    }

    function isLoggedIn() {
        return loadToken() !== null;
    }

    function getCurrentUser() {
        var token = loadToken();

        if (!token) {
            return Promise.reject(new Error("Not logged in"));
        }

        return fetchUser(token);
    }

    function setClientId(id) {
        CLIENT_ID = id;
    }

    window.DiscordLogin = {
        login: login,
        logout: logout,
        handleRedirect: handleRedirect,
        isLoggedIn: isLoggedIn,
        getCurrentUser: getCurrentUser,
        setClientId: setClientId
    };
})();
