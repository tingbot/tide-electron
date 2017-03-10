# Tide

A cross-platform IDE for Tingbot, built in Javascript using [Electron](https://github.com/atom/electron).

[![Build Status](https://travis-ci.org/tingbot/tide-electron.svg?branch=master)](https://travis-ci.org/tingbot/tide-electron) [![Build status](https://ci.appveyor.com/api/projects/status/30p5htkdcq5y2kq8?svg=true)](https://ci.appveyor.com/project/joerick/tide-electron)

## Changelog

### 0.5.2

- Added zoom options in Window menu
- Fix: Tingbot docs link

### 0.5.1

- Fix: menu items enabling for new documents (#70)
- Fix: examples open as new documents (#71)

### 0.5.0

- **Feature** You can now enter a Tingbot IP address manually. This allows Tingbot to work on managed WiFi networks! (#66)
- Fix: permissions problem on Linux with multiple users (#64)
- Fix: bug where font files could become corrupt when opened in the editor (#62)
- Update: Tingbot-python libraries to 1.1.1

## How to setup a development environment

### Windows

This project uses Node.js, Python 2.7 and some modules. For now, these have to be manually installed.  

* Download Node.js from: https://nodejs.org/en/
* Install python 2.7.* from: https://www.python.org/  
  **IMPORTANT:** During the installation there is an opt-in to add Python to the path variable. You have to do this otherwise the project can't find Python. If you get errors later call ``setx PATH "%PATH%;C:\Python33\Scripts"`` from the terminal. This will add Python to your path.
* If you don't have Visual Studio installed, `npm install --global --production windows-build-tools`

### Mac

* Install [Homebrew](http://brew.sh/)
* `brew install node`

## Running

 * ``npm run build-python``
 * ``npm install``
 * ``./node_modules/.bin/webpack``
 * ``npm run dev`` (this will run webpack watching for changes while starting the app)

## Contributing

Check the [issues list](https://github.com/tingbot/tide-electron/issues) for outstanding bits of work we'd like help with. 

If you have an idea for a feature/change, create an issue describing the change before starting work so we can discuss. Then fork the project, and [open a pull request](https://help.github.com/articles/proposing-changes-to-a-project-with-pull-requests/) with your changes. Try to keep pull requests focused on the problem/feature

We also have a Slack team where everything is discussed. [Join us!](http://slack.tingbot.com/)

We have a [code of conduct](http://tingbot.com/codeofconduct/).

If you're new to open source, welcome! This project should be a great way to get your feet wet.
