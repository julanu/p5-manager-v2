#!/bin/sh

echo "Starting p5-manager setup..."

# Function to create a collection if it doesn't exist
create_collection_if_not_exists() {
    collection_name=$1
    if [ ! -d "/app/data/$collection_name" ]; then
        echo "Creating new collection '$collection_name'..."
        node bin/p5-manager.js new "$collection_name" || { echo "Failed to create $collection_name"; exit 1; }
    else
        echo "Collection '$collection_name' already exists. Skipping creation."
    fi
}

# Function to generate a project if it doesn't exist
generate_project_if_not_exists() {
    project_name=$1
    if [ ! -d "/app/data/$project_name" ]; then
        echo "Generating project '$project_name'..."
        node bin/p5-manager.js generate "$project_name" || { echo "Failed to generate $project_name"; exit 1; }
    else
        echo "Project '$project_name' already exists. Skipping generation."
    fi
}

# Create collections if they don't exist
create_collection_if_not_exists "sketches"
create_collection_if_not_exists "sketches-intro"
create_collection_if_not_exists "projects"

# Ensure the .p5rc file exists and is initialized if not
if [ ! -f /app/data/.p5rc ]; then
    echo '{"projects":[]}' > /app/data/.p5rc
fi

# Generate the first project if it doesn't exist
generate_project_if_not_exists "first-project"

# Start the server
echo "Starting the p5-manager server..."
node bin/p5-manager.js server || { echo 'Failed to start the server'; exit 1; }

echo "p5-manager setup complete."
