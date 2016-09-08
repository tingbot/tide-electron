# Button presses can be received by using the @button.press
# decorator. There are four buttons on Tingbot:
#
#   @left_button.press
#   @midleft_button.press
#   @midright_button.press
#   @right_button.press

import tingbot
from tingbot import *

state = {'number': 0}

@left_button.press
def press():
    state['number'] -= 1

@right_button.press
def press():
    state['number'] += 1

@every(seconds=1.0/30)
def loop():
    screen.fill(color='black')
    screen.text(state['number'], color='green')

tingbot.run()
