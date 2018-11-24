@echo off

REM Key considerations for algorithm "RSA" ≥ 2048-bit
openssl genrsa -out server.key 2048

REM Key considerations for algorithm "ECDSA" ≥ secp384r1
REM List ECDSA the supported curves (openssl ecparam -list_curves)
openssl ecparam -genkey -name secp384r1 -out server.key

openssl req -new -x509 -sha256 -key server.key -out server.crt -days 3650^
 -subj "/C=CH/ST=Berryhunter/L=Scranton/O=Berryhunter/OU=Techies/CN=berryhunter.io"