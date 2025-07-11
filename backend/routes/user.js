const express = require('express');
const router = express.Router();
const { approveUserById } = require('../models/userModel');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const pool = require('../config/db');

// 사용자 승인 또는 승인 취소
router.patch('/:id/approve', verifyToken, requireAdmin, async (req, res) => {
  const userId = req.params.id;
  const { approve } = req.body;  // true 또는 false

  try {
    const updatedUser = await approveUserById(userId, approve);
    if (!updatedUser) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

    res.json({ message: `사용자 ${approve ? '승인됨' : '승인 취소됨'}`, user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: '승인 처리 중 오류 발생' });
  }
});

// 모든 사용자 조회 (관리자만)
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, company_name, is_approved, role FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: '사용자 목록 조회 실패' });
  }
});

module.exports = router;
