import { expect } from "chai";
import "mocha";
import { BuildTask, BuildTasks, ErrorHelper, scri } from "../src/index";

describe("The index module", () => {

    [
        { title: "BuildTask", item: BuildTask },
        { title: "BuildTasks", item: BuildTasks },
        { title: "scri", item: scri },
        { title: "ErrorHelper", item: ErrorHelper },
        { title: "ProcessHelper", item: ErrorHelper },
    ].forEach(({ title, item }) => {
        it(`should expose ${title}`, async () => {
            // Assert
            expect(item).to.not.be.undefined;
        });
    });

});
