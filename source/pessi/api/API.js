(function () {
    var BASE_URL = "https://api.pessi-game.com";
    var TIMEOUT_MS = 10000;

    function buildUrl(endpoint, params) {
        var url = BASE_URL + endpoint;

        if (params) {
            var query = Object.keys(params)
                .map(function (key) {
                    return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
                })
                .join("&");

            if (query) {
                url += "?" + query;
            }
        }

        return url;
    }

    function withTimeout(promise, ms) {
        var timeoutPromise = new Promise(function (resolve, reject) {
            setTimeout(function () {
                reject(new Error("Request timed out"));
            }, ms);
        });

        return Promise.race([promise, timeoutPromise]);
    }

    function request(method, endpoint, options) {
        options = options || {};

        var url = buildUrl(endpoint, options.params);
        var headers = { "Content-Type": "application/json" };

        if (options.headers) {
            for (var key in options.headers) {
                headers[key] = options.headers[key];
            }
        }

        var fetchOptions = {
            method: method,
            headers: headers
        };

        if (options.body) {
            fetchOptions.body = JSON.stringify(options.body);
        }

        var fetchPromise = fetch(url, fetchOptions).then(function (response) {
            if (!response.ok) {
                throw new Error("Request failed with status " + response.status);
            }

            var contentType = response.headers.get("content-type") || "";

            if (contentType.indexOf("application/json") !== -1) {
                return response.json();
            }

            return response.text();
        });

        return withTimeout(fetchPromise, options.timeout || TIMEOUT_MS);
    }

    function get(endpoint, params) {
        return request("GET", endpoint, { params: params });
    }

    function post(endpoint, body) {
        return request("POST", endpoint, { body: body });
    }

    function put(endpoint, body) {
        return request("PUT", endpoint, { body: body });
    }

    function del(endpoint) {
        return request("DELETE", endpoint);
    }

    function setBaseUrl(url) {
        BASE_URL = url;
    }

    window.API = {
        get: get,
        post: post,
        put: put,
        delete: del,
        setBaseUrl: setBaseUrl
    };
})();
