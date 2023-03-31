
/*
 * Node Js Symlink generator
 */

const fs = require('fs');
const path = require('path');

const mediaExtension = ['avi', 'mkv', 'mpg'];

function getMediaFiles(dir){
    var settings = {
        root: dir,
        entryType: mediaExtension
    };

    var files = [];

    readdirp(settings)
        .on(data,
            entry => {
               console.log(data);
                files.push()
            }
        )
        .on('error',
            error => {
                console.log("Error: ", error);
            }
        );

    return files;
}

// Récupération de la ligne de commande en retirant les 2 premières cases
var pathParam = process.argv.slice(2);
console.log("Recherche dans: " + pathParam[0]);

// Recherche
getMediaFiles(pathParam[0]);







