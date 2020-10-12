(function(exports) {
    const uuidv4 = require('uuid/v4');
    const { logger, } = require('log-instance');
    class Task {
        constructor(opts={}) {
            var uuid = opts.uuid || uuidv4();
            this.uuid = uuid;
            this.name = opts.name || `task${uuid}`;
            this.started = new Date();
            this.lastActive = this.started;
            this.error = null;
            var {
                actionsTotal,
                actionsDone,
            } = opts;
            Object.defineProperty(this, '_summary', {
                writable: true,
                value: opts.summary || `${this.name} created`,
            });
            Object.defineProperty(this, '_actionsDone', {
                writable: true,
                value: actionsDone || 0,
            });
            Object.defineProperty(this, '_actionsTotal', {
                writable: true,
                value: actionsTotal || 0,
            });
            Object.defineProperty(this, 'msActive', {
                enumerable: true,
                get: () => this.lastActive - this.started,
            });
            Object.defineProperty(this, 'isActive', {
                enumerable: true,
                get: () => this.error == null && this.actionsDone < this.actionsTotal,
            });
            Object.defineProperty(this, 'summary', {
                enumerable: true,
                get: () => {
                    return this._summary;
                },
                set: (value) => {
                    this._summary = value;
                    logger.info(`Task_${this.name}.summary: ${value}`);
                    this.lastActive = new Date();
                },
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

        start(summary, actionsTotal=0, actionsDone=0) {
            this.summary = summary || `${this.name} started`;
            this.started = new Date();
            this.lastActive = this.started;
            this.actionsTotal = actionsTotal;
            this.actionsDone = actionsDone;
            this.error = null;

            return this;
        }
    }

    module.exports = exports.Task = Task;
})(typeof exports === "object" ? exports : (exports = {}));

