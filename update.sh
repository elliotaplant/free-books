#!/bin/bash

set -e

# Dependencies: curl, unrar, mysql, pscale

# Check if curl, unrar, mysql, and pscale are installed
if ! command -v curl &> /dev/null
then
    echo "curl could not be found. Please install curl."
    exit 1
fi

if ! command -v unrar &> /dev/null
then
    echo "unrar could not be found. Please install unrar."
    exit 1
fi

if ! command -v mysql &> /dev/null
then
    echo "mysql could not be found. Please install mysql."
    exit 1
fi

if ! command -v pscale &> /dev/null
then
    echo "pscale could not be found. Please install pscale."
    exit 1
fi

# Get MySQL user and password from environment
MYSQL_USER=${MYSQL_USER}
MYSQL_PASS=${MYSQL_PASS}

if [ -z "$MYSQL_USER" ]
then
    echo "Error: MySQL user not set in environment"
    exit 1
fi

if [ -z "$MYSQL_PASS" ]
then
    echo "Error: MySQL password not set in environment"
    exit 1
fi

# Create working directory
mkdir -p working
cd working

# Download dbdumps files
echo "Downloading dbdumps files..."
curl -LO https://data.library.bz/dbdumps/fiction.rar 
curl -LO https://data.library.bz/dbdumps/libgen_compact.rar

# Check if both files exist or exit with an error
if [ ! -f "fiction.rar" ] || [ ! -f "libgen_compact.rar" ]; then
    echo "Error: Required files do not exist"
    exit 1
fi

# Extract the downloaded files
unrar x fiction.rar
unrar x libgen_compact.rar

# Check if SQL files exist or exit with an error
if [ ! -f "fiction.sql" ] || [ ! -f "libgen_compact.sql" ]; then
    echo "Error: Extracted SQL files do not exist"
    exit 1
fi

# Start MySQL server
mysql.server start

# Drop the existing database and create a new one
mysql -u $MYSQL_USER -p $MYSQL_PASS -e "DROP DATABASE IF EXISTS libgen_combined; CREATE DATABASE libgen_combined;"

# Import the SQL files into the database
mysql -u $MYSQL_USER -p $MYSQL_PASS libgen_combined < fiction.sql
mysql -u $MYSQL_USER -p $MYSQL_PASS libgen_combined < libgen_compact.sql

# Check if tables 'fiction' and 'updated' exist in the database
TABLES_EXIST=$(mysql -u $MYSQL_USER -p $MYSQL_PASS -Nse "USE libgen_combined; SHOW TABLES LIKE 'fiction'; SHOW TABLES LIKE 'updated';" | wc -l)
if [ "$TABLES_EXIST" -ne 2 ]; then
    echo "Error: Tables 'fiction' and 'updated' do not exist in the database"
    exit 1
fi

# Create combined table and run queries
mysql -u $MYSQL_USER -p $MYSQL_PASS libgen_combined <<SQL
CREATE TABLE combined (MD5 CHAR(32), Title TEXT, Author TEXT, Filesize INT);
INSERT INTO combined SELECT MD5, Title, Author, Filesize FROM fiction WHERE Language = 'English' AND (Extension = 'epub' OR Extension = 'mobi') AND Filesize <= 25000000;
INSERT INTO combined SELECT MD5, Title, Author, Filesize FROM updated WHERE Language = 'English' AND (Extension = 'epub' OR Extension = 'mobi') AND Filesize <= 25000000;
SQL

# Print the number of rows in the combined table
mysql -u $MYSQL_USER -p $MYSQL_PASS libgen_combined -e "SELECT COUNT(*) FROM combined;"

# Export the combined table to an SQL file
mysqldump -u $MYSQL_USER -p $MYSQL_PASS libgen_combined combined > combined.sql

# Use pscale to upload combined table to planetscale
pscale shell libgen-english main < combined.sql

# Print the number of rows in libgen-english using pscale
pscale shell libgen-english main -e "SELECT COUNT(*) FROM combined;"
