//   _   _ _ _     ___  _____ _ _
//  | \ | (_) | __/ _ \|  ___| (_)_  __
//  |  \| | | |/ / | | | |_  | | \ \/ /
//  | |\  | |   <| |_| |  _| | | |>  <
//  |_| \_|_|_|\_\\___/|_|   |_|_/_/\_\

// Exemple adapté de la mise en route d'Express :
// http://expressjs.com/fr/starter/hello-world.html



// ************************************************************


//   ___                            _      ___     ____                  _
//  |_ _|_ __ ___  _ __   ___  _ __| |_   ( _ )   |  _ \ ___  __ _ _   _(_)_ __ ___
//   | || '_ ` _ \| '_ \ / _ \| '__| __|  / _ \/\ | |_) / _ \/ _` | | | | | '__/ _ \
//   | || | | | | | |_) | (_) | |  | |_  | (_>  < |  _ <  __/ (_| | |_| | | | |  __/
//  |___|_| |_| |_| .__/ \___/|_|   \__|  \___/\/ |_| \_\___|\__, |\__,_|_|_|  \___|
//                |_|                                           |_|
const express = require('express');
const figlet = require('figlet');
const helmet = require('helmet');
const auth = require('basic-auth');
const path = require('path');
const { promisify } = require('util');
const { resolve } = require('path');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const fetch = require('node-fetch');
require('dotenv').config();
const MatomoTracker = require('matomo-tracker');
const ip = require("ip");


// ************************************************************

//  __     __         _       _     _
//  \ \   / /_ _ _ __(_) __ _| |__ | | ___  ___
//   \ \ / / _` | '__| |/ _` | '_ \| |/ _ \/ __|
//    \ V / (_| | |  | | (_| | |_) | |  __/\__ \
//     \_/ \__,_|_|  |_|\__,_|_.__/|_|\___||___/
// Initialize with your site ID and Matomo URL
const matomo = new MatomoTracker(11, 'https://stats.fr/piwik.php');

// Dossier qui contient les films à afficher
//const STREAM_DIR = "/var/www/str3aming/";
const STREAM_DIR = __dirname + "/MOVIES_AND_SERIES/";
const genres = [];
const URL_BASE = "http://127.0.0.1";
const CURRENT_DIR = __dirname;



// ************************************************************


//   _   _           _          _ ____    _____
//  | \ | | ___   __| | ___    | / ___|  | ____|_  ___ __  _ __ ___  ___ ___
//  |  \| |/ _ \ / _` |/ _ \_  | \___ \  |  _| \ \/ / '_ \| '__/ _ \/ __/ __|
//  | |\  | (_) | (_| |  __/ |_| |___) | | |___ >  <| |_) | | |  __/\__ \__ \
//  |_| \_|\___/ \__,_|\___|\___/|____/  |_____/_/\_\ .__/|_|  \___||___/___/
//                                                  |_|
const app = express();
app.use(require('express-status-monitor')());
// Définition du moteur de template
app.set('view engine', 'ejs');
app.locals.inspect = require('util').inspect;
// Définition du répertoire public
app.use(express.static(__dirname + '/public'));
// Sécurité
//User validation
//https://github.com/jshttp/basic-auth
app.use(helmet());



// ************************************************************



//   ____             _
//  |  _ \ ___  _   _| |_ ___  ___
//  | |_) / _ \| | | | __/ _ \/ __|
//  |  _ < (_) | |_| | ||  __/\__ \
//  |_| \_\___/ \__,_|\__\___||___/

/**
 * Route / en GET
 */
app.get('/', async function (req, res)
{
  const user = auth(req);

  // Check credentials
  if (!user || !check( user.name, user.pass ))
  {
    res.statusCode = 401
    res.setHeader('WWW-Authenticate', 'Basic realm="NikOFlix - Streaming sans virus"')
    res.end('Access denied')
  } else {
    getStreamDirectory( STREAM_DIR )
    .then(files => {
        // Log des genres
        //console.log(genres)

        // Clean Genres Array
        let cleanGenres = splitGenreArray();

        res.render("list.ejs", {
          data: files,
          genres: cleanGenres,
          url_base: URL_BASE,
          current_dir: CURRENT_DIR
        });
      }
    )
    .catch(e => console.error(e));
  }
});


/**
 * Route /search en GET
 */
app.get('/search', async function (req, res)
{
  const user = auth(req);

  // Check credentials
  if (!user || !check( user.name, user.pass ))
  {
    res.statusCode = 401
    res.setHeader('WWW-Authenticate', 'Basic realm="NicoFlix - Streaming sans virus"')
    res.end('Access denied')
  } else {

    res.render("search.ejs", {
    });
  }
});


/**
 * Route /add en GET
 */
app.get('/add', async function (req, res)
{
  res.render('add.ejs',
  {}
  );
}
);


// ************************************************************



//   _                                              _         _
//  | |    __ _ _ __   ___ ___ _ __ ___   ___ _ __ | |_    __| |_   _   ___  ___ _ ____   _____ _   _ _ __
//  | |   / _` | '_ \ / __/ _ \ '_ ` _ \ / _ \ '_ \| __|  / _` | | | | / __|/ _ \ '__\ \ / / _ \ | | | '__|
//  | |__| (_| | | | | (_|  __/ | | | | |  __/ | | | |_  | (_| | |_| | \__ \  __/ |   \ V /  __/ |_| | |
//  |_____\__,_|_| |_|\___\___|_| |_| |_|\___|_| |_|\__|  \__,_|\__,_| |___/\___|_|    \_/ \___|\__,_|_|
app.listen(4000, function ()
{
  figlet('NikOFliX', function(err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    console.log(data);

    console.log("Application Streaming écoutant sur le port 4000!");

    // Récupération IP
    let ip = require("ip");

    console.log("http://" + ip.address() + ":4000");
  });
});



