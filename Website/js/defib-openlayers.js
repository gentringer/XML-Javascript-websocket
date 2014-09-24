
var map;
var epsg4326 ;
var epsg900913;
var style_green;
var vectorLayerJSON ;
var pointnavigate;
var localx;
var localy;      
var directionsDisplay;
var directionsService;
var mapgoogle;
var selectedPath;
var vectorDirection;
var pointsArray = [];
var pixxx;
var pixxy;
var newlonlat;
var lastadresse;
var myStore;
var attributestore;
var xstore;
var ystore;
var lieustore;
var inavigate;


var popupgeoext;
function createPopup(feature) {
    popup = new GeoExt.Popup({
	title: "Défibrilateur",
	location: feature,
	width:300,
	html: "Lieu : " + feature.attributes.lieu + "<br/>" + "Adresse : "+  feature.attributes.adresse + "<br/>" + "x : "+ feature.attributes.x + "<br/>"+ "y : "+ feature.attributes.y + "<br/>",
	maximizable: false,
	collapsible: false,
	panIn:false
    });
    popup.show();
}

function gestionFond() {
    document.getElementById("frontlayer").style.visibility = "hidden";

    //Vecteur dans lequel seront stockés les points récupérés à partir du fichier json
    vectorLayerJSON = new OpenLayers.Layer.Vector("JSON Vector", {
	isBaseLayer : false,

    });
   
    

    inavigate = 0;
    vectorLayer = new OpenLayers.Layer.Vector("Itinéaire",{
	isBaseLayer:false, style: {
            strokeColor: "blue",
            strokeWidth: 3,
            cursor: "pointer"
        }});
    
    

    pointnavigate = new OpenLayers.Layer.Vector("Points",{
	isBaseLayer:false});
    // Style pour géolocalisation
    var stylelocate = {
	fillColor: '#000',
	fillOpacity: 0.1,
	strokeWidth: 0
    };

    var options = {
	controls: [],
	hover: false,
	projection: epsg900913,
	displayProjection: epsg4326,
	units : "m",
	extent: [-5, 35, 15, 55],
	maxResolution: 156543.0339,
	maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508.34)
    };

    epsg4326 = new OpenLayers.Projection('EPSG:4326');
    epsg900913 = new OpenLayers.Projection('EPSG:900913');

    //Style pour la carte
    var style = new OpenLayers.StyleMap({ 
	'default': {
            externalGraphic:'imae.jpg',
            graphicHeight: 32,
            graphicWidth: 32,
            graphicXOffset: -16,
            graphicYOffset: -32,
            fillOpacity: 0.75
	}
    });

    // Syle point vert
    style_green = {
        strokeColor: "#00FF00",
        strokeWidth: 3,
        pointRadius: 12,
        pointerEvents: "visiblePainted",
	externalGraphic: "defib.jpg"
    };


    // Création de la carte
    map = new OpenLayers.Map('', options);

    //----------------------------------------------------------------- Géolocalisation-------------------

    var vector = new OpenLayers.Layer.Vector('vector');

    map.addLayer(vector);
    map.addLayer(vectorLayer);
    map.addLayer(vectorLayerJSON);

    // Animation géolocatilation
    var pulsate = function(feature) {
	var point = feature.geometry.getCentroid(),
        bounds = feature.geometry.getBounds(),
        radius = Math.abs((bounds.right - bounds.left)/2),
        count = 0,
        grow = 'up';

	var resize = function(){
            if (count>16) {
		clearInterval(window.resizeInterval);
            }
            var interval = radius * 0.03;
            var ratio = interval/radius;
            switch(count) {
            case 4:
            case 12:
                grow = 'down'; break;
            case 8:
                grow = 'up'; break;
            }
            if (grow!=='up') {
		ratio = - Math.abs(ratio);
            }
            feature.geometry.resize(1+ratio, point);
            vector.drawFeature(feature);
            count++;
	};
	window.resizeInterval = window.setInterval(resize, 50, point, radius);
    };

    var geolocate = new OpenLayers.Control.Geolocate({
	bind: false,
	geolocationOptions: {
            enableHighAccuracy: false,
            maximumAge: 0,
            timeout: 7000
	}
    });
    map.addControl(geolocate);

    var circle;
    var firstGeolocation = true;
    geolocate.events.register("locationupdated",geolocate,function(e) {
	vector.removeAllFeatures();
	localx = e.position.coords.longitude;
	localy = e.position.coords.latitude;
	circle = new OpenLayers.Feature.Vector(
            OpenLayers.Geometry.Polygon.createRegularPolygon(
		new OpenLayers.Geometry.Point(e.point.x, e.point.y),
		e.position.coords.accuracy/2,
		40,
		0
            ),
            {},
            stylelocate
	);
	vector.addFeatures([
            new OpenLayers.Feature.Vector(
		e.point,
		{},
		{
                    graphicName: 'cross',
                    strokeColor: '#f00',
                    strokeWidth: 2,
                    fillOpacity: 0,
                    pointRadius: 10
		}
            ),
            circle
	]);
	
    });
    geolocate.events.register("locationfailed",this,function() {
	alert('Location detection failed');
    });
    geolocate.activate();


    //----------------------------------------------------------------- Layers Google et OSM +  Controles-------------------

    var osmLayer = new OpenLayers.Layer.OSM();
    var gmap = new OpenLayers.Layer.Google("Google Streets", {visibility: false});
    var gsat = new OpenLayers.Layer.Google(
	"Google Satellite",
	{type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 22,
	 sphericalMercator: true}
    );
    
    
    var gphy = new OpenLayers.Layer.Google(
	"Google Physical",
	{type: google.maps.MapTypeId.TERRAIN}
    );
    
    var ghyb = new OpenLayers.Layer.Google(
	"Google Hybrid",
	{type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20}
	// used to be {type: G_HYBRID_MAP, numZoomLevels: 20}
    );
    

    map.addLayers([gphy,osmLayer, gmap, gsat,ghyb]);
    map.addControl(new OpenLayers.Control.MousePosition({displayProjection: epsg4326})); //affichage localisation de la souris
    var mapBounds = new OpenLayers.Bounds(3.77,43.65,3.97,43.62).transform(epsg4326,epsg900913);

    map.zoomToMaxExtent();

    map.addControl(new OpenLayers.Control.Navigation());
    map.addControl(new OpenLayers.Control.PanZoomBar({zoomWorldIcon: true}));
    map.addControl(new OpenLayers.Control.OverviewMap({autoPan : true}));
    map.addControl(new OpenLayers.Control.KeyboardDefaults()); //se déplacer avec le clavier
    map.addControl(new OpenLayers.Control.ScaleLine()); //barre d'échelle
    map.addControl(new OpenLayers.Control.LayerSwitcher());

    //------------------------------------------ Geoext -------------------

    var mapPanel = new GeoExt.MapPanel({
	map: map,
	region : 'center',
	height: '800',
	width: '600',
	title: 'Défibrilateurs Montpellier',
	collapsible: false,
	border: true,
	extent: mapBounds
    });

    var treeConfig = new OpenLayers.Format.JSON().write([
        {
            nodeType    : 'gx_baselayercontainer',
            text        : 'Fonds de cartes'
            ,expanded   : false
            ,allowDrag  : false
            ,allowDrop  : false
            ,draggable  : false
        }, {
            text        : 'Points'
            ,allowDrag  : true
            ,allowDrop  : true
            ,draggable  : true
            ,icon       : 'defib.jpg'
            ,expanded   : false
            ,children   : [
                {
                    nodeType    : 'gx_layer'
                    ,draggable  : true
                    ,layer      : 'JSON Vector'
                    ,qtip       : "Défibrilateurs"
            	    ,icon       : 'defib.jpg'
                }           
            ]
        }
    ], true);

    var layerTree = new Ext.tree.TreePanel({
        title       : "Layers"
        ,root: {
            nodeType    : "async"
            ,expanded   : true
            ,children   : Ext.decode(treeConfig)
        }
        ,loader: new Ext.tree.TreeLoader({
            applyLoader: false
        })
        ,animate    : true
        ,enableDD   : true
        ,useArrows  : true        
        ,rootVisible: false
    });

    var accordion = new Ext.Panel({
        margins : '5 0 5 5'
        ,split  : true
        ,width  : 160
        ,layout :'accordion'
        ,items  : [layerTree]
    });  
    
    var eastPanel = new Ext.Panel({  
	title   : 'Légende et données'      
        ,region : 'east'
        , collapsible : 'true'
        ,layout : 'fit'
        ,width  : 220   
        ,items  : [accordion]
    });
    
    var readerr = new Ext.data.JsonReader({   
	type:'json'
	
    });

    myStore = new Ext.data.JsonStore({
	url: './xml/objets.json',
	autoLoad: true,
	reader: readerr,
	fields: [{name: 'lieu',   type: 'string'},
		 {name: 'x',  type: 'string'},
		 {name:'y', type:'string'}
		]
    });

    lieustore = new Ext.data.JsonStore({
	url: './xml/objets.json',
	autoLoad: true,
	reader: readerr,
	fields: [
	    {name: 'lieu',  type: 'string'}
	    
	]
    });

    xstore = new Ext.data.JsonStore({
	url: './xml/objets.json',
	autoLoad: true,
	reader: readerr,
	fields: [
	    {name: 'x',  type: 'string'}
	    
	]
    });

    ystore = new Ext.data.JsonStore({
	url: './xml/objets.json',
	autoLoad: true,
	reader: readerr,
	fields: [
	    {name: 'y',  type: 'string'}
	    
	]
    });
    
    attributestore = new Ext.data.JsonStore({
	url: './xml/objets.json',
	autoLoad: true,
	reader: readerr,
	fields: [
	    {name: 'adresse',  type: 'string'},
	    {name:'lieu', type:'string'}
	    
	]
    });

    var grid = new Ext.grid.GridPanel({
	id: 'gridPanel',
	title     : 'Grid example',
	width     : 250,
	height    : 250,
	store     : myStore,
	columns: [
	    {    header: 'lieu',
		 dataIndex: 'lieu'
	    },
	    {
		header: 'x',
		dataIndex: 'x'
	    },
	    {
		header: 'y',
		dataIndex: 'y'
	    }
	]          
    });    

    var promosCombo = new Ext.form.ComboBox({
	id : 'promosCombo',
	fieldLabel : "Promotion",
	triggerAction : 'all',
	emptyText : "Choisir défibrillateur",
	editable : false,
	store : myStore,
	mode : 'local',
	valueField : 'lieu',
	displayField : 'lieu'
    });

    /*
      var jsonArray = myStore.data.items;

      var xxx = jsonArray[1].data.text;
      var yyy = jsonArray[2].data.text;
    */

    var submitButton = new Ext.Button({
	
	
	text : 'Ininéraire vers point',
	handler : function() {
	    inavigate += 1;
	    map.removeLayer(vectorLayer);
	    
	    vectorLayer = new OpenLayers.Layer.Vector("Itinéaire",{
		isBaseLayer:false, style: {
                    strokeColor: "blue",
                    strokeWidth: 3,
                    cursor: "pointer"
		}});
	    
	    map.addLayer(vectorLayer);
	    
	    var frontl = document.getElementById("frontlayer");
	    inavigate2 = inavigate-1;
	    
	    var patthhii = "path"+inavigate2.toString();
	    var sun = document.getElementById(patthhii); /* Récupère l'élément du document dont l'id est 'anim' */
	    var sunanim = document.getElementById("anim"); /* Récupère l'élément du document dont l'id est 'anim' */
	    
	    if (sun != null && sun.firstChild) {
		//alert("supprim");
		//sun.removeChild(sun.firstChild);
		var pattii = "anim"+inavigate2.toString();
		removeElement(pattii);
		
	    }
	    
	    
	    
	    
	    
	    var popuprec = document.getElementById("rec");
	    var elip = document.getElementById("elipse");
	    var texxt = document.getElementById("texxt");
	    
	    
	    if(texxt != null && elip != null && popuprec != null){
		var patthhii = "path"+inavigate2.toString();
		removeElement(patthhii);
		removeElement("texxt");
		removeElement("elipse");
		removeElement("rec");
		
	    }

	    initialize();
	    
            pulsate(circle);
            this.bind = true;
	    
	    var localxy = [];
	    localxy.push(localy);
	    localxy.push(localx);
	    
	    var localxywicked = new google.maps.LatLng(localy, localx);
	    //alert(localy);
	    //alert(localx);    

	    var locxy = [];
	    var datar = [];
	    var datary = [];
	    var datarlieux = [];
	    var datarattributs = [];
            var jsonDataEncode = "";
	    var transformmm;
	    var transformmy;
	    var transformlieux;
	    var transformattributs;
            var records = xstore.getRange();
	    var recordsy = ystore.getRange();
	    var recordslieu = lieustore.getRange();
	    var recordsattributs = attributestore.getRange();
	    
	    var datasetId = Ext.getCmp('promosCombo').getValue();

            for (var i = 0; i < records.length; i++) {
		transformmm = Ext.util.JSON.encode(records[i].data);
		transformmy = Ext.util.JSON.encode(recordsy[i].data);
		transformlieux = Ext.util.JSON.encode(recordslieu[i].data);
		transformattributs = Ext.util.JSON.encode(recordsattributs[i].data);
		transformattributslieu = Ext.util.JSON.encode(recordsattributs[i].data.lieu);
		
		if(JSON.parse(transformattributslieu) == datasetId.toString()){
		    //alert(transformattributs);	
		    datarattributs.push(transformattributs);
		}

		datar.push(transformmm);
		datary.push(transformmy);
		datarlieux.push(transformlieux);
		
            }
	    var trans = "";
	    var transy = "";
	    var transformlieux = "";
	    var transformattributs ="";
	    var tab = [];
	    var taby = [];
	    var tablieux = [];
	    var tabattributs = [];
	    transformattributs = "";
	    
	    for(var i =0; i<datarattributs.length;i++){
		transformattributs += datarattributs[i];
	    }
	    lastadresse = ((JSON.parse(transformattributs)).adresse);
	    for(var i = 0; i<datar.length;i++)
	    {
		trans = "";
		transy = "";
		transformlieux = "";
		for(var ii = 0; ii< datar[i].length;ii++){     
		    if(datar[i][ii] != 'x' && datar[i][ii] != ':' && datar[i][ii] != '"' && datar[i][ii] != '{'&& datar[i][ii] != '}'){
			trans += datar[i][ii];
		    }
		    
		    
		}
		for(var ii = 0; ii< datary[i].length;ii++){
		    if(datary[i][ii] != 'y' && datary[i][ii] != ':' && datary[i][ii] != '"' && datary[i][ii] != '{'&& datary[i][ii] != '}'){
			transy += datary[i][ii];
		    }
		}
		
		for(var ii = 6; ii< datarlieux[i].length;ii++){  
		    if(datarlieux[i][ii] != 'lieu' && datarlieux[i][ii] != ':' && datarlieux[i][ii] != '"' && datarlieux[i][ii] != '{'&& datarlieux[i][ii] != '}'){
			transformlieux += datarlieux[i][ii];
		    }
		}
		tab.push(trans);
		taby.push(transy);
		tablieux.push(transformlieux);
	    }

	    var navigate = [];
	    
	    for(var verif = 0;verif<tab.length;verif++){
		//alert( tablieux[verif]);
		if(datasetId == tablieux[verif]){
		    navigate.push(taby[verif]);	
		    navigate.push(tab[verif]);
		    var wickedLocation = new google.maps.LatLng(taby[verif], tab[verif]);
		    newlonlat = new OpenLayers.LonLat(tab[verif],taby[verif]).transform(epsg4326, epsg900913);
		    


		}
	    }
	    

	    calcRoute(localxywicked,wickedLocation);


	}
    });

    var svgbutton = new Ext.Button({
	text : 'Désactiver SVG',
	handler : function() {
	    
	    desactivesvg();
	}
    });

    var southPanel = new Ext.Panel({
	title : 'Itinéaire vers défibrillateur',
	region : 'south',
	layout : 'fit',
	collapsible: true,
	width : '100%',
	height : 100,
	items : [promosCombo, submitButton, svgbutton]
    });

    new Ext.Viewport({
	layout: "border",
	defaults: {
	    split: true
	},
	items: [
	    mapPanel,
	    eastPanel,
	    southPanel
	]
    });
}

