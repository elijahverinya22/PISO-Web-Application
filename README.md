# PISO (Payment Insight & Savings Optimizer)

PISO is a local web application designed to help you organize your debts and investment goals, and run an Optimization Wizard that strategically allocates your monthly income to minimize interest and maximize yield.

## Prerequisites

To run this application on your computer, you must have **Python** installed.
1. Download Python from [python.org/downloads](https://www.python.org/downloads/)
2. Run the installer.
3. **CRITICAL STEP:** During installation, make sure to check the box that says **"Add Python to PATH"** at the bottom of the window before clicking "Install".

## How to Run

1. Click the green `<> Code` button at the top of this repository and select **Download ZIP**.
2. Extract the downloaded ZIP folder anywhere on your computer.
3. Open the extracted folder.
4. Double-click the **`setup.bat`** file.

The setup script will automatically verify your Python installation, install the required backend modules (`Flask`), and then launch the server. It will automatically open the PISO application in your default web browser!

## Troubleshooting

- **"Python is not recognized"**: You forgot to check "Add Python to PATH" when installing. Re-run the Python installer, choose "Modify", and ensure the PATH option is checked.
- **Changes not saving**: Ensure the black command prompt window labeled "PISO Server" remains open while you use the application. If you close it, the app will lose connection to the database.
