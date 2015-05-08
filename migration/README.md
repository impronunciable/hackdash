# Migration Scripts for HackDash DataBase
There is a folder with every version as breaking point for running the scripts inside.  
So, you MUST run scripts for every version you missed.  

i.e.  
1. Your current version is 0.6.x and moving to version 0.8.5 you must run scripts inside 0.8.0 and 0.8.5.  
2. Your current version is 0.8.2 and moving to version 0.8.10 you must run scripts from 0.8.5 and above.  

**WARNING**
All scripts will update data using the current database configured for your server at `./config.json`.  
It is recommended to save and backup the database before running these scripts.

## Running scripts
```bash
cd v0.x.x
node name_of_script.js
```
