## DB Tools

With the DB tools you are able to get a MongoDB instance up and running to
develop and test Kordis. You should have an active Docker instance up and
running on your maschine.

### Test Data

The data for the test database is within the [`data`](./data/) folder. If you
want to create a new collection, use the [`template.ts`](./data/template.ts) as
a starter for your file. The naming of the file should be
`<collection name>.data.ts`.  
Please adjust the test data in your branch if you introduce migrations!

### Start

Every script checks whether you have a MongoDB container up and running. If not
it will pull and start the Mongo image at port `27017`.

**Starting a local dev database for development or for testing/e2es:**  
`./kordis-db.sh init <database name>`  
This will bootstrap the database with the given name and the test data. Make
sure that the database does not exist, otherwise it will just push the data into
the existing database! A MongoDB connection uri will be emitted by the script.
You can use it for local development.

**Starting a local database with a clone of the remote databases:**  
You will need a MongoDB connection URI from the remote database! Make sure to
include the database in the URI!
`./kordis-db.sh from-remote "<remote MongoDB connection uri>" <database name>`  
This will clone the remote database into a local database. A MongoDB connection
uri will be emitted by the script. You can use it for local development.

### Migrations

If necessary, you can introduce migration scripts that will directly modify the
database. We use the Node Package
[Mongo Migrate](https://www.npmjs.com/package/mongo-migrate-ts). You can create
new migration scripts by running
`./kordis-db.sh new-migration <optional name of migration>`, keep in mind to
only introduce a single migration script per change request into `main`.
