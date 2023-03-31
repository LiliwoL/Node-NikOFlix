// Exemple adapté de la mise en route d'Express :
// http://expressjs.com/fr/starter/hello-world.html

const express = require('express');
const figlet = require('figlet');
const helmet = require('helmet');

var auth = require('basic-auth');

const path = require('path');

const { promisify } = require('util');
const { resolve } = require('path');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const fetch = require('node-fetch');

var MatomoTracker = require('matomo-tracker');

// Initialize with your site ID and Matomo URL
var matomo = new MatomoTracker(11, 'https://stats.liliwol.fr/piwik.php');


const app = express();
app.use(require('express-status-monitor')());

const STREAM_DIR = "/var/www/str3aming/";

const genres = [];

// Définition du moteur de template
app.set('view engine', 'ejs');
app.locals.inspect = require('util').inspect;

// Définition du répertoire public
app.use(express.static(__dirname + '/public'));

// Sécurité
app.use(helmet());

//User validation
//https://github.com/jshttp/basic-auth


/**
 * ROUTE /
 */
app.get('/', async function (req, res)
{
  var user = auth(req);

  // Track dans Matomo
  matomo.track({
      url: 'http://nikoflix.istanbulles.fr',
      action_name: 'NikoFlix HomePage'
    }
  );

  // Check credentials
  if (!user || !check( user.name, user.pass ))
  {
    res.statusCode = 401
    res.setHeader('WWW-Authenticate', 'Basic realm="NikoFlix - Streaming sans virus"')
    res.end('Access denied')
  } else {
    getStreamDirectory( STREAM_DIR )
    .then(files => {
        // Log des genres
        //console.log(genres)

        // Clean Genres Array
        cleanGenres = splitGenreArray();

        res.render("list.ejs", {
          data: files,
          genres: cleanGenres
        });
      }
    )
    .catch(e => console.error(e));
  }
});


/**
 * ROUTE /search
 */
app.get('/search', async function (req, res)
{
  var user = auth(req);

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
 * ROUTE /add
 */
app.get('/add', async function (req, res)
{
  res.render('add.ejs',
  {}
  );
}
);

/**
 * Lancement serveur
 */
app.listen(4000, function ()
{
  figlet('NIKOFLIX', function(err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    console.log(data);

    console.log("Application Stremaing écoutant sur le port 4000!");
  });
});


// SECURITE
// Basic function to validate credentials for example
function check (name, pass) {
  var valid = true

  // Simple method to prevent short-circut and use timing-safe compare
  valid = ((name == 'nicoflix' || name == 'NellY') && valid) ? true: false;
  valid = ((pass == 'n1c0fl1X' || pass == 'Y11eN') && valid) ? true : false;

  return valid
}

// https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
async function getStreamDirectory( directory )
{
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

async function getMovieInfoByTitle ( res )
{
  // Titre issu du fichier
  let condensedTitle = path.parse(res).name;
  // Recréation du vrai titre en explosant le titre condensé
  let title = condensedTitle.replace(/([A-Z])/g, ' $1').trim();

  // Requete HTTP
  let response = await fetch(
      'http://www.omdbapi.com/?apikey=185a318e&t=' + title
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

async function getMovieInfoById ( res )
{
  // Titre issu du fichier
  let imdbID = path.parse(res).name;

  // Requete HTTP
  let response = await fetch(
      'http://www.omdbapi.com/?apikey=185a318e&i=' + imdbID
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
