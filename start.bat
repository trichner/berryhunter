@echo off

start /d "backend" backend.exe

cd frontend

yarn run start --open-page "?token=plz&local&port=2000"