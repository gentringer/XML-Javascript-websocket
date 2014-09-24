var  connexion;
var  points          = new Array();
var  canvasImages    = new Array();
var  contextesImages = new Array();

function addPointsToMap(collection){

    var nbPointsCharges = 0;
    var nbPoints = collection.length;
    

    
    for (var numPoints in collection) {
	var point =  new OpenLayers.Geometry.Point(collection[numPoints].x, collection[numPoints].y).transform(epsg4326, epsg900913);
	var attributes = {adresse: collection[numPoints].adresse, lieu: collection[numPoints].lieu,x: collection[numPoints].x, y: collection[numPoints].y};
	var pointFeature = new OpenLayers.Feature.Vector(point, attributes, style_green);
	vectorLayerJSON.addFeatures([pointFeature]);

    }
    vectorLayerJSON.refresh({force:true});


    map.zoomToExtent(vectorLayerJSON.getDataExtent());
}


function chargement(data) {
    var collection = eval(data);
    // alert(collection);
    addPointsToMap(collection);

}



/*depreciate 
  function chargement() {
  if (connexion.readyState == 4) {
  var collection = eval(connexion.responseText) // renvoie le code json sous format texte
  //alert(connexion.responseText);
  addPointsToMap(collection);

  }
  }



  function chargementJSON(url) {
  if (window.XMLHttpRequest) {
  connexion = new XMLHttpRequest();
  if (connexion != 0) {
  connexion.onload = null;
  // ouvre URL (fichier json)
  connexion.open("GET", url, true);
  connexion.onreadystatechange = chargement;
  connexion.send(null);
  /*some_function(5, 15, function(num) {
  // this anonymous function will run when the
  // callback is called
  alert("callback called! " + num);
  });
  }
  }
  else { alert("Echec sur la connexion !"); } 
  }*/

// define our function with the callback argument
function some_function(arg1, arg2, callback) {
    // this generates a random number between
    // arg1 and arg2
    var my_number = Math.ceil(Math.random() *
			      (arg1 - arg2) + arg2);
    // then we're done, so we'll call the callback and
    // pass our result
    callback(my_number);
}
// call the function


