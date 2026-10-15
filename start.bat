@echo off
echo Iniciando el Simulador de Ensamblador...
echo Accede en tu navegador a: http://localhost:8000/index.html
start http://localhost:8000/index.html
python -m http.server 8000
