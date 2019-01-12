import { ILoader } from "./iloader";
import { ILoaderResult } from "./iloaderResult";

export const tsnodeLoader: ILoader = async (scriptPath: string, options?: any): Promise<ILoaderResult> => {
    try {
        const tsNode = await import("ts-node");
        // TODO: remove assign once options filled from tsconfig.json
        tsNode.register(Object.assign(options, {
            compilerOptions: {
                esModuleInterop: true,
                module: "commonjs",
                noEmitOnError: true,
                target: "es2016",
            },
            skipIgnore: true,
            skipProject: true,
        }));
        return {
            scriptPath,
            success: true,
        };
    } catch {
        return { success: false };
    }
};
