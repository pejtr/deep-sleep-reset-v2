import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

await conn.execute(`
  CREATE TABLE IF NOT EXISTS \`ab_test_weights\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`testName\` varchar(100) NOT NULL,
    \`variant\` varchar(10) NOT NULL,
    \`weight\` int NOT NULL DEFAULT 50,
    \`isWinner\` enum('yes','no') NOT NULL DEFAULT 'no',
    \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT \`ab_test_weights_id\` PRIMARY KEY(\`id\`)
  )
`);
console.log("✓ ab_test_weights created");

await conn.execute(`
  CREATE TABLE IF NOT EXISTS \`optimization_history\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`action\` text NOT NULL,
    \`testName\` varchar(100),
    \`winner\` varchar(10),
    \`confidence\` int,
    \`impact\` varchar(100),
    \`createdAt\` timestamp NOT NULL DEFAULT (now()),
    CONSTRAINT \`optimization_history_id\` PRIMARY KEY(\`id\`)
  )
`);
console.log("✓ optimization_history created");

await conn.end();
console.log("Migration complete.");
