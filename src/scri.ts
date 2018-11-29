import chalk from "ansi-colors";
import fs from "fs";
import os from "os";
import path from "path";
import rimraf from "rimraf";
import { scri } from "./build-tasks";

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

async function compile(fileNames: string[], outDir: string): Promise<void> {
    const tsc = await import("typescript");
    if (tsc) {
        const program = tsc.createProgram(fileNames, {
            esModuleInterop: true,
            module: tsc.ModuleKind.CommonJS,
            noEmitOnError: true,
            outDir,
            target: tsc.ScriptTarget.ES2016,
        });
        const emitResult = program.emit();

        const allDiagnostics = tsc
            .getPreEmitDiagnostics(program)
            .concat(emitResult.diagnostics);

        allDiagnostics.forEach((diagnostic) => {
            if (diagnostic.file) {
                const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
                const message = tsc.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
                console.error(`${chalk.cyan(diagnostic.file.fileName)}${chalk.yellow(`:${line + 1}:${character + 1}`)} - ${chalk.red("error")} ${chalk.grey(`${diagnostic.code}:`)} ${message}`);
            } else {
                console.error(`${tsc.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`);
            }
        });
    } else {
        console.error(chalk.red("The typescript package is required in order to build scri.ts"));
    }
}

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
                console.warn(chalk.yellow("The scri package should be installed locally to prevent build inconsistencies between environments."));
            }
        }
        process.env.PATH = `${path.join(localModulesPath, ".bin")}${path.delimiter}${process.env.PATH}`;
    }

    if (!hasRun) {
        const scriTsPath = path.join(process.cwd(), "scri.ts");
        let scriJsPath = path.join(process.cwd(), "scri.js");

        let tempPath: string | undefined;
        if (!fs.existsSync(scriJsPath) && fs.existsSync(scriTsPath)) {
            tempPath = fs.mkdtempSync(path.join(os.tmpdir(), "scriTemp"));
            if (localModulesPath) {
                // Hack to get around node not paying attention to NODE_PATH after entry
                fs.symlinkSync(localModulesPath, path.join(tempPath, "node_modules"), "junction");
            }

            scriJsPath = path.join(tempPath, "scri.js");
            await compile([scriTsPath], tempPath);
        }

        if (fs.existsSync(scriJsPath)) {
            await import(scriJsPath);
            await scri.RunTask();
        } else {
            console.error(chalk.red("Failed to locate a suitable scri file."));
            process.exitCode = 1;
        }

        if (tempPath) {
            rimraf.sync(tempPath);
        }
    }
}

function prettifyError(error: Error) {
    return chalk.red(error.message) && error.stack;
}

run()
    .catch((reason) => {
        if (reason as Error) {
            console.error(prettifyError(reason));
        } else {
            console.error(reason);
        }
        process.exitCode = 1;
    });
