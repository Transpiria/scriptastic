import chalk from "ansi-colors";
import moment, { Moment } from "moment";
import { BuildTask, BuildTaskWhen } from "./buildTask";

export class BuildTasks {
    private tasks: { [name: string]: BuildTask; } = {};

    /**
     * Runs a task.
     * @param task The task to run.
     */
    public async runTask(task: string | BuildTask = "default"): Promise<BuildTask> {
        if (typeof task === "string") {
            const taskName = task;
            task = this.tasks[taskName.toLowerCase()];
            if (!task) {
                throw new Error(chalk.red(`Task '${chalk.cyan(taskName)}' was not defined.`));
            }
        }

        if (!task.hasRun) {
            task.hasRun = true;

            const dependencySuccess = await this.runTasks(task.dependencies);
            let shouldRun = false;
            switch (task.whenReference) {
                case BuildTaskWhen.Always:
                    shouldRun = true;
                    break;
                case BuildTaskWhen.SuccessfulDependencies:
                    shouldRun = dependencySuccess;
                    break;
                default:
                    shouldRun = task.whenReference(task);
                    break;
            }

            if (shouldRun) {
                const runSuccess = await this.runTasks(task.runTasks);

                if (task.doesReference) {
                    const start = moment();
                    try {
                        console.info(`${this.writeTime(start)} Starting '${chalk.cyan(task.name)}'...`);
                        task.result = await task.doesReference();
                    } catch (error) {
                        task.error = error;
                        if (task.errorReference) {
                            try {
                                await task.errorReference(error);
                            } catch (error2) {
                                task.error = error2;
                            }
                        }
                    }

                    const end = moment();
                    const elapsed = end.diff(start);
                    let endLog = this.writeTime(end);
                    if (!task.error) {
                        endLog += ` Finished '${chalk.cyan(task.name)}' `;
                    } else {
                        if (!process.exitCode || process.exitCode === 0) {
                            process.exitCode = 1;
                        }
                        endLog += ` '${chalk.cyan(task.name)}' ${chalk.red("errored after ")}`;
                    }
                    endLog += this.writeElapsed(elapsed);
                    console.info(endLog);
                }

                if (!runSuccess && !task.error) {
                    task.error = new Error("One or more sub-tasks threw an error.");
                }
            }

            if (!dependencySuccess && !task.error) {
                task.error = new Error("One or more dependent tasks threw an error.");
            }
        }

        return task;
    }

    /**
     * Runs a set of tasks.
     * @param taskNames Tasks to run.
     * @returns Whether the tasks run were successful.
     */
    public async runTasks(taskNames: string[]): Promise<boolean> {
        let dependencyIndex = 0;
        let success = true;
        while (dependencyIndex < taskNames.length) {
            const dependency = taskNames[dependencyIndex];
            const task = await this.runTask(dependency);
            if (task.error) {
                success = false;
            }
            dependencyIndex++;
        }

        return success;
    }

    /**
     * Creates a runnable task.
     * @param taskName The name of the task.
     */
    public task(taskName: string): BuildTask {
        const taskIndex = taskName.toLowerCase();
        let task = this.tasks[taskIndex];
        if (!task) {
            task = new BuildTask(taskName);
            this.tasks[taskIndex] = task;
        }
        return task;
    }

    private writeTime(time: Moment): string {
        return `[${chalk.grey(this.formatTime(time))}]`;
    }

    private formatTime(time: Moment): string {
        return time.format("HH:mm:ss");
    }

    private writeElapsed(elapsed: number): string {
        return chalk.magenta(this.formatElapsed(elapsed));
    }

    private formatElapsed(elapsed: number): string {
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
