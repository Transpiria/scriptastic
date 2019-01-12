# Scriptastic

Scriptastic is a simple build script engine.

## Usage

### Installation

#### Install to the local project

Installing locally is important to ensure the project's build script is always run with the project's referenced version of scriptastic. This will help prevent potential inconsistencies between build.

```shell
npm i -D scriptastic
```

#### Install globally

Installing globally is optional, but recommended for convenience. Scriptastic will always run the local project version when available, meaning it is safe to use globally without any potential inconsistencies.

```shell
npm i -g scriptastic
```

#### Automatic transpiling

When working with a typecsript build script, Scriptastic will automatically attempt to transpile the script so you don't need to. In order to do so, one of the following optional dependencies will need to be installed.

> Note: None of these are needed if the script is written in javascript.

##### ts-node

Strongly recommended, as the script will be run in memory.

```shell
npm i -D ts-node
```

##### typescript

```shell
npm i -D typescript
```

### Running a script

Scriptastic's cli is `scri`. Simply running `scri` will run the `default` task. Adding a task name as an argument will run that particular task. Example: `scri build` will run the `build` task.

#### Run globally

```shell
scri build
```

#### Run locally with npm

```shell
npx scri build
```

#### Run locally

```shell
node node_modules/.bin/scri build
```

### Creating a script

Create a script in the root of the project directory. The file can be `scri.ts` or `scri.js`. The javascript file is prioritized when available incase transpiling is handled outside of scriptastic.

#### Import

Start the build script by importing scriptastic.

```ts
import { scri } from "scriptastic";
```

#### Create a task

Tasks are the core of the build system. Tasks can be as granular as needed.

This will create a task named `clean`.

[samples/simple.flow.ts#L3-L6](samples/simple.flow.ts#L3-L6)

#### Add a dependency for a task

Dependencies are run before the current task. By default, the task will only run when all dependencies are successful.

This will create a task named `build` with a dependency on the `clean` task.

[samples/simple.flow.ts#L8-L12](samples/simple.flow.ts#L8-L12)

## Why should I use this build system?

### Prioritizes running locally

Scriptastic will prioritize running from the locally installed project regardless of where it was executed. This will help prevent inconsistencies between build environments, while encouraged to be executed globally for convenience.

### Build script written in typescript

I have always had a problem with my project being written in typescript, but needing to write my build script in javascript. Yes, many build scripts can be written in typescript, but they typically need to be transpiled before running, effectively needing to build the build script. Scriptastic takes care of transpiling, making this step nearly non-existent to the user.

### Error handling

Don't like seeing an error about a thrown error? Too much or too little information about the error is shown? Control exactly how errors are displayed. We know errors will happen, so scriptastic allow you to control the flow and display of said errors.

### Included type definitions

Scriptastic was built with the intention of being used in typescript, so everything is included to do so.

### Small dependency stack

Scriptastic only has a few dependencies, and these dependencies are mostly for convenience, like displaying console output in color.