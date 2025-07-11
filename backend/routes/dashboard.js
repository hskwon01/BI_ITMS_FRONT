const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// 관리자 대시보드: 티켓/사용자 통계
router.get('/stats', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM tickets WHERE status = '접수'`),
      pool.query(`SELECT COUNT(*) FROM tickets WHERE status = '진행중'`),
      pool.query(`SELECT COUNT(*) FROM tickets WHERE status = '답변 완료'`),
      pool.query(`SELECT COUNT(*) FROM tickets WHERE status = '종결'`),
      pool.query(`SELECT COUNT(*) FROM tickets`),
      pool.query(`SELECT COUNT(*) FROM users WHERE role = 'customer'`),
      pool.query(`SELECT COUNT(*) FROM users WHERE role = 'admin'`)
    ]);

    res.json({
      접수: result[0].rows[0].count,
      진행중: result[1].rows[0].count,
      답변완료: result[2].rows[0].count,
      종결: result[3].rows[0].count,
      전체티켓: result[4].rows[0].count,
      고객수: result[5].rows[0].count,
      관리자수: result[6].rows[0].count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '대시보드 통계 조회 실패' });
  }
});

// SLA 자동 종결 처리 기능
router.post('/auto-close', verifyToken, requireAdmin, async (req, res) => {
  try {
    // 1. 답변 완료 상태의 티켓
    const ticketRes = await pool.query(`
      SELECT t.id FROM tickets t
      WHERE t.status = '답변 완료'
    `);

    let closed = 0;

    for (const ticket of ticketRes.rows) {
      const replyRes = await pool.query(
        `SELECT r.*, u.role
        FROM ticket_replies r
        JOIN users u ON r.author_id = u.id
        WHERE r.ticket_id = $1
        ORDER BY r.created_at DESC
        LIMIT 1`,
        [ticket.id]
      );
      const lastReply = replyRes.rows[0];
      if (!lastReply) continue;

      // 2. 마지막 댓글이 관리자이고 7일 지났으면 종결 처리
      const isAdmin = lastReply.role === 'admin';
      const isOld = new Date() - new Date(lastReply.created_at) > 7 * 24 * 60 * 60 * 1000;

      if (isAdmin && isOld) {
        await pool.query(
          `UPDATE tickets SET status = '종결' WHERE id = $1`,
          [ticket.id]
        );
        closed++;
      }
    }

    res.json({ message: `${closed}건 자동 종결 처리됨` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '자동 종결 처리 실패' });
  }
});
module.exports = router;
