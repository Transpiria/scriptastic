import chalk from "ansi-colors";
import fs from "fs";
import os from "os";
import path from "path";
import rimraf from "rimraf";
import { scri } from "./buildTasks";
import { ErrorHelper } from "./errorHelper";

interface IScriOptions {
    entryTask: string;
}

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

async function laxyTsNode() {
    try {
        return await import("ts-node");
    } catch (error) {
        return undefined;
    }
}

async function lazyTypescript() {
    try {
        return await import("typescript");
    } catch (error) {
        return undefined;
    }
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
        let tempPath: string | undefined;

        if (fs.existsSync(scriJsPath)) {
            scriPath = scriJsPath;
        } else if (fs.existsSync(scriTsPath)) {
            const tsNode = await laxyTsNode();
            if (tsNode) {
                tsNode.register({
                    compilerOptions: {
                        esModuleInterop: true,
                        module: "commonjs",
                        noEmitOnError: true,
                        target: "es2016",
                    },
                    skipIgnore: true,
                    skipProject: true,
                });
                scriPath = scriTsPath;
            } else {
                const typescript = await lazyTypescript();
                if (typescript) {
                    tempPath = fs.mkdtempSync(path.join(os.tmpdir(), "scriTemp"));
                    if (localModulesPath) {
                        // Hack to get around node not paying attention to NODE_PATH after entry
                        fs.symlinkSync(localModulesPath, path.join(tempPath, "node_modules"), "junction");
                    }

                    await compile([scriTsPath], tempPath);
                    scriPath = path.join(tempPath, "scri.js");
                } else {
                    console.error(chalk.red("Failed to locate a suitable compiler for typescript file."));
                    process.exitCode = 1;
                }
            }
        } else {
            console.error(chalk.red("Failed to locate a suitable scri file."));
            process.exitCode = 1;
        }

        if (scriPath && fs.existsSync(scriPath)) {
            await import(scriPath);
            await scri.runTask(options.entryTask);
        }

        if (tempPath) {
            rimraf.sync(tempPath);
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
