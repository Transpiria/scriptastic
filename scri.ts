import rimraf from "rimraf";
import { ProcessHelper as ph, scri } from "scriptastic";

scri.task("clean:dist")
    .does(() => {
        rimraf.sync("dist/**/*");
    });

scri.task("clean:nyc")
    .does(() => {
        rimraf.sync(".nyc_output");
    });

scri.task("clean:coverage")
    .does(() => {
        rimraf.sync("coverage");
    });

scri.task("clean")
    .dependsOn("clean:dist")
    .dependsOn("clean:nyc")
    .dependsOn("clean:coverage");

scri.task("lint")
    .does(() => {
        ph.executeSync("eslint");
    });

scri.task("build")
    .dependsOn("clean:dist")
    .does(() => {
        ph.executeSync("tsc --project .");
    });

scri.task("test")
    .dependsOn("clean:nyc")
    .dependsOn("clean:coverage")
    .does(() => {
        ph.executeSync(`nyc _mocha --require ts-node/register "test/**/*.spec.*"`, {
            env: {
                TS_NODE_PROJECT: "test/tsconfig.json",
            },
        });
    });

scri.task("just-pack")
    .does(() => {
        ph.executeSync("npm pack");
    });

scri.task("pack")
    .dependsOn("lint")
    .dependsOn("build")
    .dependsOn("test")
    .runs("just-pack");
