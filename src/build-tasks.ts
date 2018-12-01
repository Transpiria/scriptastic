import chalk from "ansi-colors";
import moment, { Moment } from "moment";
import { BuildTask, BuildTaskWhen } from "./build-task";
import { ErrorHelper } from "./error-helper";

export class BuildTasks {
    public tasks: { [name: string]: BuildTask; } = {};

    public async RunTask(taskName?: string): Promise<BuildTask>;
    public async RunTask(task: BuildTask): Promise<BuildTask>;
    public async RunTask(taskOrName?: string | BuildTask): Promise<BuildTask> {
        let task: BuildTask;
        let taskName: string = taskOrName as string;

        if (!taskOrName) {
            taskName = process.argv.length > 2 ?
                process.argv[2] :
                "default";
        }

        if (taskName) {
            task = this.tasks[taskName.toLowerCase()];
            if (!task) {
                throw new Error(chalk.red(`Task '${chalk.cyan(taskName)}' was not defined.`));
            }
        } else {
            task = taskOrName as BuildTask;
            if (!task) {
                throw new Error(chalk.red(`Task is invalid.`));
            }
        }

        if (!task.HasRun) {
            task.HasRun = true;

            const dependencySuccess = await this.RunTasks(task.Dependencies);
            let shouldRun = false;
            switch (task.WhenReference) {
                case BuildTaskWhen.Always:
                    shouldRun = true;
                    break;
                case BuildTaskWhen.SuccessfulDependencies:
                    shouldRun = dependencySuccess;
                    break;
                default:
                    shouldRun = task.WhenReference(task);
                    break;
            }

            if (shouldRun) {
                const runSuccess = await this.RunTasks(task.RunTasks);

                if (task.DoesReference) {
                    const start = moment();
                    try {
                        console.info(`${this.FormatDisplayTime(start)} Starting '${chalk.cyan(task.Name)}'...`);
                        task.Result = await task.DoesReference();
                    } catch (error) {
                        task.Error = error;
                        if (task.ErrorReference) {
                            try {
                                await task.ErrorReference(error);
                            } catch (error2) {
                                task.Error = error2;
                            }
                        }
                    }

                    const end = moment();
                    const elapsed = end.diff(start);
                    let endLog = this.FormatDisplayTime(end);
                    if (!task.Error) {
                        endLog += ` Finished '${chalk.cyan(task.Name)}' `;
                    } else {
                        if (!process.exitCode || process.exitCode === 0) {
                            process.exitCode = 1;
                        }
                        if (!task.ErrorReference) {
                            console.error(ErrorHelper.prettifyError(task.Error));
                        }
                        endLog += ` '${chalk.cyan(task.Name)}' ${chalk.red("errored after ")}`;
                    }
                    endLog += this.FormatDisplayElapsed(elapsed);
                    console.info(endLog);
                }

                if (!runSuccess && !task.Error) {
                    task.Error = new Error("One or more sub-tasks threw an error.");
                }
            }

            if (!dependencySuccess && !task.Error) {
                task.Error = new Error("One or more dependent tasks threw an error.");
            }
        }

        return task;
    }

    public async RunTasks(taskNames: string[]): Promise<boolean> {
        let dependencyIndex = 0;
        let success = true;
        while (dependencyIndex < taskNames.length) {
            const dependency = taskNames[dependencyIndex];
            const task = await this.RunTask(dependency);
            if (task.Error) {
                success = false;
            }
            dependencyIndex++;
        }

        return success;
    }

    public Task(taskName: string): BuildTask {
        const taskIndex = taskName.toLowerCase();
        let task = this.tasks[taskIndex];
        if (!task) {
            task = new BuildTask(taskName);
            this.tasks[taskIndex] = task;
        }
        return task;
    }

    private FormatDisplayTime(time: Moment): string {
        return `[${chalk.grey(this.FormatTime(time))}]`;
    }

    private FormatTime(time: Moment): string {
        return time.format("HH:mm:ss");
    }

    private FormatDisplayElapsed(elapsed: number): string {
        return chalk.magenta(this.FormatElapsed(elapsed));
    }

    private FormatElapsed(elapsed: number): string {
        if (elapsed > 1100) {
            if (elapsed / 1000 > 66) {
                return `${Math.round(elapsed / 50 / 3) / 100} m`;
            } else {
                return `${Math.round(elapsed / 10) / 100} s`;
            }
        } else {
            return `${elapsed} ms`;
        }
    }
}
export const scri = new BuildTasks();
