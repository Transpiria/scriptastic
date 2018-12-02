import { expect } from "chai";
import cp from "child_process";
import "mocha";
import { ProcessHelper } from "../src/processHelper";

// tslint:disable:no-string-literal
// tslint:disable:no-unnecessary-initializer
// tslint:disable:no-unused-expression
// tslint:disable:variable-name

describe("The ProcessHelper class", () => {

    describe("The executeSync method", () => {

        [
            { title: "command", options: undefined },
            { title: "command, {}", options: {} },
        ].forEach(({ title, options }) => {
            it(`should exec command (${title})`, () => {
                // Arrange
                const command = "command";
                const result = "result";

                let actualCommand: any = undefined;
                let actualOptions: any = undefined;

                cp["execSync"] = ((p1: string, p2?: any): string => {
                    actualCommand = p1;
                    actualOptions = p2;
                    return result;
                }) as any;

                // Act
                ProcessHelper.executeSync(command, options);

                // Assert
                expect(actualCommand).to.equal(command);
                expect(actualOptions).to.not.be.undefined;
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
                const result = "result";

                let actualOptions: any = undefined;

                cp["execSync"] = (_p1: any, p2?: any): any => {
                    actualOptions = p2;
                    return result;
                };

                // Act
                ProcessHelper.executeSync(command, options as any);

                // Assert
                expect(actualOptions.stdio).to.equal(expectedStdio);
            });

        });

    });

});
