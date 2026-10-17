async function up(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS employer_admin_messages (
      id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
      employer_id int NOT NULL,
      message text NOT NULL,
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      KEY employer_id (employer_id),
      CONSTRAINT employer_admin_messages_employer_fk FOREIGN KEY (employer_id)
        REFERENCES employers (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS employer_admin_message_recipients (
      message_id int NOT NULL,
      application_id int NOT NULL,
      PRIMARY KEY (message_id, application_id),
      KEY application_id (application_id),
      CONSTRAINT employer_admin_recipients_message_fk FOREIGN KEY (message_id)
        REFERENCES employer_admin_messages (id) ON DELETE CASCADE,
      CONSTRAINT employer_admin_recipients_application_fk FOREIGN KEY (application_id)
        REFERENCES applications (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

module.exports = { up };