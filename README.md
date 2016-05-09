# Tide

A cross-platform IDE for Tingbot, built in Javascript using [Electron](https://github.com/atom/electron).

## Set up

### Windows

This project uses Node.js, Python 2.7 and some modules. For now, these have to be manually installed.  

* Download Node.js from: https://nodejs.org/en/
* Install python 2.7.* from: https://www.python.org/  
  **IMPORTANT:** During the installation there is an opt-in to add Python to the path variable. You have to do this otherwise the project can't find Python. If you get errors later call ``setx PATH "%PATH%;C:\Python33\Scripts"`` from the terminal. This will add Python to your path.
* Install pygame from http://pygame.org/download.shtml
* To get the 'tingbot-python' module you need to have pip. Pip is a package manager for Python which should be installed with Python.  
  Execute the following code in the terminal: ``pip install https://github.com/tingbot/tingbot-python/zipball/master``. This will download the tingbot-python module.
* If everything worked without problems you should be able to start Tide using the commands under [Running](#running) below.

### Mac

* Install [Homebrew](http://brew.sh/)
* `brew install node`

That's all you need for the basic editor. If you want to run the Tingbot apps too:

* Install pygame from http://pygame.org/download.shtml
* `sudo pip install https://github.com/tingbot/tingbot-python/zipball/master`

## Running

 * ``npm install``
 * ``./node_modules/.bin/webpack`` (if you've got webpack installed system-wide you can just do ``webpack`` )
 * ``npm start``

When developing, it's handy to use ``webpack --watch --progress`` and ``npm start`` at the same time in separate tabs. Some code changes can then be reloaded without restarting the app (View > Reload).

## Contributing

Check out our [previous discussion thread](https://github.com/tingbot/tide/issues/4) for more information on the architecture of Tide and how we want it to perform.

If you want to get involved:

- create an issue with the functionality you want to add
- if you have the know-how, submit a pull-request implementing/fixing something from the issues list.

We also have a Slack team where everything is discussed. [Join us!](http://slack.tingbot.com/)

We have a [code of conduct](http://tingbot.com/codeofconduct/).

If you're new to open source, welcome! This project should be a great way to get your feet wet.
