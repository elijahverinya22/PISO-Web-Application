@echo off
echo Starting PISO backend server on http://127.0.0.1:8080...
:: Start the server in the background briefly
start "PISO Server" cmd /c "cd Files && python server.py"
:: Wait 2 seconds for Flask to start
timeout /t 2 /nobreak > nul
:: Open the browser to the exact IP address
start http://127.0.0.1:8080
echo.
echo Server is running! Please keep the "PISO Server" command window open.
echo You may close this window.
exit
