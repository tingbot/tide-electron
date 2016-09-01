# Tide

A cross-platform IDE for Tingbot, built in Javascript using [Electron](https://github.com/atom/electron).

## Setup a development environment

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
