import chalk from "ansi-colors";
import fs from "fs";
import path from "path";
import { scri } from "./buildTasks";
import { ErrorHelper } from "./errorHelper";
import { loaders } from "./loaders";
import { ILoader } from "./loaders/iloader";
import { ILoaderResult } from "./loaders/iloaderResult";

interface IScriOptions {
    entryTask: string;
}

// TODO: Add more cli options, and potentially a .rc for convenience
function parseOptions(): IScriOptions {
    return {
        entryTask: process.argv[2],
    };
}

function findLocalModulesPath(dirPath: string = process.cwd()): string | undefined {
    let resultPath: string | undefined;
    let prevPath = "";
    while (!resultPath && prevPath !== dirPath) {
        const testPath = path.join(dirPath, "node_modules");
        if (fs.existsSync(testPath)) {
            resultPath = testPath;
        }
        prevPath = dirPath;
        dirPath = path.dirname(dirPath);
    }
    return resultPath;
}

const loadTs: ILoader = async (scriptPath: string, options: any = {}): Promise<ILoaderResult> => {
    let loaderResult: ILoaderResult | undefined;
    let loaderIndex = 0;
    while ((!loaderResult || !loaderResult.success) && loaderIndex < loaders.length) {
        // TODO: fill options from tsconfig.json
        loaderResult = await loaders[loaderIndex](scriptPath, options);
        loaderIndex++;
    }

    return loaderResult || {
        success: false,
    };
};

async function run() {
    const localModulesPath = findLocalModulesPath();
    let hasRun = false;
    if (localModulesPath) {
        const localScri = path.join(localModulesPath, "scriptastic", "dist");
        if (localScri !== __dirname) {
            if (fs.existsSync(localScri)) {
                hasRun = true;
                await import(path.join(localScri, "scri.js"));
            } else {
                console.warn(chalk.yellow("WARNING: The scri package should be installed locally to prevent build inconsistencies between environments."));
            }
        }

        const localPath = `${path.join(localModulesPath, ".bin")}${path.delimiter}`;
        if (!process.env.PATH || !process.env.PATH.startsWith(localPath)) {
            process.env.PATH = `${localPath}${process.env.PATH}`;
        }
    }

    if (!hasRun) {
        const options = parseOptions();
        const scriTsPath = path.join(process.cwd(), "scri.ts");
        const scriJsPath = path.join(process.cwd(), "scri.js");
        let scriPath: string | undefined;
        let loaderResult: ILoaderResult | undefined;

        if (fs.existsSync(scriJsPath)) {
            scriPath = scriJsPath;
        } else if (fs.existsSync(scriTsPath)) {
            loaderResult = await loadTs(scriTsPath, {
                localModulesPath,
            });
            scriPath = loaderResult.scriptPath;

            if (!loaderResult.success) {
                console.error(chalk.red("ERROR: Failed to locate a suitable compiler for typescript file."));
                process.exitCode = 1;
            }
        } else {
            console.error(chalk.red("Failed to locate a suitable scri file."));
            process.exitCode = 1;
        }

        if (scriPath && fs.existsSync(scriPath)) {
            await import(scriPath);
            await scri.runTask(options.entryTask);
        }

        if (loaderResult && loaderResult.dispose) {
            loaderResult.dispose();
        }
    }
}

run()
    .catch((reason) => {
        if (reason instanceof Error) {
            console.error(ErrorHelper.prettifyError(reason));
        } else {
            console.error(reason);
        }
        process.exitCode = 1;
    });
