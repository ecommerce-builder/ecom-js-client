# CHANGELOG

## 1.3.0 (28 Nov 2018)
+ Main library uses dependency injection to push in fetch function
+ Test uses environment variables for host, email and endpoint URL
+ Babel compiler settings to use runtime generators
+ Rollup config produces UMD builds for browser
+ Works against ecom-api-go 0.6.1

## 1.2.0 (19 Nov 2018)
+ Integration tests compatible with ecom-api-go 0.5.0
+ JSON Web Token is passed in the HTTP Authorization header for all requests including cart
+ Cart API expects a minimum of at least the Annoymous sign-in
+ Tests sign-in using Firebase JS Client library

## 1.1.0 (7 Nov 2018)
+ JavaScript Client SDK intial version (compatible with Ecom API 0.3.0)
+ Tests that work with ecom API 0.3.0
