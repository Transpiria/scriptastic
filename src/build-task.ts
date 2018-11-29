export class BuildTask {
    public readonly Name: string;
    public HasRun: boolean = false;
    public Result: any;
    public Successful?: boolean;
    public Dependencies: string[] = [];
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

    public IsDependentOn(taskName: string): BuildTask {
        const taskIndex = taskName.toLowerCase();
        if (this.Dependencies.indexOf(taskIndex) === -1) {
            this.Dependencies.push(taskIndex);
        }
        return this;
    }

    public Does(method: DoesDelegate): BuildTask {
        this.DoesReference = method;
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
