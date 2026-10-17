async function up(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
      account_type enum('seeker','employer','admin') NOT NULL,
      account_id int NOT NULL,
      token_hash char(64) NOT NULL UNIQUE,
      expires_at timestamp NOT NULL,
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      KEY password_reset_account (account_type, account_id),
      KEY password_reset_expiry (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

module.exports = { up };