import { execSync, ExecSyncOptions, ExecSyncOptionsWithBufferEncoding, ExecSyncOptionsWithStringEncoding } from "child_process";
import cp from "child_process";

export class ProcessHelper {

    public static executeSync(command: string, options?: ExecSyncOptionsWithStringEncoding | ExecSyncOptionsWithBufferEncoding | ExecSyncOptions): string | Buffer {
        options = options || {};
        if (!options.stdio) {
            options.stdio = "inherit";
        }

        return execSync(command, options);
    }

    public static execute(command: string, options?: cp.SpawnOptions): Promise<cp.ChildProcess>;
    public static execute(command: string, args?: string | string[] | cp.SpawnOptions, options?: cp.SpawnOptions): Promise<cp.ChildProcess> {
        let commandArgs: string[] = [];
        const commandOptions: cp.SpawnOptions = {
            stdio: "inherit",
            shell: true,
        };

        commandArgs = this.split(command);
        command = commandArgs[0];
        commandArgs = commandArgs.slice(1);
        if (typeof args == "string") {
            commandArgs.push(...this.split(args));
        } else if (args instanceof Array) {
            commandArgs.push(...args);
            Object.assign(commandOptions, options);
        } else if (typeof args == "object") {
            Object.assign(commandOptions, args);
        }

        return new Promise<cp.ChildProcess>((resolve, reject) => {
            const p = cp.spawn(command, commandArgs, commandOptions);
            p.once("exit", (code) => {
                if (code === 0) {
                    resolve(p);
                } else {
                    reject();
                }
            });
        });
    }

    private static split(value: string): string[] {
        const result: string[] = [];
        if (value !== undefined) {
            let current = "";
            const quotes: string[] = [];
            for (let index = 0; index < value.length; index++) {
                const char = value[index];
                if (char === "\"" || char === "'") {
                    if (quotes.length > 0 && char === quotes[quotes.length - 1]) {
                        quotes.pop();
                    } else {
                        quotes.push(char);
                    }
                    current += char;
                } else if (char === " ") {
                    result.push(current);
                    current = "";
                } else {
                    current += char;
                }
            }
            if (current.length > 0) {
                result.push(current);
            }
        }
        return result;
    }

}

export const psh = new ProcessHelper();
