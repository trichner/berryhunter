@echo off

echo Building Chieftain

cd chieftaind
call build.bat
cd ..

echo Building BerryHunter Server

cd berryhunterd
call build.bat
cd ..

echo Build Frontend

cd frontend
npm install
call build.bat
cd ..
