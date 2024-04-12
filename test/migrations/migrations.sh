#!/bin/bash

# Set database parameters
username="your_username"
database="your_database"

# Step 1: Snapshot the db schema
pg_dump -U $username -s $database > pre_snapshot.sql

# Step 1a: Get a list of tables that don't start with 'knex'
table_list=$(psql -U $username -d $database -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name NOT LIKE 'knex%'")

# Step 1b: Get a representative sample of data from each table
for table in $table_list; do
    psql -U $username -d $database -c "COPY (SELECT * FROM \"$table\" ORDER BY RANDOM() LIMIT 100) TO STDOUT WITH CSV HEADER" > "${table}_sample.csv"
done

# Step 2: Run migrations
knex migrate:latest

# Step 3: Run migrations down
knex migrate:rollback

# Step 4: Compare snapshot to make sure migrations were rolled back
pg_dump -U $username -s $database > post_snapshot.sql
diff pre_snapshot.sql post_snapshot.sql > migration_diff.txt

# Step 5: Run migrations again
knex migrate:latest

# Step 6: Snapshot 2nd version of the DB schema
pg_dump -U $username -s $database > snapshot2.sql

# Step 7: Run Migrations again
knex migrate:latest

# Step 8: Snapshot 3rd version of the DB schema
pg_dump -U $username -s $database > snapshot3.sql

# Step 9: Compare 2nd and 3rd versions
diff snapshot2.sql snapshot3.sql > idempotency_diff.txt

echo "Check migration_diff.txt for migration rollback differences"
echo "Check idempotency_diff.txt for idempotency differences"