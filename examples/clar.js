var Clarifai = require('clarifai');
var Promise = require('es6-promise').Promise;
var app = new Clarifai.App('hLLhJ3UJTAx9qj9Acg2OXR5pYWNX2siyE2cDn31T', 'ltt-jTCUB7g6E6w2vngshBxv-0VGz6wttmfH0E9c');
app.models.predict(Clarifai.GENERAL_MODEL, 'https://samples.clarifai.com/metro-north.jpg').then(   function(response) {     console.log(response);   },   function(err) {     console.error(err);   } );
