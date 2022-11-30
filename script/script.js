'use strict'

//Här har vi en lyssnare för sökformulär, dvs denna lysnnar efter händelser i sökrutan och anropar funktionen init.
window.addEventListener('load', init);


//Lyssnar efter händelser i sökrutan och anropar funtionen hanteraSokForm
function init(){

    let form = document.querySelector("#search-form");
    form.addEventListener('submit', hanteraSokForm);
    document.querySelector('.content').style.display = 'none';


};

//Tar emot händelseobjektet och skickar värdet vidare till functionen search tillsammans med referensen till en div med klassen .wrapper
function hanteraSokForm(evt){
    evt.preventDefault();

    let searchField = document.querySelector('#search');
    let gridRef = document.querySelector('.wrapper');
    
    search(searchField.value, gridRef)
};

// Vi tar emot två paramaterar som vi använder vidare i sökfunktionen 
function search(query, container){
    
    //Tömmer rutan på gammalt resultat
    container.innerHTML = '';
    //Gömmer div elementet content varje gång vi tycker på search-knappen
    document.querySelector('.content').style.display = 'none';


    //Spotify json data - hämta Json Data och skicka det vidare till funktionen createGridCell som bearbetar datan.
    // Acces token måste bytas varje timme
    var accessToken = 'BQDjnx6mi_6zXga7-6vMUjpkP8DLV3S_7tEG6vF7gHB6kLYVYayuiw6_1ZsPQT_wkQMdetl9Y_v-dLV_5a7gNXKOIvF5sQC4gm0p5Vzf1brOnTTiCpNUqtFRNSiV6fnpIFamwo8yI6H-gIQkpqQLWoP8U8_u7gXJhRwljTmL26OMkcjFGraboO5sXud2gVexgZOQ70xZ5xDH2yLgXkvgEhpqPFp5JQg91M_rnunHvZOTSANwOf-336IRD_AEFhkf07bhzrrOO_7JWub4jne0aH-l';    
    
    
    // vi gör asynkrona anropet till spotifys api och lägger in värdet från sökrutan som vi fick via query 
    // encodeURIComponent ersätter alla specialtecken med det som man får använda i URL (%20 tex)
    window.fetch('https://api.spotify.com/v1/search?limit=50&q=' + encodeURIComponent(query) + '&type=track', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            }
        })
        // Ifall allt är ok så tar vi emot ett response och returnerar (plockar ut det vi behöver) json data.
    .then((response)=>{
        return response.json();
    }) // Om vi lyckats att plocka upp json delen kör vi data från den biten vi plockade ut förr.
    .then((data)=>{
        let dataRef = Object.values(data);
        // Vi loopar igenom resultatet och skickar iväg objekten vidare med createGridCell funktionen.
        for(let musicData of dataRef){
            console.log(musicData);
            createGridCell(musicData, container);
       
        };
    });
};

// i denna funktion skapar vi en grid med resultat som vi fick ifrån json data från Spotify.
function createGridCell(musicData, container){
    
    //Gömmer resultat och visar info om låten med en preview och låttexten
    //Gömmer stängknappen

    //Responsive beroende på storleken om det blir grid eller block. Inspiration hittad hos W3 Schools
    if (window.matchMedia("(max-width: 800px)").matches) {
        document.querySelector('.wrapper').style.display = 'block';
      } else {
        document.querySelector('.wrapper').style.display = 'grid';
      }

    document.querySelector('.content').style.display = 'none';
    document.querySelector('#closeBtn').style.display = 'none';
    //Skapar refens till stängknappen
    var closeBtn = document.querySelector('#closeBtn');
    
    //Här loopar vi igenom resulatet och presenterar det till användaren
    for(let i= 0; i < musicData.items.length; i++) {
        
        // Skapa en div element som vi sen fyller med info från sökfältet.
        // Ger div-en en class cell och en bakgrund som motsvarar låtens album.
        let cellRef = document.createElement('div');
        cellRef.setAttribute('class', 'cell');
        cellRef.setAttribute('style', 'background-image: url(' + '"' + musicData.items[i].album.images[0].url + '"); background-size: cover;');
        
        //skapar referenser till Artistnamn, låtnamn etc (DOM)
        let artistRef = document.createElement('h2');
        let nameRef = document.createElement('h5');
        let previewRef = document.createElement('div');

        //Tilldelal data ifrån json
        let songName = musicData.items[i].name;
        let artistName = musicData.items[i].artists[0].name;
        let previewUrl = musicData.items[i].preview_url;
        let imageCover = musicData.items[i].album.images[1].url;

        
        // Ett objekt by ref som jag skickar vidare till låtsidan med lyrics
        let infoData = {

            songname: songName,
            artistname: artistName,
            previewurl: previewUrl,
            imagecover: imageCover
        };


        nameRef.textContent = songName;
        artistRef.textContent = artistName;
        previewRef.innerHTML = "<iframe src=" + previewUrl + "></iframe>";
        
        //Lägger elemeterna i respektive objekt i DOM-en
        container.appendChild(cellRef);
        cellRef.appendChild(artistRef);
        cellRef.appendChild(nameRef);

       
        // Här kopplar vi en ruta med låtinfo med respektive låtinfo sida (eller snarare sagt en popup(som inte poppar upp:))).
        //
        cellRef.addEventListener('click', ()=>{
            //Responsive beroende på storleken om det blir grid eller block. Inspiration hittad hos W3 Schools
            if (window.matchMedia("(max-width: 800px)").matches) {
                document.querySelector('.content').style.display = 'block';
              } else {
                document.querySelector('.content').style.display = 'grid';
              }
            container.style.display = 'none';
            closeBtn.style.display = 'block';
            detailedSongInfo(infoData);
            searchLyrics(infoData);
        })

    };
    // Lysnare efter stängknappen
    closeBtn.addEventListener('click', closePanel);

};


