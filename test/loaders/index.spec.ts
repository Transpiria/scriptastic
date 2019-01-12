import { expect } from "chai";
import "mocha";
import { loaders } from "../../src/loaders";
import { tsnodeLoader } from "../../src/loaders/tsnodeLoader";
import { typescriptLoader } from "../../src/loaders/typescriptLoader";

describe("The loaders index module", () => {

    describe("loaders array", () => {

        [
            { title: "tsnode", loader: tsnodeLoader },
            { title: "typescript", loader: typescriptLoader },
        ].forEach(({ title, loader }) => {
            it(`should contain ${title}`, () => {
                expect(loaders).to.contain(loader);
            });
        });

        it("should prioritize tsnode over typescript", () => {
            const primary = loaders.indexOf(tsnodeLoader);
            const secondary = loaders.indexOf(typescriptLoader);

            expect(primary).to.be.lessThan(secondary);
        });

    });

});
