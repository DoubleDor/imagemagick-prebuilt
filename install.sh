#!/bin/bash

mkdir -p ${2}
curl -L ${1} | tar -C ${2} --strip-components=1 -xzf -
