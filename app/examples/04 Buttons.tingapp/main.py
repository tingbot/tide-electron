# Button presses can be received by using the @button.press
# decorator. There are four buttons on Tingbot:
#
#   @left_button.press
#   @midleft_button.press
#   @midright_button.press
#   @right_button.press

import tingbot
from tingbot import *

screen.fill(color='black')
screen.text('Waiting for a button...')

@left_button.press
def press():
    screen.fill(color='black')
    screen.text('Left button')

@right_button.press
def press():
    screen.fill(color='black')
    screen.text('Right button')

tingbot.run()
