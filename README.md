# ACME on heroku

This package uses the base ACME node.js package to instantiate an ACME server
or client as a Heroku app.  This can be an easy way to get a certificate for
your app -- just run this module in client mode to get a certificate, then
install your real app.

This package can act as an ACME client or server, depending on the heroku
config variable ROLE.


## Client Quickstart

```
> cp $LETS_ENCRYPT/heroku-acme/* .
> npm install $LETS_ENCRYPT/node-acme
> npm install
> # Edit index.js to specify the app's domain and note CLIENT_PATH
> git add *
> git commit -am "Getting a certificate..."
> git push heroku master
> # Open https://domain/PATH
```

The first request you send will start the process running.  It will take up to
about a minute, since in addition to the ACME protocol, it has to generate two
2048-bit RSA key pairs.  (The JS crypto library used by the ACME client (forge)
is not real speedy at key pair generation.)


## Server Quickstart

```
> cp $LETS_ENCRYPT/heroku-acme/* .
> npm install $LETS_ENCRYPT/node-acme
> npm install
> # Replace ca-cert.pem or ca-key.pem if you want a different key/cert
> heroku config:set ROLE=SERVER
> git add *
> git commit -am "My ACME server!"
> git push heroku master
```
