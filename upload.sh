git tag "v${1}" && git push --tags
github-release release --tag "v${1}" --name "ImageMagick Prebuilt" --description "Prebuilt image of ImageMagick for AWS Lambda"
github-release upload --tag "v${1}" --name "imagemagick-prebuilt" --file artifacts/ImageMagick.tar.gz
