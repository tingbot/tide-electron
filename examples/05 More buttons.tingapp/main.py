# Each button also has four events - down, up, press and hold.
#
# Try pressing or holding the right button to see when each
# event is triggered.

import tingbot
from tingbot import *

@right_button.down
def down():
    screen.rectangle(color='red', size=(1,50), align='topright')
    screen.text('down', font_size=12, align='topright')

@right_button.press
def next():
    screen.rectangle(color='green', size=(1,50), align='right')
    screen.text('press', font_size=12, align='right')

@right_button.hold
def next():
    screen.rectangle(color='blue', size=(1,50), align='right')
    screen.text('hold', font_size=12, align='right')

@right_button.up
def next():
    screen.rectangle(color='white', size=(1,50), align='bottomright')
    screen.text('up', font_size=12, align='bottomright')

screen.fill(color='black')

@every(seconds=1.0/30)
def loop():
    # This moves everything on the screen left by 1px
    screen.surface.scroll(-1, 0)
    screen.rectangle(color='black', size=(1,240), align='right')

tingbot.run()
