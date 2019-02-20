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

#### Known Issues

- there's a race condition between chieftaind and berryhunterd. If berryhunterd starts before chieftaind is up, it will crash. **Solution:** Shut down docker-compose (CTRL+C) and run `./up.sh` again.

### Windows Environment

#### Perquisites

**To compile Go-libraries**

- Install any C++ Compiler

**For chieftaind**

- Install go
- OpenSSL https://wiki.openssl.org/index.php/Binaries (I used "Win64 OpenSSL v1.1.1" from https://slproweb.com/products/Win32OpenSSL.html )
    - Add `C:\Program Files\OpenSSL-Win64\bin` (or whatever the installation path is) to your PATH variable
- Install required certificates:
    1. `cd chieftaind`
    2. `server\genkey.bat`
    3. The following error message can be safely ignored:
  ```
  Can't load ./.rnd into RNG
  6656:error:2406F079:random number generator:RAND_load_file:Cannot open file:crypto\
  rand\randfile.c:88:Filename=./.rnd
  ```

**For berryhunderd**

- Install go
- Create `conf.json` from `conf.default.json`
- Create `tokens.list` from `tokens.example.list`

**For frontend**

1. Install node.js https://nodejs.org
2. Install yarn https://yarnpkg.com/

#### Build everything

- Run build.bat in project root
- every project part (chieftaind, berryhunterd, frontend) has it's own build.bat, too. In case you only want to build a specific part.

#### Run everything

- Run start.bat in project root
- every project part (chieftaind, berryhunterd, frontend) has it's own start.bat, too. In case you only want to build a specific part.



:V