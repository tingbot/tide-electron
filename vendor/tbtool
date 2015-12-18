#!/usr/bin/env python

from docopt import docopt
import sys, os, textwrap, uuid, datetime, getpass, shutil
import subprocess


def tingbot_key_path():
    dir_path = '/tmp/tide-key-%s/' % getpass.getuser()
    tmp_path = os.path.join(dir_path, 'tingbot.key')

    if not os.path.exists(tmp_path):
        if not os.path.exists(dir_path):
            os.mkdir(os.path.dirname(tmp_path), 0700)
        src_path = os.path.join(os.path.dirname(__file__), 'tingbot.key')
        shutil.copyfile(src_path, tmp_path)
        os.chmod(tmp_path, 0600)

    return tmp_path


def open_ssh_session(hostname):
    control_path = '/tmp/tide-ssh-control-{uuid}-{t.hour}:{t.minute}'.format(
        uuid=uuid.uuid1(),
        t=datetime.datetime.now())

    subprocess.check_call([
        'ssh',
        '-nNf4',
        '-o', 'UserKnownHostsFile=/dev/null',
        '-o', 'StrictHostKeyChecking=no',
        '-i', tingbot_key_path(),
        '-o', 'ControlMaster=yes',
        '-o', 'ControlPath=%s' % control_path,
        'pi@%s' % hostname])

    return control_path


def close_ssh_session(control_path):
    subprocess.check_call([
        'ssh',
        '-o', 'ControlPath=%s' % control_path,
        '-O', 'exit',
        'hostname-not-required'])


def simulate(app_path):
    python_path = os.path.dirname(__file__)

    environment = os.environ.copy()
    environment['PYTHONPATH'] = python_path

    main_file = os.path.abspath(os.path.join(app_path, 'main'))

    os.chdir(app_path)

    if os.path.exists(main_file):
        os.execvpe(main_file, [main_file], environment)
    else:
        os.execvpe('python', ['python', 'main.py'], environment)


def run(app_path, hostname):
    print 'Connecting to Pi...'

    control_path = open_ssh_session(hostname)

    try:
        app_name = os.path.basename(app_path)

        app_install_location = '/tmp/tide/%s' % app_name
        app_install_folder = os.path.dirname(app_install_location)

        print 'Setting up Pi...'

        subprocess.check_call([
            'ssh',
            '-o', 'ControlPath=%s' % control_path,
            'pi@%s' % hostname,
            'mkdir -p %s' % app_install_folder])

        print 'Copying app to %s...' % app_install_location

        subprocess.check_call([
            'rsync',
            '--recursive',
            '--perms',
            '--links', '--safe-links',
            '--delete',
            '-e', 'ssh -o ControlPath=%s' % control_path,
            app_path + '/',
            'pi@%s:"%s"' % (hostname, app_install_location)])

        print 'Starting app...'

        subprocess.check_call([
            'ssh',
            '-o', 'ControlPath=%s' % control_path,
            'pi@%s' % hostname,
            'tbopen --follow "%s"' % app_install_location])
    finally:
        close_ssh_session(control_path)


def install(app_path, hostname):
    control_path = open_ssh_session(hostname)

    try:
        app_name = os.path.basename(app_path)

        app_install_location = '/apps/%s' % app_name

        subprocess.check_call([
            'rsync',
            '--recursive',
            '--perms',
            '--links', '--safe-links',
            '--delete',
            '-e', 'ssh -o ControlPath=%s' % control_path,
            app_path,
            'pi@%s:%s' % (hostname, app_install_location)])

        subprocess.check_call([
            'ssh',
            '-o', 'ControlPath=%s' % control_path,
            'pi@%s' % hostname,
            'tbopen /apps/home'])
    finally:
        close_ssh_session(control_path)


def main():
    args = docopt(textwrap.dedent('''
        Usage: tbtool simulate <app>
               tbtool run <app> <hostname>
               tbtool install <app> <hostname>
        '''))

    # simulate: Runs an app in the tingbot simulator (must be a python app).
    # run: Runs an app on the tingbot specified by <hostname>, without installing.
    # install: Installs an app on the tingbot specified

    if args['simulate']:
        return simulate(args['<app>'])
    elif args['run']:
        return run(args['<app>'], args['<hostname>'])
    elif args['install']:
        return install(args['<app>'], args['<hostname>'])

if __name__ == '__main__':
    main()
