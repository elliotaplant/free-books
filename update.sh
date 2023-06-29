#!/bin/bash

set -e

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Helper function to check if a command is available
check_command() {
    if command -v $1 >/dev/null 2>&1; then
        log "$1 is installed, proceeding..."
    else
        log "$1 could not be found. Please install it."
        exit 1
    fi
}

# Check dependencies
dependencies=("curl" "unrar" "mysql" "pscale")
for cmd in "${dependencies[@]}"; do
    check_command $cmd
done

# Check if .my.cnf file exists
if [ ! -f ~/.my.cnf ]; then
    log "Error: .my.cnf file does not exist in the home directory"
    exit 1
fi

# Create working directory
log "Creating working directory..."
mkdir -p working
cd working

# Download dbdumps files
log "Downloading dbdumps files..."

# Check for fiction.rar
if [ -f "fiction.rar" ]; then
  read -p "fiction.rar already exists. Do you want to delete it and download again? (y/n, default is n): " delete_fiction
  if [ "$delete_fiction" == "y" ]; then
    rm -f fiction.rar
    curl -LO --retry 10 --retry-max-time 0 -C - https://data.library.bz/dbdumps/fiction.rar 
  fi
else
  curl -LO --retry 10 --retry-max-time 0 -C - https://data.library.bz/dbdumps/fiction.rar 
fi

# Check for libgen_compact.rar
if [ -f "libgen_compact.rar" ]; then
  read -p "libgen_compact.rar already exists. Do you want to delete it and download again? (y/n, default is n): " delete_libgen
  if [ "$delete_libgen" == "y" ]; then
    rm -f libgen_compact.rar
    curl -LO --retry 10 --retry-max-time 0 -C - https://data.library.bz/dbdumps/libgen_compact.rar 
  fi
else
  curl -LO --retry 10 --retry-max-time 0 -C - https://data.library.bz/dbdumps/libgen_compact.rar 
fi


# Check if both files exist or exit with an error
if [ ! -f "fiction.rar" ] || [ ! -f "libgen_compact.rar" ]; then
    log "Error: Required files do not exist"
    exit 1
fi

# Extract the downloaded files
log "Extracting rar files..."
unrar x -o+ fiction.rar
unrar x -o+ libgen_compact.rar

# Check if SQL files exist or exit with an error
if [ ! -f "fiction.sql" ] || [ ! -f "libgen_compact.sql" ]; then
    log "Error: Extracted SQL files do not exist"
    exit 1
fi

# Start MySQL server
if ! mysqladmin ping -h localhost --silent; then
    log "Starting MySQL server..."
    mysql.server start
else
    log "MySQL server is already running"
fi

# Drop the existing database and create a new one
log "Creating database..."
mysql -e "DROP DATABASE IF EXISTS libgen_combined; CREATE DATABASE libgen_combined;"

# Import the SQL files into the database
log "Importing SQL files into the database..."
mysql libgen_combined < fiction.sql
mysql libgen_combined < libgen_compact.sql

# Check if tables 'fiction' and 'updated' exist in the database
log "Checking database tables..."
TABLES_EXIST=$(mysql -Nse "USE libgen_combined; SHOW TABLES LIKE 'fiction'; SHOW TABLES LIKE 'updated';" | wc -l)
if [ "$TABLES_EXIST" -ne 2 ]; then
    log "Error: Tables 'fiction' and 'updated' do not exist in the database"
    exit 1
fi

# Create combined table and run queries
log "Creating and populating combined table..."
mysql libgen_combined <<SQL
CREATE TABLE combined (MD5 CHAR(32), Title TEXT, Author TEXT, Filesize INT);
INSERT INTO combined SELECT MD5, Title, Author, Filesize FROM fiction WHERE Language = 'English' AND (Extension = 'epub' OR Extension = 'mobi') AND Filesize <= 25000000;
INSERT INTO combined SELECT MD5, Title, Author, Filesize FROM updated WHERE Language = 'English' AND (Extension = 'epub' OR Extension = 'mobi') AND Filesize <= 25000000;
SQL

# Print the number of rows in the combined table
log "Number of rows in the combined table:"
mysql libgen_combined -e "SELECT COUNT(*) FROM combined;"

# Export the combined table to an SQL file
log "Exporting the combined table to an SQL file..."
mysqldump libgen_combined combined > combined.sql

# Use pscale to upload combined table to planetscale
log "Uploading combined table to planetscale..."
pscale shell libgen-english main < combined.sql

# Print the number of rows in libgen-english using pscale
log "Number of rows in libgen-english:"
pscale query run libgen-english main "SELECT COUNT(*) FROM combined;"
