export interface ILoaderResult {
    success: boolean;
    scriptPath?: string;
    dispose?: () => void;
}
