<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:strip-space elements="*"/>	

	<xsl:output method="html" encoding="ISO-8859-1" />

	<xsl:template match="/">
		<html>
			<body>
				<h1> Formulaire </h1>
				<form method="GET" action="relais.php">
					<xsl:apply-templates select="//*" />
					<br/>
					<hr/>
					<input type="submit" value="correction" />
				</form>
			</body>
		</html>
	</xsl:template>


	<xsl:template match="*[not(preceding::*[name(current())=name()])]"><!-- filtre noeuds deja parcouru -->
	<xsl:if test="name() != 'defibrilateur'">
	<xsl:variable name="balises" select="name()" /><!-- recupere noeud courant avec name() -->
		<hr/>
		<h3>
			nom-balise :
			<xsl:value-of select="$balises" />
		</h3>

		<xsl:for-each select="@*">
			<xsl:if test="name() != 'x'"><xsl:if test="name() != 'y'"><xsl:if test="name() != 'lieu'"><xsl:if test="name() != 'adresse'">
			<select name="{$balises}-{name()}">
				<xsl:apply-templates select="//*[name()=$balises]/@*[name()=name(current())]" />
			</select>
			</xsl:if></xsl:if></xsl:if></xsl:if>
		</xsl:for-each>
		
		

	</xsl:if>
	</xsl:template>


	
	<xsl:template match="@*[not(preceding::*[current()=@*])]">
	

		<option value = "{.}">
			<xsl:value-of select="." />
		</option>

	</xsl:template>



	<xsl:template match="*">
	</xsl:template>

</xsl:stylesheet>
