var apiclient = (function () {
    const baseUrl = "http://localhost:8080/blueprints";

    return {
        getBlueprintsByAuthor: function (authname, callback) {
            $.get(`${baseUrl}/${authname}`)
                .done(function (data) {
                    callback(data);
                })
                .fail(function () {
                    callback([]);
                });
        },

        getBlueprintsByNameAndAuthor: function (authname, bpname, callback) {
            $.get(`${baseUrl}/${authname}/${bpname}`)
                .done(function (response) {
                    callback(response.data);
                })
                .fail(function () {
                    callback([]);
                });
        }
    };
})();
