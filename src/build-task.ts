export class BuildTask {
    private static AddTasks(taskCollection: string[], tasks: Array<string | BuildTask>) {
        for (const task of tasks) {
            const taskName = task instanceof BuildTask ? task.Name : task;
            const taskIndex = taskName.toLowerCase();
            if (taskCollection.indexOf(taskIndex) === -1) {
                taskCollection.push(taskIndex);
            }
        }
    }

    public readonly Name: string;
    public HasRun: boolean = false;
    public Result: any;
    public Successful?: boolean;
    public Dependencies: string[] = [];
    public RunTasks: string[] = [];
    public Error: any;
    public WhenReference: BuildTaskWhen | WhenPredicate = BuildTaskWhen.SuccessfulDependencies;
    public DoesReference?: DoesDelegate;
    public ErrorReference?: ErrorDelegate;

    constructor(name: string) {
        this.Name = name;
    }

    public When(when: BuildTaskWhen | WhenPredicate): BuildTask {
        this.WhenReference = when;
        return this;
    }

    public DependsOn(tasks: string | BuildTask | Array<string | BuildTask>): BuildTask {
        BuildTask.AddTasks(this.Dependencies, tasks instanceof Array ? tasks : [tasks]);
        return this;
    }

    public Does(method: DoesDelegate): BuildTask {
        this.DoesReference = method;
        return this;
    }

    public Runs(tasks: string | BuildTask | Array<string | BuildTask>): BuildTask {
        BuildTask.AddTasks(this.RunTasks, tasks instanceof Array ? tasks : [tasks]);
        return this;
    }

    public OnError(callback: ErrorDelegate): BuildTask {
        this.ErrorReference = callback;
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
