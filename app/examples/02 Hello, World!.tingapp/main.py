import tingbot
from tingbot import *

@every(seconds=1.0/30)
def draw():
    screen.fill(color='blue')
    screen.text('Hello, world!', color='white')

tingbot.run()