///////////////////////////////////////////////////////////itineaire

function initialize() {
    
    document.getElementById("frontlayer").style.visibility = "visible";

    directionsService = new google.maps.DirectionsService();
    vectorDirection = new OpenLayers.Layer.Vector("Vector Layer");
    var style_green = {strokeColor: "#00FF00", strokeOpacity: 1, strokeWidth: 6}; 
    var points = [];
    

    directionsDisplay = new google.maps.DirectionsRenderer();
    
    mapgoogle = new google.maps.Map(document.getElementById('map_canvas'));
    directionsDisplay.setMap(mapgoogle);
}

function calcRoute(start,end) {
    var lineLayer = new OpenLayers.Layer.Vector("Line Layer"); 
    //map.addLayer(lineLayer);

    
    var request = {
        origin:start,
        destination:end,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    };
    directionsService.route (request, function (result, status) 
			     {
				 if (status == google.maps.DirectionsStatus.OK)
				 {
				     directionsDisplay.setDirections (result);
				     pointsArray = result.routes[0].overview_path;

				     var i = 0;
				     var j = 0;
				     var points = [];
				     var vec;
				     
				     var pixels = [];

				     for (j = 0; j < pointsArray.length; j++)
				     {
					 point =  new OpenLayers.Geometry.Point(pointsArray[j].lng(),pointsArray[j].lat()).transform(epsg4326, epsg900913);
					 points.push(point);		 
					 var pointFeature = new OpenLayers.Feature.Vector(point);
					 pointnavigate.addFeatures([pointFeature]);					 
					 var lineString = new OpenLayers.Geometry.LineString(points); 
					 var lineFeature = new OpenLayers.Feature.Vector(lineString, null, style_green); 
					 vectorLayer.addFeatures([lineFeature]); 
					 
				     }
				     
				     map.zoomToExtent(vectorLayer.getDataExtent());
				     
				     for (var ij = 0; ij < pointsArray.length; ij++)
				     {
					 var center_lonlat = new OpenLayers.LonLat(pointsArray[ij].lng(),pointsArray[ij].lat()).transform(epsg4326, epsg900913);					 
					 var center_px = map.getViewPortPxFromLonLat(center_lonlat);
					 pixels.push(center_px);
					 
				     }
				     transformm(pixels);
				 } 
			     });
} 

