@echo off
title CompSync Desktop v0.1.0-beta
cd /d "%~dp0"

if exist "%~dp0target\release\compsync_desktop.exe" (
    echo Membuka CompSync Desktop dari target\release...
    start "" "%~dp0target\release\compsync_desktop.exe"
    exit
)

if exist "%~dp0bin\compsync-v0.1.0-beta.exe" (
    echo Membuka CompSync Desktop dari bin...
    start "" "%~dp0bin\compsync-v0.1.0-beta.exe"
    exit
)

echo File executable tidak ditemukan. Harap build terlebih dahulu.
pause
