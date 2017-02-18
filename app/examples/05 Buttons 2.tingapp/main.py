# Store data by using a variable.
# Here we make a variable called 'state'.
# The curly brackets make a 'dict'.
# Here we make a dict with on key 'number', so it can
# be accessed with state['number'].

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
