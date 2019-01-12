import chalk from "ansi-colors";
import fs from "fs";
import os from "os";
import path from "path";
import rimraf from "rimraf";
import { ILoader } from "./iloader";
import { ILoaderResult } from "./iloaderResult";

export const typescriptLoader: ILoader = async (scriptPath: string, options?: any): Promise<ILoaderResult> => {
    try {
        const typescript = await import("typescript");
        const tempPath = fs.mkdtempSync(path.join(os.tmpdir(), "scriTemp"));
        if (options && options.localModulesPath) {
            // Hack to get around node not paying attention to NODE_PATH after entry
            fs.symlinkSync(options.localModulesPath, path.join(tempPath, "node_modules"), "junction");
        }

        // TODO: remove assign once options filled from tsconfig.json
        const program = typescript.createProgram([scriptPath], Object.assign(options, {
            esModuleInterop: true,
            module: typescript.ModuleKind.CommonJS,
            noEmitOnError: true,
            outDir: tempPath,
            target: typescript.ScriptTarget.ES2016,
        }));
        const emitResult = program.emit();

        const allDiagnostics = typescript
            .getPreEmitDiagnostics(program)
            .concat(emitResult.diagnostics);

        allDiagnostics.forEach((diagnostic) => {
            if (diagnostic.file) {
                const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
                const message = typescript.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
                console.error(`${chalk.cyan(diagnostic.file.fileName)}${chalk.yellow(`:${line + 1}:${character + 1}`)} - ${chalk.red("error")} ${chalk.grey(`${diagnostic.code}:`)} ${message}`);
            } else {
                console.error(`${typescript.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`);
            }
        });
        return {
            dispose: () => {
                rimraf.sync(tempPath);
            },
            scriptPath: path.join(tempPath, "scri.js"),
            success: true,
        };
    } catch {
        return { success: false };
    }
};
