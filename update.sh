# Download https://data.library.bz/dbdumps/fiction.rar 
# Download https://data.library.bz/dbdumps/libgen_compact.rar
# Print both files exist or error

# unrar fiction.rar
# unrar libgen_compact.rar
# Verify fiction.sql and libgen_compact.sql exist or error

# Start mysql server
# Drop the database libgen_combined if it exists
# create database libgen_combined
# Run fiction.sql on libgen_combined
# Run libgen_compact.sql on libgen_combined
# Verify tables 'fiction' and 'updated' exist in the database or error

# Create table "combined"
# Put the results of this query into combined:
# ```
# SELECT MD5, Title, Author, Filesize
# FROM fiction
# WHERE Language = 'English'
# AND (Extension = 'epub' OR Extension = 'mobi')
# AND Filesize <= 25000000;
# ```
# Put the results of this query into combined:
# ```
# SELECT MD5, Title, Author, Filesize
# FROM updated
# WHERE Language = 'English'
# AND (Extension = 'epub' OR Extension = 'mobi')
# AND Filesize <= 25000000;
# ```
# Print the number of rows in combined

# Use mysqldump to export the "combined" table to an sql file

# Use the pscale shell to pipe the combined table to planetscale:
# ```
# pscale shell libgen-english main < combined.sql
# ```
# Print the number of rows in libgen-english using the pscale shell
