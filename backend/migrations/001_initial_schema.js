async function up(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
      email varchar(150) NOT NULL UNIQUE,
      password_hash varchar(255) NOT NULL,
      created_at timestamp NOT NULL DEFAULT current_timestamp()
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS job_seekers (
      id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
      national_id varchar(50) NOT NULL UNIQUE,
      full_name varchar(150) NOT NULL,
      email varchar(150) NOT NULL UNIQUE,
      telephone varchar(30) DEFAULT NULL,
      location varchar(255) DEFAULT NULL,
      father_name varchar(150) DEFAULT NULL,
      mother_name varchar(150) DEFAULT NULL,
      province varchar(100) DEFAULT NULL,
      district varchar(100) DEFAULT NULL,
      sector varchar(100) DEFAULT NULL,
      cell varchar(100) DEFAULT NULL,
      village varchar(100) DEFAULT NULL,
      tvet_school varchar(200) DEFAULT NULL,
      qualification varchar(200) DEFAULT NULL,
      opportunity_interest varchar(255) DEFAULT NULL,
      password_hash varchar(255) NOT NULL,
      created_at timestamp NOT NULL DEFAULT current_timestamp()
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS employers (
      id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
      company_name varchar(200) NOT NULL,
      email varchar(150) NOT NULL UNIQUE,
      password_hash varchar(255) NOT NULL,
      sector varchar(150) DEFAULT NULL,
      description text DEFAULT NULL,
      location varchar(255) DEFAULT NULL,
      logo_url varchar(500) DEFAULT NULL,
      jobs longtext DEFAULT NULL,
      status enum('pending','approved','rejected') DEFAULT 'pending',
      created_at timestamp NOT NULL DEFAULT current_timestamp()
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS opportunities (
      id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
      employer_id int NOT NULL,
      title varchar(255) NOT NULL,
      description text DEFAULT NULL,
      location varchar(255) DEFAULT NULL,
      type varchar(100) DEFAULT NULL,
      salary varchar(100) DEFAULT NULL,
      requirements text DEFAULT NULL,
      deadline date DEFAULT NULL,
      status varchar(30) DEFAULT 'open',
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      KEY employer_id (employer_id),
      CONSTRAINT opportunities_employer_fk FOREIGN KEY (employer_id)
        REFERENCES employers (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS applications (
      id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
      student_id int NOT NULL,
      opportunity_id int NOT NULL,
      cover_letter text DEFAULT NULL,
      status enum('pending','reviewing','accepted','rejected') DEFAULT 'pending',
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      UNIQUE KEY unique_application (student_id, opportunity_id),
      KEY opportunity_id (opportunity_id),
      CONSTRAINT applications_student_fk FOREIGN KEY (student_id)
        REFERENCES job_seekers (id) ON DELETE CASCADE,
      CONSTRAINT applications_opportunity_fk FOREIGN KEY (opportunity_id)
        REFERENCES opportunities (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

module.exports = { up };