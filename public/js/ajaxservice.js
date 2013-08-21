var app = app || { }; //app namespace

(function (app) {
    "use strict";
    
    var serviceBase = 'http://localhost:3000/',
        getUrl = function (method) { return serviceBase + method; };

    app.ajaxService = (function () {
        var 

        get = function (method, jsonIn, callback) {
            $.ajax({
                url: getUrl(method),
                type: "GET",
                data: ko.toJSON(jsonIn),
                dataType: "json",
                contentType: "application/json",
                success: function (json) {
                    callback(json);
                }
            });
        },
        post = function (method, jsonIn, callback) {
            $.ajax({
                url: getUrl(method),
                type: "POST",
                data: ko.toJSON(jsonIn),
                dataType: "json",
                contentType: "application/json",
                success: function (json) {
                    callback(json);
                }
            });
        },
        put = function (method, jsonIn, callback) {
            $.ajax({
                url: getUrl(method),
                type: "PUT",
                data: ko.toJSON(jsonIn),
                dataType: "json",
                contentType: "application/json",
                success: function (json) {
                    callback(json);
                }
            });
        },
        remove = function (method, jsonIn, callback) {
            $.ajax({
                url: getUrl(method),
                type: "DELETE",
                data: ko.toJSON(jsonIn),
                dataType: "json",
                contentType: "application/json",
                success: function (json) {
                    callback(json);
                }
            });
        };
        return {
            get: get,
            post: post,
            put: put,
            delete: remove
        };
    })();
} (app));