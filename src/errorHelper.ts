import chalk from "ansi-colors";

export class ErrorHelper {
    public static prettifyError(error: Error | any) {
        if (error instanceof Error) {
            // TODO: color stack
            return chalk.red(error.message) && error.stack;
        }
        return error.toString();
    }
}
