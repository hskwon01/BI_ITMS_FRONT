import React, { useEffect, useState } from 'react';
import CommonLayout from '../components/CommonLayout';
import { fetchNotices, createNotice, updateNotice, deleteNotice } from '../api/notices';
import '../css/AdminAccessRequestPage.css';

const NoticesPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', is_pinned: false });
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    const res = await fetchNotices();
    setList(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await updateNotice(editing.id, form);
    } else {
      await createNotice(form);
    }
    setForm({ title: '', content: '', is_pinned: false });
    setEditing(null);
    load();
  };

  const onEdit = (n) => {
    setEditing(n);
    setForm({ title: n.title, content: n.content, is_pinned: n.is_pinned });
  };

  const onDelete = async (id) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    await deleteNotice(id);
    load();
  };

  return (
    <CommonLayout>
      <div className="admin-access-request-container">
        <div className="admin-access-header">
          <h1>공지사항</h1>
          <p className="admin-access-desc">서비스 공지사항을 확인하고 관리하세요.</p>
        </div>

        <form className="admin-access-form" onSubmit={onSubmit} style={{ marginBottom: 20 }}>
          <input
            placeholder="제목"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            placeholder="내용"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={5}
            required
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={form.is_pinned}
              onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })}
            /> 상단 고정
          </label>
          <button type="submit" className="btn-primary">
            {editing ? '수정' : '등록'}
          </button>
          {editing && (
            <button type="button" className="btn-secondary" onClick={() => { setEditing(null); setForm({ title: '', content: '', is_pinned: false }); }}>
              취소
            </button>
          )}
        </form>

        {loading ? (
          <div>불러오는 중...</div>
        ) : (
          <div className="admin-access-list">
            {list.map((n) => (
              <div key={n.id} className="admin-access-item">
                <div className="admin-access-info">
                  <h3 style={{ margin: 0 }}>{n.title} {n.is_pinned ? '📌' : ''}</h3>
                  <p style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{n.content}</p>
                  <small style={{ color: '#6b7280' }}>{new Date(n.created_at).toLocaleString('ko-KR')}</small>
                </div>
                <div className="admin-access-actions">
                  <button onClick={() => onEdit(n)}>수정</button>
                  <button onClick={() => onDelete(n.id)} className="danger">삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CommonLayout>
  );
};

export default NoticesPage;

