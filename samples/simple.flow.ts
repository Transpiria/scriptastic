import { scri } from "scriptastic";

scri.task("clean")
    .does(() => {
        console.log("Build artifacts are removed");
    });

scri.task("build")
    .dependsOn("clean")
    .does(() => {
        console.log("Project is built");
    });

scri.task("lint")
    .does(() => {
        console.log("Project is linted");
    });

scri.task("pack")
    .dependsOn("build")
    .dependsOn("lint")
    .does(() => {
        console.log("Project is packaged");
    });
