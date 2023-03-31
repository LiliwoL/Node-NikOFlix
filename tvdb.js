const fetch = require('node-fetch');
require('dotenv').config()

async function queryBytTVDB()
{
    // Chargement de la clé API depuis .env
    const API_KEY = process.env.API_KEY;

    //let url = "https://api.themoviedb.org/3/find/";
    let url = "https://api.themoviedb.org/3/search/movie";
    //let query = "tt9460858";
    let query = "&query=Sept+vies";
    //let urlParams = "?api_key=" + API_KEY + "&language=fr-FR&external_source=imdb_id"
    let urlParams = "?api_key=" + API_KEY + "&language=fr-FR";

    let options = {
        //method: 'POST',
        //body: JSON.stringify(authentication),
        //headers: {
        //    'Content-Type': 'application/json'
        //},
        mode: 'no-cors', // no-cors, *cors, same
        credentials: 'omit', // include, *same-origin, omit
    }

    // Construction de l'url
    //let queryUrl = url + query + urlParams;
    let queryUrl = url + urlParams + query;

    let response = await fetch(
        queryUrl,
        options
    );
    
    //console.log("Fetch" + title);
    let datas = await response.json();
    console.log(datas);
}
queryBytTVDB();