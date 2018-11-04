# Berryhunter

Repo for the most awesome berry-hunting experience.

## Running the Project

### Mac Environment
(Last updated 30.10.2018)

- open a terminal at project root
- run `make`. This will take a while when running first time (about 10 minutes)
- run `./up.sh` to load the images into docker and start docker
- game url: http://local.berryhunter.io:2015/?local
- chieftain api url: https://local.berryhunter.io:2015/chieftain/scoreboard

### Windows Environment

TBD

### Known Issues

- there's a race condition between chieftaind and berryhunterd. If berryhunterd starts before chieftaind is up, it will crash. **Solution:** Shut down docker-compose (CTRL+C) and run `./up.sh` again.


:V
