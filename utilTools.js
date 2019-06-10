var method = UtilTools.prototype;

const debug = require('debug')('Util');
const name = 'Util';
debug('Booting %s', name);
const path = require("path");
const fs = require('fs');
const __datadump_path_suffix = '/datadump/dictdump.json';


function UtilTools () {

}

method.formulateResultForHTMLPage = function (word, data) {
	
	var result = "<div class='second-wrap result-wrap'>";
	if (data == -1) {
	
		result = result + "<p><h1>Word '" + word + "' not found</h1></p></div>";
		return result;
	
	}
	
	result = result + "<p><h1>" + word + "</h1><br/>";
	result = result + "<b>Definitions :</b><br/></br></br>";
	
	for (var i = 0; i < data.length; i ++) {
		replacementLetter = data[i].definition.charAt(0).toUpperCase();
		result = result + (i+1) + ". <span style='color:#696969'><i>" + data[i].lexical_category + "</i></span>&nbsp;&nbsp;&nbsp;&nbsp;" + this.replaceAt(data[i].definition, 0, replacementLetter);
		
		if (data[i].example == 'undefined' || data[i].example == null) {
			result = result + "<br/></br></br>";
			continue;
		}
		else {
			result = result + "</br></br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;eg. " + this.replaceAt(data[i].example, 0, data[i].example.charAt(0).toUpperCase()) + "<br/></br></br>";
		}
	}
	
	result = result + "</div>";
	return result;
};

method.replaceAt = function (str, index, replacement) {
    return str.substr(0, index) + replacement + str.substr(index + replacement.length);
};

method.writeToFile = function writeToFile(filePath, data) {

		debug("Writing data to file path - " + filePath);
		fs.writeFileSync(filePath, data);
		debug("Successfully wrote data to file path - " + filePath);
		
};

method.writeJSONToFile = function (filePath, data) {
	
		debug("Writing json to file path - " + filePath);
		debug("Converting js objects to json");
		var jsonData = JSON.stringify(data, null, 2);
		debug(jsonData);
		this.writeToFile(filePath, jsonData);
};

method.readFromFile = function (filePath) {
	
		var rawData = fs.readFileSync(filePath);  
		return rawData;
		
};

method.readStoredJsonData = function (filePath) {
	
		debug('Reading stored JSON data from - ' + filePath);
		if (!fs.existsSync(filePath)) {
			return -1
		}
		var rawJsonData = fs.readFileSync(filePath); 
		if (rawJsonData.length != 0) {
			var jsonData = JSON.parse(rawJsonData);  
			debug('Successfully read stored JSON data from - ' + filePath);
			return jsonData;
		}
		else {
			return -1;
		}
};

method.runAllOnStartUpFunctions = function (lclDictFacadeObject) {
		
		// code segment to load stored JSON data and update the localDictionary
		var jsonData = this.readStoredJsonData(__dirname + __datadump_path_suffix);
		if (jsonData != -1) {
			var formattedData = jsonData;
			for (var i = 0; i < formattedData.length; i++) {
				lclDictFacadeObject.put(formattedData[i].word, formattedData[i].value);
			}
			debug('Successfully loaded the localDictionary with data from - ' + __dirname + __datadump_path_suffix);
		}
		else {
			debug('No stored JSON data found at - ' + __dirname + __datadump_path_suffix);
		}
};

method.runAllOnSigintFunctions = function (lclDictFacadeObject) {
	
		debug('SIGINT signal received');
		debug('Beginning disk write process');

		var data = lclDictFacadeObject.getAllWords()
		if (data[0].word == "" ) {
			debug('No data in localDictionary to write/save');
		}
		else {
			debug('Writing data from localDictionary to file');
			this.writeJSONToFile(__dirname + __datadump_path_suffix,data)
		}
		
		debug("Server shutdown successful");
 
};

module.exports = UtilTools;

