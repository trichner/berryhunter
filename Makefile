
berryhunterd:
	@docker build -t berryhunterd -f Dockerfile.berryhunterd .

chieftaind:
	@docker build -t chieftaind -f Dockerfile.chieftaind .

berryhunter-web:
	@docker build -t berryhunter-web -f Dockerfile.berryhunter-web .
