import { expect } from "chai";
import "mocha";
import { BuildTask, BuildTasks, ErrorHelper, psh, scri } from "../src";
import { ProcessHelper } from "scriptastic";

describe("The index module", () => {

    [
        { title: "BuildTask", item: BuildTask },
        { title: "BuildTasks", item: BuildTasks },
        { title: "scri", item: scri },
        { title: "psh", item: psh },
        { title: "ErrorHelper", item: ErrorHelper },
        { title: "ProcessHelper", item: ProcessHelper },
    ].forEach(({ title, item }) => {
        it(`should expose ${title}`, async () => {
            // Assert
            expect(item).to.not.be.undefined;
        });
    });

});
