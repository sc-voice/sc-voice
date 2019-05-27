(function(exports) {
    const uuidv4 = require('uuid/v4');
    class Task {
        constructor(opts={}) {
            var uuid = opts.uuid || uuidv4();
            this.uuid = uuid;
            this.name = opts.name || `task${uuid}`;
            this.start(`${this.name} idle`);
            Object.defineProperty(this, '_actionsDone', {
                writable: true,
                value: opts.actionsDone || 0,
            });
            Object.defineProperty(this, '_actionsTotal', {
                writable: true,
                value: opts.actionsTotal || 0,
            });
            Object.defineProperty(this, 'msActive', {
                enumerable: true,
                get: () => this.lastActive - this.started,
            });
            Object.defineProperty(this, 'isActive', {
                enumerable: true,
                get: () => this.actionsDone < this.actionsTotal,
            });
            Object.defineProperty(this, 'actionsDone', {
                enumerable: true,
                get: () => {
                    return this._actionsDone;
                },
                set: (value) => {
                    this._actionsDone = value;
                    this.lastActive = new Date();
                },
            });
            Object.defineProperty(this, 'actionsTotal', {
                enumerable: true,
                get: () => {
                    return this._actionsTotal;
                },
                set: (value) => {
                    this._actionsTotal = value;
                    this.lastActive = new Date();
                },
            });
        }

        start(summary) {
            this.summary = summary || `${this.name} started`;
            this.started = new Date();
            this.lastActive = this.started;
            this.error = null;

            return this;
        }
    }

    module.exports = exports.Task = Task;
})(typeof exports === "object" ? exports : (exports = {}));

