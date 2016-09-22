# This is a really simple drawing app.
#
# Every time the Tingbot detects something touching the
# screen, this program draws a blue rectangle in that place.
#
# For more info on what can be done with @touch, check out
# https://tingbot-python.readthedocs.io/en/latest/touch.html

import tingbot
from tingbot import *

screen.fill(color='white')

@touch()
def on_touch(xy):
    screen.rectangle(xy=xy, size=(6, 6), color='blue')

tingbot.run()
