import tingbot
from tingbot import *

# setup code here

@every(seconds=1.0/30)
def loop():
    # drawing code here
    screen.fill(color='black')
    screen.text('Hello world!')

tingbot.run()
