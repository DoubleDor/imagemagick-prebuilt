#!/bin/bash

tar -C /usr/share/fonts/ -xzf ${1}
fc-cache -fv
find /usr/share/fonts/ -type f | /tmp/imagemagick/bin/imagick_type_gen -f > /tmp/imagemagick/etc/ImageMagick-7/type.xml 2> /dev/null