function transformm(pixel){
    var tabpixel = [];
    var string="";
    var px0 = pixel[0];
    var pxx0 = px0.toString();
    var regxt0 = pxx0.replace("x=","M");
    var regxtt0 = regxt0.replace(",y=",",");
    string += regxtt0;
    string +=" ";
    /* var lastpixel = pixel[pixel.length-1].toString();
       lastpixel = lastpixel.replace("x=","M");
       lastpixel = lastpixel.replace(",y=",",");*/
    var lastpixel = "";
    var pixx = map.getViewPortPxFromLonLat(newlonlat);
    pixxx = pixx.x;
    pixxy = pixx.y;
    var lastpixelx = pixxx;
    var lastpixely = pixxy;
    
    
    var l1x = lastpixelx-3;
    var l1y = lastpixely-30;
    
    var l2x = lastpixelx+27;
    var l2y = lastpixely-15;
    
    lastpixel += "M";
    lastpixel += lastpixelx;
    lastpixel += ",";
    lastpixel += lastpixely;
    
    lastpixel += " L";
    lastpixel += l1x;
    lastpixel += ",";
    lastpixel += l1y;
    
    lastpixel += " L";
    lastpixel += l1x;
    lastpixel += ",";
    lastpixel += l1y;
    
    lastpixel += " L";
    lastpixel += l2x;
    lastpixel += ",";
    lastpixel += l2y;
    
    lastpixel += " L";
    lastpixel += lastpixelx;
    lastpixel += " ";
    lastpixel += lastpixely;
    //M 70 140 L 67 110 L 97 125 L 70 140
    
    for(var i = 1;i<pixel.length;i++){
	var px = pixel[i];
	var pxx = px.toString();
	var regxt = pxx.replace("x=","L");
	var regxtt = regxt.replace(",y=",",");
	
	string += regxtt;
	string +=" ";
	
    }    
    svgpath(string, lastpixel);  
}


