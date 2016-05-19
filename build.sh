rm -rf artifacts
docker build -t imagemagick-prebuilt .

mkdir artifacts

# Here we build librsvg and imagemagick, and throw them into /mnt/artifcats
#
# We also copy all of the required shared libararies (.so files) to the directory
# so that we don't need to install them on Lambda
# TODO: Copying .so's makes the package gigantic, there's probably a better way
#
# It also downloads imagick_type_gen from http://www.imagemagick.org/Usage/scripts/imagick_type_gen
# which is a helper script for detecting system fonts

docker run -i --rm -v ${PWD}/artifacts:/mnt/artifacts imagemagick-prebuilt /bin/bash << COMMANDS
mkdir -p /tmp/imagemagick
mkdir -p /tmp/src
cd /tmp/src

mkdir librsvg
wget http://ftp.gnome.org/pub/gnome/sources/librsvg/2.40/librsvg-2.40.15.tar.xz -O librsvg.tar.xz
tar -C librsvg --strip-components=1 -xJf librsvg.tar.xz
cd librsvg
./configure --prefix=/tmp/imagemagick --enable-shared=no --enable-static=yes
make && make install
cd ../

mkdir imagemagick
wget http://www.imagemagick.org/download/ImageMagick.tar.gz -O imagemagick.tar.gz
tar -C imagemagick --strip-components=1 -xzf imagemagick.tar.gz
cd imagemagick
./configure --prefix=/tmp/imagemagick --enable-delegate-build --disable-shared --with-rsvg=yes --disable-installed
make
make install

for i in libgio-2.0.so libcairo.so libgobject-2.0.so libgdk_pixbuf-2.0.so libpangocairo-1.0.so libpango-1.0.so libcroco-0.6.so libxml2.so libgmodule-2.0.so libpixman-1.so libfontconfig.so libfreetype.so libxcb-shm.so libxcb-render.so libxcb.so libXrender.so libX11.so libXext.so libffi.so libpangoft2-1.0.so libthai.so libXau.so libXdmcp.so libharfbuzz.so libdatrie.so libgraphite2.so
do
    cp /usr/lib/x86_64-linux-gnu/$i* /tmp/imagemagick/lib/
done

for i in libglib-2.0.so libm.so libpthread.so libc.so libz.so libselinux.so libresolv.so librt.so libpcre.so libdl.so liblzma.so libexpat.so
do
    cp /lib/x86_64-linux-gnu/$i* /tmp/imagemagick/lib/
done

wget -O /tmp/imagemagick/bin/imagick_type_gen http://www.imagemagick.org/Usage/scripts/imagick_type_gen
chmod +x /tmp/imagemagick/bin/imagick_type_gen

mv /tmp/imagemagick /mnt/artifacts/
echo Changing owner from \$(id -u):\$(id -g) to $(id -u):$(id -u)
chown -R $(id -u):$(id -u) /mnt/artifacts
COMMANDS

# Package up a tarbal so that upload.sh can properly upload it. You can
# use this tarbal yourself if you want.

tar -zcvf artifacts/imagemagick-prebuilt.tar.gz artifacts/imagemagick
