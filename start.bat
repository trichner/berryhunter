@echo off

start /d "chieftaind" chieftaind.exe

start /d "berryhunterd" berryhunterd.exe

cd frontend

yarn run start