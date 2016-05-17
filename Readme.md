# ImageMagick Prebuilt

## Install Node Package

```
npm install --save imagemagick-prebuilt
```

## Install ImageMagick within NodeJS

```javascript
var imagemagick_prebuilt = require( 'imagemagick-prebuilt' );

return q
    .async( function *() {
        imagemagick_bin_location = yield imagemagick_prebuilt();
        console.log( `ImageMagick installed: ${imagemagick_bin_location}` );
    } )();
```

Will be installed to `/tmp/imagemagick`

## Build/Upload new version

```
./build.sh
```

```
./upload.sh ${verison_number}
```
