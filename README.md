# Berryhunter

Repo for the most awesome berry-hunting experience.

## tl;dr

### Prerequisites
- install 
  - `make`
  - `go >1.22` ([instructions](https://go.dev/doc/install))
  - `docker` ([instructions](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository))
  - `node 20` (optional but useful; includes npm 10.5; usage of NVM recommended)

### Build
1. build the frontend
   ```
   # requires docker
   make -C frontend build
   ```
2. build the backend
   ```
   # requires go >1.22
   make -C backend build
   ```
3. boot the server
    ```
    cd backend
    ./berryhunterd -dev
    ```
4. check the console to figure out what URL to open in your local browser, probably http://localhost:2000/?wsUrl=ws://localhost:2000/game
5. profit!


## Running the Project

### Windows Environment

We use WSL (Windows Subsystem for Linux) which basically allows you to run Linux commands right on your Windows machine.

There is an [official guide](https://learn.microsoft.com/en-us/windows/wsl/install), but you can just use these commands to have everything in order:

1. Open Powershell as **administrator**
2. Run `Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform, Microsoft-Windows-Subsystem-Linux`
3. Reboot when prompted
4. `wsl --set-default-version 2`
5. `wsl --install -d Ubuntu-24.04`
6. As soon as the Powershell is done with the installation, it will open your new Ubuntu instance and asks you for a username and password.
    - Username can be anything but `root`, personally I like to use the same name as my windows username
    - Username needs to be all lowercase letters and or underscore (_) or dash (-)
    - Password doesn't need to be secure, you can easily repeat your username as password --> just remember it, as resetting it from outside is not possible
7. `sudo apt update && sudo apt upgrade` will install the latest system updates
8. Inside Ubuntu, run `explorer.exe .` --> this opens a regular Windows explorer window (at `\\wsl.localhost\Ubuntu-24.04\home\[username]\` ). If you are familiar with Unix you will notice how this path is a combination of a windows mounted "network" drive, your WSL distribution and finally the Unix filesystem.
9. Create a folder `workspaces` inside this Ubuntu home folder.
10. Checkout `berryhunter` here and open the project in your IDE
11. From here on you can follow the general/mac instructions
    - use `sudo -i` to become the root user for the rest of your session
    - `exit` ends your root session
    - Use `sudo apt install [software]` to install everything you need
    - To install go use `sudo snap install go --classic`

### Mac Environment
(Last updated 30.10.2018)

- open a terminal at project root
- run `make`. This will take a while when running first time (about 10 minutes)
- run `./up.sh` to load the images into docker and start docker
- game url: http://local.berryhunter.io:2015/?local
- chieftain api url: https://local.berryhunter.io:2015/chieftain/scoreboard

#### Known Issues

- there's a race condition between chieftaind and berryhunterd. If berryhunterd starts before chieftaind is up, it will crash. **Solution:** Shut down docker-compose (CTRL+C) and run `./up.sh` again.

:V
