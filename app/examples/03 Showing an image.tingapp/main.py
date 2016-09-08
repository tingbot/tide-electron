# To add images, first drag an image into the sidebar,
# or use the 'Import...' button at the bottom of the 
# sidebar.

# Once imported, images can be displayed using the
# screen.image() method. Even animated GIFs work!

import tingbot
from tingbot import *

@every(seconds=1.0/30)
def loop():
    screen.fill(color='black')
    screen.image('nyancat.gif')

tingbot.run()
