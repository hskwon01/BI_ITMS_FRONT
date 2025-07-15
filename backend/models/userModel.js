const pool = require('../config/db');

const createUser = async (email, hashedPassword, name, company) => {
  const result = await pool.query(
    'INSERT INTO users (email, password, name, company_name) VALUES ($1, $2, $3, $4) RETURNING *',
    [email, hashedPassword, name, company]
  );
  return result.rows[0];
};

const getUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

const approveUserById = async (id, isApproved = true) => {
  const result = await pool.query(
    'UPDATE users SET is_approved = $1 WHERE id = $2 RETURNING *',
    [isApproved, id]
  );
  return result.rows[0];
};

const getAdminEmails = async () => {
  const result = await pool.query(
    'SELECT email FROM users WHERE role = $1',
    ['admin']
  );
  return result.rows.map(row => row.email);
};

module.exports = {
  createUser,
  getUserByEmail,
  approveUserById,
  getAdminEmails,
};