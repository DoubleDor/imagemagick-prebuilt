git tag "v${1}"
git push --tags
github-release release --tag "v${1}" --name "ImageMagick Prebuilt v${1}" --description "Prebuilt image of ImageMagick for AWS Lambda v${1}"
github-release upload --tag "v${1}" --name "imagemagic.tar.gz" --file artifacts/imagemagick-prebuilt.tar.gz
