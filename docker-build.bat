@echo off
setlocal enabledelayedexpansion

set TAG=%1
if "%TAG%" == "" (
    for /f %%i in ('git rev-parse HEAD ') do set GIT_TAG=%%i
    set GIT_TAG=%GIT_TAG:~0,7%
    set GIT_TAG="rev-!GIT_TAG!"
    set TAG=!GIT_TAG!
)

set REGISTRY_NAMESPACE="gcr.io/trichner-212015/"
echo "Building berryhunterd:!TAG!"
set IMAGE_NAME="berryhunterd"
docker build -t "%IMAGE_NAME%:!TAG!"  .

docker tag "%IMAGE_NAME%:!TAG!" "%IMAGE_NAME%:latest"
docker tag "%IMAGE_NAME%:!TAG!" "gcr.io/trichner-212015/%IMAGE_NAME%:!TAG!"

echo.
echo tagged:
echo    %IMAGE_NAME%:latest
echo    gcr.io/trichner-212015/%IMAGE_NAME%:!TAG!