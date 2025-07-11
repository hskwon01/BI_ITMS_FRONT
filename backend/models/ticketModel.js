const pool = require('../config/db');

const createTicket = async ({ title, description, urgency, product, customer_id }) => {
  const result = await pool.query(
    `INSERT INTO tickets (title, description, urgency, product, customer_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [title, description, urgency, product, customer_id]
  );
  return result.rows[0];
};


module.exports = { createTicket };
