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
var INSTALL_SCRIPT = path.join( process.cwd(), 'install.sh' );
var DEFAULT_INSTALL_LOCATION = '/tmp/imagemagick/';

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

var _getDownloadUrl = function() {
    return q
        .async( function *() {
            var release_response = yield _request( GITHUB_RELEASE_URL );
            console.log( release_response );

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

var _downloadAndUntar = function( download_link ) {
    return q
        .Promise( function( resolve ) {
            var install_arguments = [ download_link, DEFAULT_INSTALL_LOCATION ];

            var install_process = child_process.spawn( INSTALL_SCRIPT, install_arguments );;
            install_process.stdout.pipe( process.stdout );
            install_process.stderr.pipe( process.stderr );

            install_process
                .on( 'close', function() {
                    resolve( path.join( DEFAULT_INSTALL_LOCATION, 'bin' ) );
                } );
        } );
};

module.exports = function() {
    return q
        .async( function *() {
            var download_link = yield _getDownloadUrl();
            var install_location = _downloadAndUntar( download_link );
            return install_location;
        } )();
};
