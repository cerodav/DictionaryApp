

/* start of application config values */
var applicationHost = 'localhost';
var applicationPort = 8000;
var developementLandingPageText = 'Page under development';
var serverStartConsoleMessage = ''.concat('Started server at ', applicationHost, ':', applicationPort);
/* end of application config values */


const debug = require('debug')('Server')
const name = 'Server'
debug('Booting %s', name)
const express = require('express');
const app = express();
const request = require('request');
const https = require('https');
const rootCas = require('ssl-root-cas/latest').inject();
const requestProcessor = require("./requestProcessor.js")
const utilTools = require("./utilTools.js")
const localDictionary = require("./trie.js");

var lclDictFacadeObject = new localDictionary();
var utilFacadeObject = new utilTools();
https.globalAgent.options.ca = rootCas;
utilFacadeObject.runAllOnStartUpFunctions(lclDictFacadeObject);


app.use(express.static('frontend'));
app.listen(applicationPort, () => {
  debug(serverStartConsoleMessage)
});


/* start of request routing section */
app.get('/dictionaryApp', (req, res) => {new requestProcessor(req, res).serveHome()});
app.get('/test', (req, res) => {new requestProcessor(req, res).serveTestPage()});
app.get('/wordsForPrefix/:prefix', (req, res) => {new requestProcessor(req, res).serveGetRequestForAllWordsWithPrefix(req.params.prefix, lclDictFacadeObject)});
app.post('/search', (req, res) => {new requestProcessor(req, res).serveSearchQuery(lclDictFacadeObject)});
process.on('SIGINT', () => {utilFacadeObject.runAllOnSigintFunctions(lclDictFacadeObject)});	
/* end of request routing section */