//Denna funktion gömmer rutnätet med resultat och visar låtinfo, preview och låttexten.
// Funktionen tar emot infoData objektet som jag nämnde ovan.
function detailedSongInfo(infoData){
    
    // Lite referenser...
    let contentRef = document.querySelector('.content');
    let cellOneRef = document.createElement('div');
    cellOneRef.setAttribute('class', 'cell-1');
    
    // Lite referenser till... Pretty self explanatory för dom som kan.
    let artistNameRef = document.createElement('h1');
    let songNameRef = document.createElement('h3');
    let previewSongRef = document.createElement('div');
    
    previewSongRef.setAttribute('class', 'no-song-info');
    let imageCoverRef = document.createElement('img');
    
    // Hämtar info och lagrar i variabler
    artistNameRef.textContent = infoData.artistname;
    cellOneRef.appendChild(artistNameRef);
    
    songNameRef.textContent = infoData.songname;
    cellOneRef.appendChild(songNameRef);
    
    imageCoverRef.setAttribute('src', infoData.imagecover);
    cellOneRef.appendChild(imageCoverRef);
    
    
    //Kontrollera om förhandsvisning för låten finns, om inte, skriv ett meddelande till användaren.
    if(infoData.previewurl != null){
        //Tar bort gula bakgrunden ifall ljudklippet finns då de finns en svart bakgrund som jag inte kunde ta bort i iframe-en
        previewSongRef.removeAttribute('class', 'no-song-info');
        previewSongRef.innerHTML = "<iframe src=" + infoData.previewurl + "></iframe>";

    } else {
        previewSongRef.textContent = "Unfortunately we don't have an audio  preview for this song.";
    }   
    
    // Lägger till sista i DOM-en
    cellOneRef.appendChild(previewSongRef);  
    contentRef.appendChild(cellOneRef);
    
    
}
// Stäng låtinfo panelen och går tillbaka till resultatet (gul knapp i högra hörnet)
function closePanel(){
    document.querySelector('.content').style.display = 'none';
    
    //Responsive beroende på storleken om det blir grid eller block. Inspiration hittad hos W3 Schools
    if (window.matchMedia("(max-width: 800px)").matches) {
        document.querySelector('.wrapper').style.display = 'block';
      } else {
        document.querySelector('.wrapper').style.display = 'grid';
      }
    
      document.querySelector('#closeBtn').style.display = 'none';
    document.querySelector('.content').innerHTML = '';
}
    
// Denna använder Spotifys jsDOM för att sen ta emot Artist och Låt som sen läggs in och söker igenom chartlyrics.coms dataset efter dessa
// titlar som är presenterade som XML. Återigen gör vi asynkrona anropet till denna gång chartlyrics.coms api och om allt är ok me respons 
// och promise tar vi emot data från de. Och anropar lyricsData.
function searchLyrics(infoData){
    console.log(infoData);
    // hämta låttexter
    window.fetch('https://cors-anywhere.herokuapp.com/http://api.chartlyrics.com/apiv1.asmx/SearchLyricDirect?artist='+infoData.artistname+'&song='+ infoData.songname)
    .then(response => response.text())
    .then(lyricsData);
    //console.log(lyricsData);
}

 // Här tar vi emot data och placerar i DOM-en tillsammans med data från Spotify. 
function lyricsData(xmlString){
    console.log('Handle funkar');
    
    // Parse data ifrån sträng till DOM 
    let parser = new window.DOMParser();
    let xmlDOM = parser.parseFromString(xmlString, 'application/xml');
    console.log(xmlDOM);


    // Skapa element för att lägga in låttexter
    let contentRef = document.querySelector('.content');
    let cellTwoRef = document.createElement('div');
    let lyricsHeader = document.createElement('h1');
    cellTwoRef.setAttribute('class', 'cell-2');
    let pRef = document.createElement('p');

    let songRef = xmlDOM.querySelector('Lyric');
    let headerRef = xmlDOM.querySelector('LyricSong');

    // Ordnar hierarkin i DOM-en
    contentRef.appendChild(cellTwoRef);
    cellTwoRef.appendChild(lyricsHeader);
    lyricsHeader.appendChild(headerRef);
    cellTwoRef.appendChild(pRef);
    
    // Ifall låttexten inte finns, skriver vi till användaren infå om att det inte finns.
    if(songRef.textContent != '') {
         pRef.appendChild(songRef);
    } 
    else {
        pRef.textContent = 'Lyrics for this song are not available.'
    }
}
