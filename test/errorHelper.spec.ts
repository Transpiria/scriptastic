import { expect } from "chai";
import "mocha";
import { ErrorHelper } from "../src/errorHelper";

describe("The ErrorHelper class", () => {

    describe("prettifyError method", () => {

        it("should format error as a string", () => {
            // Arrange
            const error = new Error("message");

            // Act
            const content = ErrorHelper.prettifyError(error);

            // Assert
            expect(typeof content).to.equal("string");
            expect(content).to.contain(error.message);
            expect(content).to.contain(error.stack as string);
        });

        it("should format any as a string", () => {
            // Arrange
            const error = {};

            // Act
            const content = ErrorHelper.prettifyError(error);

            // Assert
            expect(typeof content).to.equal("string");
        });

    });

});
