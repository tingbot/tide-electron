mkdir vendor
wget https://www.python.org/ftp/python/2.7.11/Python-2.7.11.tar.xz
tar -xf Python-2.7.11.tar.xz
cd Python-2.7.11
./configure --prefix="/python"
make
DESTDIR="../vendor" make install

cd ../
rm -rf Python-2.7.11*

cd vendor/python/bin

wget https://bootstrap.pypa.io/get-pip.py
./python get-pip.py
rm get-pip.py

./pip install hg+http://bitbucket.org/pygame/pygame
./pip install git+https://github.com/tingbot/tingbot-python.git
