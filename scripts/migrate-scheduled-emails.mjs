import { createConnection } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const sql = `CREATE TABLE IF NOT EXISTS \`scheduled_emails\` (
  \`id\` int AUTO_INCREMENT NOT NULL,
  \`email\` varchar(320) NOT NULL,
  \`name\` text,
  \`chronotype\` varchar(20) NOT NULL,
  \`day\` int NOT NULL,
  \`sendAt\` timestamp NOT NULL,
  \`sentAt\` timestamp,
  \`status\` enum('pending','processing','sent','failed') NOT NULL DEFAULT 'pending',
  \`createdAt\` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT \`scheduled_emails_id\` PRIMARY KEY(\`id\`)
)`;

const conn = await createConnection(process.env.DATABASE_URL);
await conn.execute(sql);
console.log("✅ scheduled_emails table created");
await conn.end();
