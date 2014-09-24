 <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">

<?php 
        $uttl = htmlentities($_SERVER['QUERY_STRING']);
        $uttl=str_replace("é","e","$uttl");
        echo $uttl;
	
	$doc_xml = new DOMDocument();
	$doc_xml->load('jeux-donnees-defibrilateurs.xml');//chargment de donnee.xml sous forme d'arbre DOM
	
	$doc_xsl = new DOMDocument();
	$doc_xsl->load('plan.xsl');//chargment de plan.xsl sous forme d'arbre DOM
	
	$proc = new XsltProcessor();//cree interprete
	$proc->importStylesheet($doc_xsl);
	
	/** remplace & -> | et + -> ' ' **/
	$queryString = str_replace("&", "|", $_SERVER['QUERY_STRING']);
	$queryString = str_replace("+", " ", $queryString);
	$queryString = $queryString.'|';
	
	$proc->setParameter(null, 'criteres', $queryString);
	
	$handle = fopen("objets.json", "w+");
	$chaine = $proc->transformToXML($doc_xml);//donne musee.xml a la feuille xsl + affiche flux resultat sur sortie standart
	fwrite($handle, $chaine);
	fclose($handle);
	header('Location: ../xml/jeux-donnees-defibrilateurs.xml');
	echo $chaine;
?>
