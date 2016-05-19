#!/bin/bash

mkdir -p ${2}
cd /tmp/
curl -L -O ${1}
tar -C ${2} --strip-components=2 -xzf imagemagick-prebuilt.tar.gz

chmod +x /tmp/imagemagick/bin/imagick_type_gen
find /usr/share/fonts/ -type f | /tmp/imagemagick/bin/imagick_type_gen -f > /tmp/imagemagick/etc/ImageMagick-7/type.xml 2> /dev/null