function svgpath(string, lastpixel) {
    // alert(string);
    
    var svgNS = "http://www.w3.org/2000/svg";
    var front = document.getElementById("frontlayer");
    var patt = document.createElementNS(svgNS, "animateMotion");

    //     var patt = document.createElement("animateMotion");  
    var pattii = "anim"+inavigate.toString();
    patt.setAttribute("id",pattii);
    
    var sun = document.createElementNS(svgNS,"image"); /* Récupère l'élément du document dont l'id est 'anim' */
    //var sunanim = document.getElementById("anim"); /* Récupère l'élément du document dont l'id est 'anim' */
  
    var popuprec = document.createElementNS(svgNS,"path");
    var elip = document.createElementNS(svgNS,"ellipse");
    var texxt = document.createElementNS(svgNS,"text");
    
    var animrec = document.getElementById("animrec");
    var animelipse = document.getElementById("animelipse");
    var animtext = document.getElementById("animtext");
    var pattiiend = pattii+".end";
    animrec.setAttribute("begin",pattiiend);
    animtext.setAttribute("begin",pattiiend);
    animelipse.setAttribute("begin",pattiiend);
    
    
    texxt.setAttribute("id","texxt");
    texxt.setAttribute("x",pixxx+144);
    texxt.setAttribute("y",pixxy-50);
    texxt.setAttribute("font-family","Arial");
    texxt.setAttribute("font-size","12");
    texxt.setAttribute("fill","black");
    texxt.textContent = lastadresse.toString();
    texxt.setAttribute("style","text-anchor: middle;visibility:hidden");

    elip.setAttribute("id","elipse");
    elip.setAttribute("cx", pixxx+144);
    elip.setAttribute("cy", pixxy-50);
    elip.setAttribute("rx", 160);
    elip.setAttribute("ry", 50);
    elip.setAttribute("style","fill:white;stroke:black;stroke-width:2;visibility:hidden");
    
    popuprec.setAttribute("id","rec");
    popuprec.setAttribute("d",lastpixel);
    popuprec.setAttribute("style","fill:white;stroke:black;visibility:hidden");


    patt.setAttribute("path",string);
    patt.setAttribute("rotate", "auto");
    patt.setAttribute("dur", "20s");
    patt.setAttribute("fill", "freeze");
    //     patt.setAttribute("end","15s");
    //   patt.setAttribute("repeatCount","indefinite");
    patt.setAttribute("begin","5s");
    


    var sunii = "path"+inavigate.toString();
    sun.setAttribute("id",sunii);
    sun.setAttribute("x",-20);
    sun.setAttribute("y",-20);
    sun.setAttribute("width",50);
    sun.setAttribute("height",50);
    var xlinkns = "http://www.w3.org/1999/xlink";

    sun.setAttributeNS(xlinkns, 'xlink:href', "car.png");


    front.appendChild(sun);
    front.appendChild(elip);
    front.appendChild(popuprec);
    front.appendChild(texxt);
    sun.appendChild(patt);
    
    
    
}

function desactivesvg(){
    
    document.getElementById("frontlayer").style.visibility = "hidden";
    var hiderec = document.getElementById("animrec");
    var hideelip = document.getElementById("animelipse");
    var hidetexxt = document.getElementById("animtext");
    
    hiderec.setAttribute("to","hidden");
    hideelip.setAttribute("to","hidden");
    hidetexxt.setAttribute("to","hidden");

}


function removeElement(id) {
    var element = document.getElementById(id);
    element.parentNode.removeChild(element);
}

