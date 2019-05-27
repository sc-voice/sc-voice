(typeof describe === 'function') && describe("task", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        Task,
    } = require("../index");

    it("TESTTESTTask(opts) is constructor", () => {
        // Default constructor
        var task = new Task();
        should(task).properties({
            error: null,
            actionsDone: 0,
            actionsTotal: 0,
            msActive: 0,
            isActive: false,
        });
        should(task).properties([
            'uuid',
            'name',
            'summary',
            'started',
            'lastActive',
            'msActive',
        ]);

        // Custom constructor
        var task = new Task({
            name: 'test-task',
            actionsTotal: 42,
            actionsDone: 10,
        });
        should(task.name).equal('test-task');
        should(task).properties({
            actionsTotal: 42,
            actionsDone: 10,
            isActive: true,
        });
    });
    it("TESTTESTactionsTotal records total task action count", (done) => {
        var task = new Task();
        var {
            started,
        } = task;
        should(task.lastActive).equal(task.started);
        setTimeout(() => {
            try {
                task.actionsTotal++;
                should(task.actionsTotal).equal(1);
                should(task.actionsDone).equal(0);
                should(task.lastActive).above(started);
                done();
            } catch(e) { done(e); }
        }, 10);
    });
    it("TESTTESTactionsDone records number of completed actions", (done) => {
        var task = new Task({
            actionsTotal: 1,
        });
        var {
            started,
            lastActive,
        } = task;
        setTimeout(() => {
            try {
                task.actionsDone++;
                should(task.actionsTotal).equal(1);
                should(task.actionsDone).equal(1);
                should(task.lastActive).above(lastActive);
                should(task.started).equal(started);
                done();
            } catch(e) { done(e); }
        }, 10);
    });
    it("TESTTESTstart(summary) restarts task", (done) => {
        var task = new Task();
        var {
            started,
        } = task;
        setTimeout(() => {
            try {
                should(task.start('testing-start')).equal(task);
                should(task.started).above(started);
                done();
            } catch(e) { done(e); }
        }, 10);
    });
    it("TESTTESTisActive returns true if there are actions to be done", () => {
        var task = new Task();
        should(task.isActive).equal(false);
        task.actionsTotal++;
        should(task.isActive).equal(true);
        task.actionsDone++;
        should(task.isActive).equal(false);
    });
    it("TESTESTmsActive returns milliseconds of activity", (done) => {
        var task = new Task();
        should(task.msActive).equal(0);
        setTimeout(() => {
            try {
                task.actionsTotal++;
                should(task.msActive).above(8);
                should(task.msActive).below(20);
                done();
            } catch(e) { done(e); }
        }, 10);
    });
});

