import { ILoaderResult } from "./iloaderResult";

export type ILoader = (scriptPath: string, options?: any) => Promise<ILoaderResult>;
