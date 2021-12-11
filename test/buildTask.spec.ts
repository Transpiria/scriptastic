import { expect } from "chai";
import "mocha";
import { BuildTask, BuildTaskWhen } from "../src/buildTask";

describe("The BuildTask class", () => {

    describe("constructor", () => {

        it("should set the name property", () => {
            // Arrange
            const expectedName = "name";

            // Act
            const buildTask = new BuildTask(expectedName);

            // Assert
            expect(buildTask.name).to.equal(expectedName);
        });

    });

    [
        { method: "when", parameter: BuildTaskWhen.Always },
        { method: "dependsOn", parameter: "task" },
        { method: "does", parameter: () => undefined },
        { method: "runs", parameter: "task" },
        { method: "onError", parameter: () => undefined },
    ].forEach(({ method, parameter }) => {
        it(`methods should return the BuildTask (${method})`, () => {
            // Arrange
            const buildTask = new BuildTask("name");
            buildTask.dependsOn("test");

            // Act
            const task: BuildTask = (buildTask as any)[method](parameter);

            // Assert
            expect(task).to.equal(buildTask);
        });
    });

    describe("when method", () => {

        [
            { title: "BuildTaskWhen", when: BuildTaskWhen.Always },
            { title: "Predicate<Boolean>", when: () => true },
        ].forEach(({ title, when }) => {
            it(`should set the whenReference property (${title})`, () => {
                // Arrange
                const buildTask = new BuildTask("name");

                // Act
                buildTask.when(when);

                // Assert
                expect(buildTask.whenReference).to.equal(when);
            });
        });

    });

    describe("does method", () => {

        it(`should set the doesReference property`, () => {
            // Arrange
            const buildTask = new BuildTask("name");
            const does = () => undefined;

            // Act
            buildTask.does(does);

            // Assert
            expect(buildTask.doesReference).to.equal(does);
        });

    });

    describe("onError method", () => {

        it(`should set the errorReference property`, () => {
            // Arrange
            const buildTask = new BuildTask("name");
            const error = () => undefined;

            // Act
            buildTask.onError(error);

            // Assert
            expect(buildTask.errorReference).to.equal(error);
        });

    });

    describe("dependsOn method", () => {

        [
            { title: "string", dependency: "dependency", expectedDependency: "dependency" },
            { title: "BuildTask", dependency: new BuildTask("dependency"), expectedDependency: "dependency" },
        ].forEach(({ title, dependency, expectedDependency }) => {
            it(`should append to dependencies (${title})`, () => {
                // Arrange
                const buildTask = new BuildTask("name");

                // Act
                buildTask.dependsOn(dependency);

                // Assert
                expect(buildTask.dependencies).to.contain(expectedDependency);
            });
        });

        it(`should append multiple dependencies`, () => {
            // Arrange
            const buildTask = new BuildTask("name");
            const dependency1 = "dependency1";
            const dependency2 = "dependency2";

            // Act
            buildTask.dependsOn(dependency1, dependency2);

            // Assert
            expect(buildTask.dependencies).to.contain(dependency1);
            expect(buildTask.dependencies).to.contain(dependency2);
        });

        it(`should not append duplicate tasks`, () => {
            // Arrange
            const dependency = "dependency";
            const buildTask = new BuildTask("name")
                .runs(dependency);

            // Act
            buildTask.dependsOn(dependency);

            // Assert
            expect(buildTask.dependencies).to.have.lengthOf(1);
        });

    });

    describe("runs method", () => {

        [
            { title: "string", run: "run", expectedrun: "run" },
            { title: "BuildTask", run: new BuildTask("run"), expectedrun: "run" },
        ].forEach(({ title, run, expectedrun }) => {
            it(`should append to runTasks (${title})`, () => {
                // Arrange
                const buildTask = new BuildTask("name");

                // Act
                buildTask.runs(run);

                // Assert
                expect(buildTask.runTasks).to.contain(expectedrun);
            });
        });

        it(`should append multiple dependencies`, () => {
            // Arrange
            const buildTask = new BuildTask("name");
            const run1 = "run1";
            const run2 = "run2";

            // Act
            buildTask.runs(run1, run2);

            // Assert
            expect(buildTask.runTasks).to.contain(run1);
            expect(buildTask.runTasks).to.contain(run2);
        });

        it(`should not append duplicate tasks`, () => {
            // Arrange
            const run = "run";
            const buildTask = new BuildTask("name")
                .runs(run);

            // Act
            buildTask.runs(run);

            // Assert
            expect(buildTask.runTasks).to.have.lengthOf(1);
        });

    });

});
