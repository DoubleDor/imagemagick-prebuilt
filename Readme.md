# ImageMagick Prebuilt

## Install Node Package

```
npm install --save imagemagick-prebuilt
```

## Install ImageMagick within NodeJS

```javascript
var imagemagick_prebuilt = require( 'imagemagick-prebuilt' );

var child_process = require( 'child_process' );

exports.handler = function( event, context ) {
    imagemagick_prebuilt()
        .then( function( imagemagick_bin_location ) {
            // ImageMagick logo creation test:
            // convert logo: logo.gif
            var convert_process = child_process
                .spawn( imagemagick_bin_location, [ 'logo:', 'logo.gif' ] )

            convert_process
                .on( 'close', function() {
                    context.success();
                } );
        } );
};
```

Or with `q.async`

```javascript
var imagemagick_prebuilt = require( 'imagemagick-prebuilt' );

var child_process = require( 'child_process' );

exports.handler = function( event, context ) {
    return q
        .async( function *() {
            imagemagick_bin_location = yield imagemagick_prebuilt();
            console.log( `ImageMagick installed: ${imagemagick_bin_location}` );

            // ImageMagick logo creation test:
            // convert logo: logo.gif
            var convert_process = child_process
                .spawn( imagemagick_bin_location, [ 'logo:', 'logo.gif' ] )

            convert_process
                .on( 'close', function() {
                    context.success();
                } );
        } )();
};
```

Will be installed to `/tmp/imagemagick`

## Build/Upload new version

```
./build.sh
```

Build is output to `artifacts/imagemagick-prebuilt.tar.gz`

```
./upload.sh ${version_number}
```
