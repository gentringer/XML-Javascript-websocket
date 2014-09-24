if (document.readyState === "complete"){
    window.addEventListener('keydown', function(e) {
	if (e.keyCode == 27)
	    e.preventDefault();
    })
}


function onLoad() {
    var host = "ws://localhost:9000/sites/galaxie-xml/PHP-Websockets/PHP-Websockets/"; // SET THIS TO YOUR SERVER
    
    try {
	socket = new WebSocket(host);
	alert('WebSocket - status '+socket.readyState);
	socket.onopen    = function(msg) { 
	    //alert("Welcome - status "+this.readyState); 
	};
	socket.onmessage = function(msg) { 
	    //alert("Received: "+msg.data);
	    chargement(msg.data);
	    vectorLayerJSON.refresh({force:true});
	    vectorLayerJSON.events.on({
		featureselected: function(e) {
		    createPopup(e.feature);
		}
	    });
	    var selector = new OpenLayers.Control.SelectFeature(vectorLayerJSON,{
		hover:false,
		autoActivate:true,
		clickout: true,
		
	    });
	    map.addControl(selector);
	    selector.activate();
	    myStore.load();
	    attributestore.load();
	    xstore.load();
	    ystore.load();
	    lieustore.load();
	};
	socket.onclose   = function(msg) { 
	    alert("Disconnected - status "+this.readyState); 
	};
    }
    catch(ex){ 
	//alert("Exeption : "+ex); 
    }
}
