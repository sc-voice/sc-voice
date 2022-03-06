(typeof describe === 'function') && describe("task", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        Task,
    } = require("../index");

    it("Task(opts) is constructor", () => {
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
    it("actionsTotal records total task action count", (done) => {
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
    it("actionsDone records number of completed actions", (done) => {
        var task = new Task({
            actionsTotal: 1,
        });
        var {
            started,
            lastActive,
        } = task;
        should(task.actionsTotal).equal(1);
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
    it("start(summary) restarts task", (done) => {
        var task = new Task();
        var {
            started,
        } = task;
        setTimeout(() => {
            try {
                task.actionsTotal = 123;
                task.actionsDone = 45;
                should(task.actionsTotal).equal(123);
                should(task.actionsDone).equal(45);
                should(task.start('testing-start',3,2)).equal(task);
                should(task.started).above(started);
                should(task.actionsTotal).equal(3);
                should(task.actionsDone).equal(2);

                should(task.start('testing-start')).equal(task);
                should(task.actionsTotal).equal(0);
                should(task.actionsDone).equal(0);
                done();
            } catch(e) { done(e); }
        }, 10);
    });
    it("isActive returns true if there are actions to be done", () => {
        var task = new Task();
        should(task.isActive).equal(false);
        task.actionsTotal++;
        should(task.isActive).equal(true);
        task.actionsDone++;
        should(task.isActive).equal(false);
        task.actionsTotal++;
        should(task.isActive).equal(true);
        task.error = new Error('test error');
        should(task.isActive).equal(false);
    });
    it("msActive returns milliseconds of activity", (done) => {
        var task = new Task();
        should(task.msActive).equal(0);
        setTimeout(() => {
            try {
                task.actionsTotal++;
                should(task.msActive).above(8);
                should(task.msActive).below(25);
                done();
            } catch(e) { done(e); }
        }, 10);
    });
});

