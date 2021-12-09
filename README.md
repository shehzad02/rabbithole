# rabbithole
Data Structures final project utilizing Amazon's recommendation data to build, access, and visualize a graph structure

## How to Run the App Locally
### Prerequisites
You need to have Node.js, Angular CLI, and Python 3 installed on your machine

### Step 1
The first thing that needs to get done is parsing the data files into json files, so it can be read in javascript.

Download the data.zip file from {insert url here}. Extract the contents into a folder called data that
is at the same level as the python script. It will look for ./data/Amazon0601.txt and ./data/amazon-meta.txt

Run the python script. It will export the json files into the ./data folder.

### Step 2
Copy and paste the two json files into the ./frontend/src/assets folder.

### Step 3
Run the "npm install" command from the terminal while being inside the ./frontend folder to install all of the angular dependencies for the project.

### Step 4
Run "ng s --open" to start a localhost and automatically open a window to view the page