import os, sys, subprocess, tempfile, shutil


def create_tide_packages_mac():
    project_root = os.path.dirname(os.path.dirname(__file__))
    vendor_dir = os.path.join(project_root, 'vendor')
    packages_dir = os.path.join(vendor_dir, 'tide-packages')

    if os.path.exists(packages_dir):
        print 'build-python-env: tide-packages exists, nothing to be done'
        sys.exit()
    else:
        print 'build-python-env: Building tide-packages'

    temp_packages_dir = tempfile.mkdtemp()

    mac_requirements = os.path.join(os.path.dirname(__file__), 'requirements-mac.txt')
    subprocess.check_call([
        'pip',
        'install',
        '--target', temp_packages_dir,
        '-r', mac_requirements])

    common_requirements = os.path.join(os.path.dirname(__file__), 'requirements-common.txt')
    subprocess.check_call([
        'pip',
        'install',
        '--target', temp_packages_dir,
        '-r', common_requirements])

    # we've completed building the packages dir, move it into place
    if not os.path.exists(vendor_dir):
        os.makedirs(vendor_dir)
    shutil.move(temp_packages_dir, packages_dir)


if __name__ == '__main__':
    if sys.platform == 'darwin':
        create_tide_packages_mac()
    else:
        print "build-python-env: error: don't know how to build on this platform yet!"
        sys.exit(1)
