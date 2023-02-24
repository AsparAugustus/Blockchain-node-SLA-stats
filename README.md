# Node SLA statistics frontend + ChartJS


## Start up server
1. put in your API key or URL for ETH_TRUSTED_NODE_URL in .env file in /app
2. In home directory, run "docker compose up --build"

## Start frontend
3. cd into /frontend
3. ng serve

### NodeJS + Express backend
The backend was mostly pre-built with limited logging capacity, changes were made
(mostly to scripts in /app/src/utils/, including check-availbility.js and others; calculators.js, index.js in /app/src/utils/sla)
to log node statistics to local .txt files in JSON format. Which provide ease of parsability for ChartJS module.
Additional functions implemented to fetch statistics from EVM/NON-EVM based nodes via JSON-RPC methods.

No historic data is stored, and thus scheduled check times are drastically lowered to provide charted data on the fly on the frontend.
In production, data would be stored in a PostgresDB for data integrity, consistency and scalability.

## Frontend
Frontend is built with AngularJS and plain CSS.



