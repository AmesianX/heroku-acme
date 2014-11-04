var fs = require('fs');
var acme = require("acme");
var express = require("express");
var bodyParser = require('body-parser');

// We include a random path as a secret password
var SERVER_PATH = "/44793093967F42024562B1638D5C";
var CLIENT_PATH = "/B022BE4AFCFC4915B349767EA72F"

if (process.env.ROLE == "SERVER") {
  // Configuration
  var DEFAULT_PORT = 5000;
  var CA_KEY = "./ca-key.pem";
  var CA_CERT = "./ca-cert.pem";

  // Start up and configure ACME server
  var acmeServer = acme.createServer();
  acmeServer.setPrivateKey(fs.readFileSync(CA_KEY));
  acmeServer.setCertificate(fs.readFileSync(CA_CERT));

  // Create and configure HTTP server
  var app = express();
  app.use(bodyParser.json({ type: "*/json" }));
  app.set('port', (process.env.PORT || DEFAULT_PORT))
  app.post(SERVER_PATH, function(request, response) {
    var reply = acmeServer.handleAcmeMessage(request.body);
    response.send(JSON.stringify(reply, null, 2));
  })
  app.listen(app.get('port'))

} else {
  // Change these parameters to suit your usage
  var ACME_SERVER = "http://acme-server.herokuapp.com" + SERVER_PATH;
  var HOSTNAME = "acme-client.herokuapp.com";
  var DEFAULT_PORT  = 5001;

  var complete = false;
  var certdata = "Pending...";
  function showResults(request, response) {
    if (!complete) {
      response.send("Pending...");
      return;
    }

    if (("type" in certdata) && (certdata.type == "error")) {
      response.send("Error: " + JSON.stringify(certdata));
      return;
    }

    var html = "<html><head><title>ACME</title></head><body>" +
               "<h1>Certificate for "+ HOSTNAME +"</h1>" +
               "<h3>Private key:</h3>" +
               "<pre>" +
               acme.privateKeyToPem(certdata.subjectKeyPair.privateKey) +
               "</pre>" +
               "<h3>Certificate:</h3>" +
               "<pre>" +
               acme.certificateToPem(certdata.certificate) +
               "</pre>" +
               "<hr/>" +
               "<h3>Raw output:</h3>" +
               "<pre>" +
               JSON.stringify(certdata, null, 2) +
               "</pre>" +
               "</body></html>";
    response.type("html");
    response.send(html);
  }

  // Get a certificate then start the server
  acme.getMeACertificate(ACME_SERVER, HOSTNAME, function(x) {
    complete = true;
    certdata = x;

    app = express();
    app.set('port', (process.env.PORT || DEFAULT_PORT));
    app.get(CLIENT_PATH, showResults);
    app.listen(app.get('port'));
  });
}
