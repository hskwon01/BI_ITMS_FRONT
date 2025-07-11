const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, getUserByEmail } = require('../models/userModel');
const JWT_SECRET = process.env.JWT_SECRET;
const { verifyToken } = require('../middleware/auth');

// 회원가입
router.post('/register', async (req, res) => {
  const { email, password, name, company } = req.body;
  try {
    const existing = await getUserByEmail(email);
    if (existing) return res.status(400).json({ message: '이미 등록된 이메일입니다.' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await createUser(email, hashed, name, company);
    res.status(201).json({ message: '회원가입 완료 (관리자 승인 후 로그인 가능)' });
  } catch (err) {
    res.status(500).json({ error: '회원가입 오류' });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await getUserByEmail(email);
    console.log(user);
    if (!user) return res.status(400).json({ message: '사용자를 찾을 수 없습니다.' });

    if (!user.is_approved) return res.status(403).json({ message: '관리자 승인이 필요합니다.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },  // role 추가!
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: '로그인 오류' });
  }
});

// 로그인 사용자 정보
router.get('/me', verifyToken, async (req, res) => {
  const user = await getUserByEmail(req.user.email);
  if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

  const { password, ...safeUser } = user;
  res.json(safeUser);
});

module.exports = router;
