import { execSync, ExecSyncOptions, ExecSyncOptionsWithBufferEncoding, ExecSyncOptionsWithStringEncoding } from "child_process";

export class ProcessHelper {
    public static executeSync(command: string, options?: ExecSyncOptionsWithStringEncoding | ExecSyncOptionsWithBufferEncoding | ExecSyncOptions): Buffer {
        options = options || {};
        if (!options.stdio) {
            options.stdio = "inherit";
        }

        return execSync(command, options);
    }
}
