const playlistIntro = "#EXTM3U"

/**
 * Modifie le contenu du fichier M3U
 * @param url
 * @param titre
 */
function updatePlaylistContent ( url, titre )
{
  const playlistTextarea = document.getElementById('playlistSource');
  const url_base = document.getElementById("url_base").textContent;
  
  let URL_THUMBNAIL = url_base + ":4000/img/logo.png";
  let TITLE = titre;
  let URL_VIDEO = url;

  let playlistEntryTemplate = '#EXTINF:0 tvg-logo="' + URL_THUMBNAIL + '", ' + TITLE + '\n' + URL_VIDEO

  let textareaContent = playlistIntro
  textareaContent += "\n"
  textareaContent += playlistEntryTemplate

  // Replace retour chariot
  textareaContent = textareaContent.replace(/\\n/g, String.fromCharCode(13, 10) )

  playlistTextarea.innerHTML = textareaContent;

  // Lien vers le bas de page
  window.scrollTo(0,document.body.scrollHeight);
}


function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:audio/x-mpequrl;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

// Start file download.
function downloadPlaylist(){
  // Generate download of hello.txt file with some content
  const text = document.getElementById("playlistSource").value;
  const filename = "NikOFliX.m3u";
  
  download(filename, text);
}

// **************************************
// Gestion des boutons de films
const movieBtnHandler = function(e) 
{
  const url = e.target.getAttribute("data-url");
  const title = e.target.getAttribute("data-title");

  // Fonction de filtre
  updatePlaylistContent( url, title );
}

var movieButtons = document.getElementsByClassName('movieBtn');
Array.from(movieButtons).forEach( function (item)
{
  item.addEventListener('touchstart', movieBtnHandler);
  item.addEventListener('click', movieBtnHandler);
});

// **************************************
// Gestion de la recherche et des filtres
const inputHandler = function(e) 
{
  var query = e.target.value;

  // Fonction de filtre
  filter (query)

  console.log ("Recherche de " + query);
}
document.getElementById('query').addEventListener('input', inputHandler);

const genreHandler = function(e) {
  var genre = e.target.value;
  var checked = e.target.checked;

  // Fonction de filtre
  toggle (genre);

  console.log ("Toggle de " + genre);
}
var genres = document.getElementsByClassName('genres');
Array.from(genres).forEach( function (item){
  item.addEventListener('input', genreHandler);
});

//filter results based on query
function toggle(genre) {
  genre =   $.trim(genre); //trim white space
  genre = genre.replace(/ /gi, '|'); //add OR for regex query

  var selector = $(".badge");

  // Efface tout
  $(this).parent().parent().hide().removeClass('visible');

  // Récupère tous les genres cochés
  //var genresCoches = [];
  Array.from(document.getElementsByClassName('genres')).forEach( function (item){
    if (item.checked){
      //genresCoches.push(item.value);
      $(selector).each(function() {
        ($(this).text().search(new RegExp(item.value, "i")) < 0) ? $(this).parent().parent().hide().removeClass('visible') : $(this).parent().parent().show().addClass('visible');
      });
    }
  });
 
  /*$(selector).each(function() {
    ($(this).text().search(new RegExp(genre, "i")) < 0) ? $(this).parent().parent().hide().removeClass('visible') : $(this).parent().parent().show().addClass('visible');
  });*/
}

//filter results based on query
function filter(query) {
  query =   $.trim(query); //trim white space
  query = query.replace(/ /gi, '|'); //add OR for regex query

  var selector = $(".card-title");
 
  $(selector).each(function() {
    ($(this).text().search(new RegExp(query, "i")) < 0) ? $(this).parent().parent().hide().removeClass('visible') : $(this).parent().parent().show().addClass('visible');
  });
}