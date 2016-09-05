import os, sys, subprocess, tempfile, shutil, urllib2


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

def remove_packages(packages):
    project_root = os.path.dirname(os.path.dirname(__file__))
    vendor_dir = os.path.join(project_root, 'vendor')
    packages_dir = os.path.join(vendor_dir, 'tide-packages')
    for p in packages:
        package_dir = os.path.join(packages_dir,p)
        subprocess.check_call([
            'rm',
            '-rf',
            package_dir])

def download(url, filename):
    with open(filename, "wb") as f:
        response = urllib2.urlopen(url)
        f.write(response.read())


def win32_create_python_environment():
    project_root = os.path.dirname(os.path.dirname(__file__))
    vendor_dir = os.path.join(project_root, 'vendor')
    python_dir = os.path.join(vendor_dir, 'python27')

    if os.path.exists(python_dir):
        print 'build-python-env: vendor/python27 exists, nothing to be done'
        sys.exit()
    else:
        print 'build-python-env: Building vendor/python27'

    temp_dir = tempfile.mkdtemp()

    # Download the Python MSI
    msi_file = os.path.join(temp_dir, 'python-2.7.12.msi')
    download('https://www.python.org/ftp/python/2.7.12/python-2.7.12.msi', msi_file)

    # Expand it to a temporary location
    temp_python_dir = os.path.join(temp_dir, 'python27')
    subprocess.check_call([
        'msiexec',
        '-a', msi_file,
        '-qn',  # supress the UI
        'TARGETDIR=%s' % temp_python_dir])

    python_exe = os.path.join(temp_python_dir, 'python.exe')

    # Install Pip
    subprocess.check_call([python_exe, '-m', 'ensurepip'])

    # Install Python requirements
    windows_requirements = os.path.join(os.path.dirname(__file__), 'requirements-win32.txt')
    common_requirements = os.path.join(os.path.dirname(__file__), 'requirements-common.txt')

    for requirements_file in [windows_requirements, common_requirements]:
        subprocess.check_call([
            python_exe,
            '-m', 'pip',
            'install',
            '--ignore-installed',
            '-r', requirements_file])

    # Move the Python environment into place
    if not os.path.exists(vendor_dir):
        os.makedirs(vendor_dir)
    shutil.move(temp_python_dir, python_dir)


if __name__ == '__main__':
    mac_requirements = os.path.join(os.path.dirname(__file__), 'requirements-mac.txt')
    common_requirements = os.path.join(os.path.dirname(__file__), 'requirements-common.txt')

    if sys.platform == 'darwin':
        install_packages([mac_requirements, common_requirements])
    elif sys.platform.startswith('linux'):
        install_packages([common_requirements])
        remove_packages(['cryptography'])
    elif sys.platform == 'win32':
        win32_create_python_environment()
    else:
        print "build-python-env: warning: don't know how to build on this platform yet!"
