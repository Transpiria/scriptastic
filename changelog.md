# Changelog
All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2018-11-30
### Added
- Added ts-node as the primary option for live typescript compiling. [@tasadar2](https://github.com/tasadar2)
- Added support for arrays of dependencies and run actions. [@tasadar2](https://github.com/tasadar2)

## [1.0.1] - 2018-11-30
### Added
- Added runnable tasks instead of relying on dependencies. [@tasadar2](https://github.com/tasadar2)
  - This allows for DRY-er task flows to be created.
- Added support for a task or task name to be used as a dependency. [@tasadar2](https://github.com/tasadar2)

### Changed
- Tasks without an action are no longer logged to the console. [@tasadar2](https://github.com/tasadar2)

### Fixed
- Fixed bug causing Error to be logged rather than the Error content for default task errors. [@tasadar2](https://github.com/tasadar2)
- Fixed issue causing tasks with failed dependencies to report as successful. [@tasadar2](https://github.com/tasadar2)

## [1.0.0] - 2018-11-29
### Added
- Initial release