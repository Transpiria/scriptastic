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

    public readonly name: string;
    public hasRun: boolean = false;
    public result: any;
    public successful?: boolean;
    public dependencies: string[] = [];
    public runTasks: string[] = [];
    public error: any;
    public whenReference: BuildTaskWhen | WhenPredicate = BuildTaskWhen.SuccessfulDependencies;
    public doesReference?: DoesDelegate;
    public errorReference?: ErrorDelegate;

    constructor(name: string) {
        this.name = name;
    }

    public when(when: BuildTaskWhen | WhenPredicate): BuildTask {
        this.whenReference = when;
        return this;
    }

    public dependsOn(...tasks: Array<string | BuildTask>): BuildTask {
        BuildTask.addTasks(this.dependencies, ...tasks);
        return this;
    }

    public does(method: DoesDelegate): BuildTask {
        this.doesReference = method;
        return this;
    }

    public runs(...tasks: Array<string | BuildTask>): BuildTask {
        BuildTask.addTasks(this.runTasks, ...tasks);
        return this;
    }

    public onError(callback: ErrorDelegate): BuildTask {
        this.errorReference = callback;
        return this;
    }
}

export type DoesDelegate = () => any;
export type ErrorDelegate = (err: any) => any;
export type WhenPredicate = (task: BuildTask) => boolean;

export enum BuildTaskWhen {
    SuccessfulDependencies,
    Always,
}
