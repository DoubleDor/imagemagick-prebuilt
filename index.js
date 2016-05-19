/**
 * @file index.js
 *
 * Copyright (C) 2016 Dor Technologies
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

var child_process = require( 'child_process' ),
    path = require( 'path' );

var request = require( 'request' ),
    q = require( 'q' );

var GITHUB_RELEASE_URL = 'https://api.github.com/repos/DoubleDor/imagemagick-prebuilt/releases/latest';
var INSTALL_SCRIPT = path.join( __dirname, 'install.sh' );
var DEFAULT_INSTALL_LOCATION = '/tmp/imagemagick/';

/**
 * Promise wrapper for request
 * @param  {String} url         The Url to GET
 * @return {Promise<String>}    Return the response body
 */
var _request = function( url ) {
    return new q
        .Promise( function( resolve, reject ) {
            request( {
                url: url,
                method: 'get',
                headers: {
                    'User-Agent': 'imagemagick-prebuilt downloader'
                }
            }, function( err, res, body ) {
                if( err ) return reject( err );
                resolve( body );
            } );
        } );
}

/**
 * Gets the latest download link by chcking GITHUB_RELEASE_URL, and pulling
 * the browser_download_url from the latest
 * @return {Promise<String>} The tarbal download link
 */
var _getDownloadUrl = function() {
    return q
        .async( function *() {
            var release_response = yield _request( GITHUB_RELEASE_URL );

            try {
                var release_response_json = JSON.parse( release_response );
            } catch( err ) {
                console.error( 'JSON parse failed' );
                console.error( err );
                throw err;
            }

            if( !release_response_json ||
                !release_response_json.hasOwnProperty( 'assets' ) ||
                !release_response_json.assets.length === 1 ||
                !release_response_json.assets[ 0 ].hasOwnProperty( 'browser_download_url' ) ) {
                throw new Error( 'Bad resposne from github' );
            }

            return release_response_json.assets[ 0 ].browser_download_url;
        } )();
};
/**
 * Runs the install.sh script, which is responsible for downloading tarbal,
 * extracting imagemagick and running the font loading script.
 * @param  {String} download_link Link to the tarbal
 * @return {Promise<String>}      Returns the install location
 */
var _downloadAndUntar = function( download_link ) {
    return q
        .Promise( function( resolve ) {
            var install_arguments = [ download_link, DEFAULT_INSTALL_LOCATION ];

            var install_process = child_process.spawn( INSTALL_SCRIPT, install_arguments );;
            install_process.stdout.pipe( process.stdout );
            install_process.stderr.pipe( process.stderr );

            install_process
                .on( 'close', function() {
                    resolve( DEFAULT_INSTALL_LOCATION );
                } );
        } );
};

/**
 * Main function for the installer. Returns a promise that installs imagemagick
 * by downloading it from the github releases page. It then returns the bin
 * path to the convert executable.
 * @return {Promise<String>}
 */
module.exports = function() {
    return q
        .async( function *() {
            if( fs.existsSync( DEFAULT_INSTALL_LOCATION ) ) {
                return DEFAULT_INSTALL_LOCATION;
            }

            var download_link = yield _getDownloadUrl();
            var install_location = _downloadAndUntar( download_link );

            return install_location;
        } )()
        .then( function( install_dir ) {
            // Build /tmp/imagemagick/lib/bin/convert
            var convert_bin_path = path.join( install_dir, 'bin', 'convert' );

            // Add /tmp/imagemagick/lib/ to LD_LIBRARY_PATH so that the exe can
            // find the .so's
            var lib_path = path.join( install_dir, 'lib' );
            process.env.LD_LIBRARY_PATH = ( process.env.LD_LIBRARY_PATH ) ? process.env.LD_LIBRARY_PATH + ':' : '';
            process.env.LD_LIBRARY_PATH += lib_path;

            return convert_bin_path;
        } );
};
