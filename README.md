# rabbithole
Data Structures final project utilizing Amazon's recommendation data to build, access, and visualize a graph structure.

## How to Run the App Locally
### Prerequisites
You need to have Node.js, Angular CLI, and Python 3 installed on your machine.

### Step 1
The first thing that needs to get done is parsing the data files into json files, so it can be read in JavaScript.

Download the data.zip file from [here](https://drive.google.com/file/d/1IdRjcJRbFLEKej4YTv-eMO4LYTceaYM5/view?usp=sharing).
Extract the contents, which will create a folder called 'data', and place it at the same level as the python script (`parse.py`).
The script will look for `./data/Amazon0601.txt` and `./data/amazon-meta.txt`.

### Step 2
Run the python script. It will export JSON files into the `./frontend/src/assets` directory.

### Step 3
Run the "npm install" command from the terminal while inside the `./frontend` directory to install the project's 
Angular dependencies.

### Step 4
Run "ng s --open" to start a localhost and automatically open a window to view the page.
