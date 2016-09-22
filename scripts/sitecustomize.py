# We need tide-packages to be at the top of sys.path, but .pth files in the
# environment override PYTHONPATH and take precedence. This module puts
# tide-packages back on top.

import os, sys
tide_packages_path = os.path.abspath(os.path.dirname(__file__))

if tide_packages_path in sys.path:
	sys.path.remove(tide_packages_path)

sys.path.insert(1, tide_packages_path)
