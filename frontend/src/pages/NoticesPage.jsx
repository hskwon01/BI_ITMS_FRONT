import React, { useEffect, useState } from 'react';
import CommonLayout from '../components/CommonLayout';
import { fetchNotices, createNotice, updateNotice, deleteNotice } from '../api/notices';
import { useUser } from '../contexts/UserContext';
import '../css/NoticesPage.css';

const NoticesPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', is_pinned: false });
  const [editing, setEditing] = useState(null);
  const [keyword, setKeyword] = useState('');
  const { user } = useUser();

  const load = async () => {
    setLoading(true);
    const res = await fetchNotices({ keyword });
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
      <div className="notices-container">
        <div className="notices-header">
          <h1>공지사항</h1>
          <p>서비스 공지사항을 확인하고 관리하세요.</p>
        </div>

        <div className="notices-toolbar">
          <div className="notices-search">
            <input placeholder="제목/내용 검색" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </div>
          {(user?.data?.role === 'admin' || user?.data?.role === 'itsm_team') && (
            <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ title: '', content: '', is_pinned: false }); }}>
              새 공지 작성
            </button>
          )}
        </div>

        {(user?.data?.role === 'admin' || user?.data?.role === 'itsm_team') && (
          <div className="notice-editor">
            <div className="row"><input placeholder="제목" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="row"><textarea placeholder="내용" rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required /></div>
            <div className="row inline">
              <label><input type="checkbox" checked={form.is_pinned} onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })} /> 상단 고정</label>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '.5rem' }}>
                <button className="btn btn-primary" onClick={onSubmit}>{editing ? '수정' : '등록'}</button>
                {editing && <button className="btn btn-secondary" onClick={() => { setEditing(null); setForm({ title: '', content: '', is_pinned: false }); }}>취소</button>}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div>불러오는 중...</div>
        ) : (
          <table className="notices-table">
            <thead>
              <tr>
                <th style={{ width: '60%' }}>제목</th>
                <th>등록일</th>
                {(user?.data?.role === 'admin' || user?.data?.role === 'itsm_team') && <th style={{ textAlign: 'right' }}>관리</th>}
              </tr>
            </thead>
            <tbody>
              {list.map((n) => (
                <tr key={n.id}>
                  <td className="notices-title">{n.title}{n.is_pinned ? <span className="notices-pin">📌</span> : null}</td>
                  <td>{new Date(n.created_at).toLocaleString('ko-KR')}</td>
                  {(user?.data?.role === 'admin' || user?.data?.role === 'itsm_team') && (
                    <td>
                      <div className="notices-actions">
                        <button className="btn" onClick={() => onEdit(n)}>수정</button>
                        <button className="btn danger" onClick={() => onDelete(n.id)}>삭제</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </CommonLayout>
  );
};

export default NoticesPage;

