(function(exports) {
    const uuidv4 = require('uuid/v4');
    class Task {
        constructor(opts={}) {
            var uuid = opts.uuid || uuidv4();
            var now = new Date();
            this.created = opts.created || now;
            this._actionsDone = opts.actionsDone || 0;
            this._actionsTotal = opts.actionsTotal || 0;
            this.msTask = now - this.created;
            this.error = null;
            this.uuid = uuid;
            this.name = opts.name || `task${uuid}`;
            this.summary = `${this.name} created`;
        }

        get actionsDone() {
            return this._actionsDone;
        }

        set actionsDone(value) {
            this._actionsDone = value;
            this.msTask = Date.now() - this.created;
        }

        get actionsTotal() {
            return this._actionsTotal;
        }

        set actionsTotal(value) {
            this._actionsTotal = value;
            this.msTask = Date.now() - this.created;
        }
    }

    module.exports = exports.Task = Task;
})(typeof exports === "object" ? exports : (exports = {}));