//   ____    _____    ____   _   _   ____    ___   _____   _____
//  / ___|  | ____|  / ___| | | | | |  _ \  |_ _| |_   _| | ____|
//  \___ \  |  _|   | |     | | | | | |_) |  | |    | |   |  _|
//   ___) | | |___  | |___  | |_| | |  _ <   | |    | |   | |___
//  |____/  |_____|  \____|  \___/  |_| \_\ |___|   |_|   |_____|

/**
 * Fonction pour valider l'authentification via HTTP Basic
 *
 * @param name
 * @param pass
 * @returns {boolean}
 */
function check (name, pass) {
  var valid = true

  // Simple method to prevent short-circut and use timing-safe compare
  //valid = ((name == 'nicoflix' || name == 'NellY') && valid) ? true: false;

  return valid
}

/**
 * PArcours du dossier contenant les films
 * @param directory
 * @returns {Promise<Awaited<unknown>[]>}
 */
async function getStreamDirectory( directory )
{
  // https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
  const extension = [ ".mkv", ".avi" ];

  const subdirs = await readdir(directory);
  const files = await Promise.all(
    subdirs.map(
      async (subdir) =>
      {
        const res = resolve(directory, subdir);

        // Pour le récursif
        //return (await stat(res)).isDirectory() ? getStreamDirectory(res) : res;

        if ( !(await stat(res)).isDirectory() && extension.includes( path.parse(res).ext ) )
        {
          let tempMovie = [];

          await getMovieInfoByTitle( res ).then(
            async function (data) {

              // Test des résultats omdb
              if ( data.Response == "False" )
              {
                //console.log ("getById");
                await getMovieInfoById( res ).then(
                  function (data) {
                    let output = { title: data.Title, file: res, omdb: data };

                    // Store the fullPath of the file/directory in our custom array
                    tempMovie.push(
                      output
                    );
                  }
                ).catch( (err) => console.log("error" + err));

              }else{
                let output = { title: data.Title, file: res, omdb: data };

                // Store the fullPath of the file/directory in our custom array
                tempMovie.push(
                  output
                );

                // Ajout des genres
                genres.push(
                  data.Genre
                );
              }

            }
          ).catch( (err) => console.log("error" + err));

          return tempMovie;
        }
      }
    )
  );

  // Clean undefined and empty cells
  var cleanFiles = files.filter(function(el) { return el; });

  // Sort Alphabetically
  cleanFiles.sort( sortAlphabeticallyMovies );

  return cleanFiles;
}

/**
 * A partir du nom du fichier (IMDB_ID), on récupère le film via l'API de OMDB
 *
 * @param res
 * @returns {Promise<*>}
 */
async function getMovieInfoByTitle ( res )
{
  // Titre issu du fichier
  let condensedTitle = path.parse(res).name;
  // Recréation du vrai titre en explosant le titre condensé
  let title = condensedTitle.replace(/([A-Z])/g, ' $1').trim();

  const API_KEY_OMDB = process.env.API_KEY_OMDB;

  // Requete HTTP
  let response = await fetch(
      'http://www.omdbapi.com/?apikey=' + API_KEY_OMDB + '&t=' + title
      ,
      {
          mode: 'no-cors', // no-cors, *cors, same
          credentials: 'omit', // include, *same-origin, omit
      }
  );

  //console.log("Fetch" + title);
  let datas = await response.json();

  return await datas;
}

/**
 * A partir du nom du fichier (IMDB_ID), on récupère le film via l'API de OMDB
 *
 * @param res
 * @returns {Promise<*>}
 */
async function getMovieInfoById ( res )
{
  // Titre issu du fichier
  let imdbID = path.parse(res).name;

  const API_KEY_OMDB = process.env.API_KEY_OMDB;

  // Requete HTTP
  let response = await fetch(
      'http://www.omdbapi.com/?apikey=' + API_KEY_OMDB + '&i=' + imdbID
      ,
      {
          mode: 'no-cors', // no-cors, *cors, same
          credentials: 'omit', // include, *same-origin, omit
      }
  );

  let datas = await response.json();

  return await datas;
}


function sortAlphabeticallyMovies(a, b){
  if(a[0].title < b[0].title) { return -1; }
  if(a[0].title > b[0].title) { return 1; }
  return 0;
}
function sortAlphabetically(a, b){
  if(a < b) { return -1; }
  if(a > b) { return 1; }
  return 0;
}

function cleanArray(array) {
  var i, j, len = array.length, out = [], obj = {};
  for (i = 0; i < len; i++) {
    obj[array[i]] = 0;
  }
  for (j in obj) {
    out.push(j);
  }
  return out;
}

function splitGenreArray()
{
  var newGenres = [];
  genres.forEach(function(item){

    console.log (item);

    item.split(', ').forEach( function(ssitem){
      newGenres.push( ssitem );
    });
  });

  // Supprime les doublons
  newGenres = cleanArray(newGenres);

  // Sort Alphabetically
  newGenres.sort( sortAlphabetically );

  return newGenres;
}
