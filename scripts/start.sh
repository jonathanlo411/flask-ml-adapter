#!/bin/bash

# Get the root directory of the project
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(dirname "$script_dir")"
cd "$root_dir"

# Determine the operating system
case "$OSTYPE" in
    darwin*)  # macOS: activate virtual environment using bin/activate
        venv_activate_path="flask-env/bin/activate"
        open_command="open"
        ;;
    linux*)   # Linux: activate virtual environment using bin/activate
        venv_activate_path="flask-env/bin/activate"
        open_command="xdg-open"
        ;;
    msys*)    # Windows: activate virtual environment using Scripts/activate
        venv_activate_path="flask-env/Scripts/activate"
        open_command="start"
        ;;
    *)  echo "Unsupported operating system" ;;
esac

# Activate the virtual environment
source "$venv_activate_path"

# Launch Flask in a new terminal window
$open_command "http://127.0.0.1:5000"
flask --app server run --debug
