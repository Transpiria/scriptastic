export class BuildTask {
    private static addTasks(taskCollection: string[], ...tasks: Array<string | BuildTask>) {
        for (const task of tasks) {
            const taskName = task instanceof BuildTask ? task.name : task;
            const taskIndex = taskName.toLowerCase();
            if (taskCollection.indexOf(taskIndex) === -1) {
                taskCollection.push(taskIndex);
            }
        }
    }

    /** The name of the task. */
    public readonly name: string;
    /** whether the task has run. */
    public hasRun: boolean = false;
    /** The result of the task. */
    public result: any;
    /** Tasks this task depends on. */
    public dependencies: string[] = [];
    /** Tasks that run as part of this task. */
    public runTasks: string[] = [];
    /** The error of the task. */
    public error: any;
    /** When to run the task. */
    public whenReference: BuildTaskWhen | WhenPredicate = BuildTaskWhen.SuccessfulDependencies;
    /** What the task does. */
    public doesReference?: DoesDelegate;
    /** What to run when an error occurs. */
    public errorReference?: ErrorDelegate;

    /**
     * Creates a new task.
     * @param name The name of the task.
     * @param does Sets what the task does.
     */
    constructor(name: string, does?: DoesDelegate) {
        this.name = name;
        if (does) {
            this.does(does);
        }
    }

    /**
     * Controls under what circumstances the task will run.
     * @param when When the task will run.
     */
    public when(when: BuildTaskWhen | WhenPredicate): BuildTask {
        this.whenReference = when;
        return this;
    }

    /**
     * A set of tasks that must run before this task can run.
     * @param tasks Dependent tasks.
     */
    public dependsOn(...tasks: Array<string | BuildTask>): BuildTask {
        BuildTask.addTasks(this.dependencies, ...tasks);
        return this;
    }

    /**
     * Sets what the task does.
     * @param method What the task does.
     */
    public does(method: DoesDelegate): BuildTask {
        this.doesReference = method;
        return this;
    }

    /**
     * A set of tasks that will run as part of this task.
     * @param tasks Tasks to run.
     */
    public runs(...tasks: Array<string | BuildTask>): BuildTask {
        BuildTask.addTasks(this.runTasks, ...tasks);
        return this;
    }

    /**
     * Sets what to run when an error occurs.
     * @param callback Method to handle errors.
     */
    public onError(callback: ErrorDelegate): BuildTask {
        this.errorReference = callback;
        return this;
    }
}

export type DoesDelegate = () => any;
export type ErrorDelegate = (err: any) => any;
export type WhenPredicate = (task: BuildTask) => boolean;

export enum BuildTaskWhen {
    /** Run only when all dependent tasks have completed without error. */
    SuccessfulDependencies,
    /** Runs regardless of dependent tasks. */
    Always,
}
