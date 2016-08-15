import os, sys, subprocess, tempfile, shutil


def install_packages(requirements_files):
    project_root = os.path.dirname(os.path.dirname(__file__))
    vendor_dir = os.path.join(project_root, 'vendor')
    packages_dir = os.path.join(vendor_dir, 'tide-packages')

    if os.path.exists(packages_dir):
        print 'build-python-env: tide-packages exists, nothing to be done'
        sys.exit()
    else:
        print 'build-python-env: Building tide-packages'

    temp_packages_dir = tempfile.mkdtemp()

    for f in requirements_files:
        subprocess.check_call([
            'pip',
            'install',
            '--target', temp_packages_dir,
            '-r', f])

    # we've completed building the packages dir, move it into place
    if not os.path.exists(vendor_dir):
        os.makedirs(vendor_dir)
    shutil.move(temp_packages_dir, packages_dir)

if __name__ == '__main__':
    mac_requirements = os.path.join(os.path.dirname(__file__), 'requirements-mac.txt')
    common_requirements = os.path.join(os.path.dirname(__file__), 'requirements-common.txt')

    if sys.platform == 'darwin':
        install_packages([mac_requirements,common_requirements])
    elif sys.platform.startswith('linux'):
        install_packages([common_requirements])
    else:
        print "build-python-env: warning: don't know how to build on this platform yet!"
