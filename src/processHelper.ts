import { execSync, spawn, ExecSyncOptions, ExecSyncOptionsWithBufferEncoding, ExecSyncOptionsWithStringEncoding, SpawnOptions, ChildProcess } from "child_process";

export class ProcessHelper {

    public static executeSync(command: string, options?: ExecSyncOptionsWithStringEncoding | ExecSyncOptionsWithBufferEncoding | ExecSyncOptions): string | Buffer {
        options = options || {};
        if (!options.stdio) {
            options.stdio = "inherit";
        }

        return execSync(command, options);
    }

    public static exec(command: string, options?: SpawnOptions): Promise<ChildProcess> {
        return this.execute(command, options);
    }

    public static execute(command: string, options?: SpawnOptions): Promise<ChildProcess> {
        const commandOptions = options ?? {};
        commandOptions.stdio = "inherit";
        commandOptions.shell = true;

        return new Promise<ChildProcess>((resolve, reject) => {
            const process = spawn(command, [], commandOptions);
            process.on("close", (code) => {
                if (code === 0) {
                    resolve(process);
                } else {
                    reject();
                }
            });
        });
    }

}

export const psh = new ProcessHelper();
