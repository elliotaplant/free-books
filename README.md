# Getting Started

Set up your environment with these variables:

```
# For app.js
export DATABASE_URL=<Get this from PlanetScale or wherever you host your mysql database>
export SOURCE_EMAIL=<address_used_to_send_books@gmail.com>
export SOURCE_EMAIL_PASSWORD=<password for above address>
```

This app is a relatively simple node app. Run `yarn start` to start the server.

## Libgen Database

Libgen has [dumps](https://data.library.bz/dbdumps/) of it's database available daily.
The `update.sh` script:

- downloads the dumps
- `unrar`s them
- filters out books that aren't English, epub or mobi formatted, or under 25Mb
- Creates a combined table of fiction and non-fiction books
- Dumps that combined table
- Uploads and overwrites the combined table to PlanetScale

## Deployment

I have this app currently set up to deploy on render.com
