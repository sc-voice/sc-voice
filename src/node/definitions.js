(function(exports) {

    class Definitions {

        static get SUPPORT_LEVELS() {
            return {
                Supported: {
                    value: "Supported",
                    description: "Content is actively maintained. "+
                        "Please report errors and inconsistencies",
                },
                Legacy: {
                    value: "Legacy",
                    description: "Errors of record in legacy content will not be " +
                        "fixed since they are historical. " +
                        "Only transcription errors from historical source will be corrected.",
                }
            };
        }
    }

    module.exports = exports.Definitions = Definitions;
})(typeof exports === "object" ? exports : (exports = {}));

