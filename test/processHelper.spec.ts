import { expect } from "chai";
import cp from "child_process";
import "mocha";
import sinon from "sinon";
import { ProcessHelper } from "../src/processHelper";

describe("The ProcessHelper class", () => {

    describe("executeSync method", () => {

        let execSyncMock: sinon.SinonStub<[string, cp.ExecSyncOptions?], string | Buffer>;

        beforeEach(() => {
            execSyncMock = sinon.stub(cp, "execSync");
        });

        afterEach(() => {
            execSyncMock.restore();
        });

        [
            { title: "command", options: undefined },
            { title: "command, {}", options: {} },
        ].forEach(({ title, options }) => {
            it(`should exec command (${title})`, () => {
                // Arrange
                const command = "command";

                // Act
                ProcessHelper.executeSync(command, options);

                // Assert
                expect(execSyncMock.getCall(0).args[0]).to.equal(command);
                expect(execSyncMock.getCall(0).args[1]).to.not.be.undefined;
            });

        });

        [
            { title: "undefined", options: undefined, expectedStdio: "inherit" },
            { title: "{}", options: {}, expectedStdio: "inherit" },
            { title: "{ stdio: \"pipe\" }", options: { stdio: "pipe" }, expectedStdio: "pipe" },
        ].forEach(({ title, options, expectedStdio }) => {
            it(`should default stdio (${title})`, () => {
                // Arrange
                const command = "command";

                // Act
                ProcessHelper.executeSync(command, options as any);

                // Assert
                expect(execSyncMock.getCall(0).args[1].stdio).to.equal(expectedStdio);
            });

        });

    });

});
