
docker.exe build -t berryhunter .
docker.exe run -it --rm -p=127.0.0.1:2000:2000 berryhunter
