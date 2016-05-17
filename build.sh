docker build -t imagemagick-prebuilt .

mkdir artifacts

docker run -i --rm -v ${PWD}/artifacts:/mnt/artifacts imagemagick-prebuilt /bin/bash << COMMANDS
mkdir -p /mnt/artifacts/imagemagick
cd /mnt/artifacts
apt-get install
wget http://www.imagemagick.org/download/ImageMagick.tar.gz
tar xvzf ImageMagick.tar.gz
cd ImageMagick-*
./configure --disable-installed --prefix=/mnt/artifacts/imagemagick
make
make install
echo Changing owner from \$(id -u):\$(id -g) to $(id -u):$(id -u)
chown -R $(id -u):$(id -u) /mnt/artifacts
COMMANDS

tar -zcvf artifacts/imagemagick-prebuilt.tar.gz artifacts/imagemagick
