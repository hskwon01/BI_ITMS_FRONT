import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchNotices, updateNotice, deleteNotice } from '../api/notices';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';
import '../css/AdminNoticesPage.css';

const AdminNoticesPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', is_pinned: false });
  const [keyword, setKeyword] = useState('');
  const { user } = useUser();
  const { showSuccess, showError, showConfirm } = useToast();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const load = async () => {
    setLoading(true);
    const offset = (page - 1) * pageSize;
    const res = await fetchNotices({ keyword, limit: pageSize, offset });
    setList(res.data.items || []);
    setTotal(res.data.total || 0);
    setLoading(false);
  };

  useEffect(() => { load(); }, [page]);

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.content.trim()) {
      showError('제목과 내용을 모두 입력해주세요.');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      formData.append('is_pinned', form.is_pinned);
      if (form.files && form.files.length) {
        [...form.files].forEach((f) => formData.append('files', f));
      }
      await updateNotice(editing.id, formData);
      showSuccess('공지사항이 수정되었습니다.');
      setForm({ title: '', content: '', is_pinned: false });
      setEditing(null);
      load();
    } catch (err) {
      console.error('수정 실패:', err);
      showError('수정에 실패했습니다.');
    }
  };

  const onEdit = (n) => {
    setEditing(n);
    setForm({ title: n.title, content: n.content, is_pinned: n.is_pinned });
  };

  const onDelete = async (id) => {
    showConfirm(
      '이 공지사항을 삭제하시겠습니까?',
      async () => {
        try {
          await deleteNotice(id);
          showSuccess('공지사항이 삭제되었습니다.');
          load();
        } catch (err) {
          console.error('삭제 실패:', err);
          showError('삭제에 실패했습니다.');
        }
      }
    );
  };

  return (
    <div className="admin-notices-container">
      <div className="admin-notices-header">
        <h1>공지사항 관리</h1>
        <p>서비스 공지사항을 관리하고 작성하세요.</p>
      </div>
      
      <div className="admin-notices-toolbar">
        <div className="admin-notices-search-section">
          <div className="search-container">
                         <div className="search-input-wrapper">
               <input 
                 className="search-input"
                 placeholder="공지사항 제목이나 내용을 검색하세요..." 
                 value={keyword} 
                 onChange={(e) => setKeyword(e.target.value)} 
                 onKeyDown={(e) => { 
                   if(e.key === 'Enter') { 
                     setPage(1); 
                     load(); 
                   } 
                 }} 
               />
              {keyword && (
                <button 
                  className="search-clear"
                  onClick={() => {
                    setKeyword('');
                    setPage(1);
                    setTimeout(load, 100);
                  }}
                  title="검색어 지우기"
                >
                  ✕
                </button>
              )}
            </div>
            <button 
              className="search-button"
              onClick={() => {
                setPage(1);
                load();
              }}
            >
              검색
            </button>
          </div>
          {keyword && (
            <div className="search-info">
              '<span className="search-keyword">{keyword}</span>' 검색 결과: {total}개
            </div>
          )}
        </div>
        
        <Link to="/notices/create" className="admin-notices-create-btn">
          새 공지 작성
        </Link>
      </div>

      {editing && (
        <div className="admin-notice-editor">
          <h3 className="editor-title">공지사항 수정</h3>
          <div className="editor-form">
            <div className="form-row">
              <input 
                placeholder="제목" 
                value={form.title} 
                onChange={(e) => setForm({ ...form, title: e.target.value })} 
                required 
              />
            </div>
            <div className="form-row">
              <textarea 
                placeholder="내용" 
                rows={6} 
                value={form.content} 
                onChange={(e) => setForm({ ...form, content: e.target.value })} 
                required 
              />
            </div>
            <div className="form-row">
              <input 
                type="file" 
                multiple 
                onChange={(e) => setForm({ ...form, files: e.target.files })} 
              />
            </div>
            <div className="form-row inline">
              <label>
                <input 
                  type="checkbox" 
                  checked={form.is_pinned} 
                  onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })} 
                /> 
                상단 고정
              </label>
              <div className="editor-actions">
                <button className="btn btn-primary" onClick={onSubmit}>수정 완료</button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => { 
                    setEditing(null); 
                    setForm({ title: '', content: '', is_pinned: false }); 
                  }}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="admin-notices-loading">
          <div className="loading-spinner"></div>
          <p>공지사항을 불러오는 중...</p>
        </div>
      ) : list.length === 0 ? (
        <div className="admin-notices-empty">
          {keyword ? (
            <>
              <div className="empty-icon">🔍</div>
              <h3>검색 결과가 없습니다</h3>
              <p>
                '<span className="search-keyword">{keyword}</span>'에 대한 검색 결과가 없습니다.<br/>
                다른 검색어로 시도해보세요.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setKeyword('');
                  setPage(1);
                  setTimeout(load, 100);
                }}
              >
                전체 공지사항 보기
              </button>
            </>
          ) : (
            <>
              <div className="empty-icon">📢</div>
              <h3>등록된 공지사항이 없습니다</h3>
              <p>아직 등록된 공지사항이 없습니다.</p>
              <Link to="/notices/create" className="btn btn-primary">
                첫 공지사항 작성하기
              </Link>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="admin-notices-table-wrapper">
            <table className="admin-notices-table">
                             <thead>
                 <tr>
                   <th style={{ width: '60%' }}>제목</th>
                   <th>등록일</th>
                   <th style={{ width: '120px', textAlign: 'center' }}>관리</th>
                 </tr>
               </thead>
              <tbody>
                {list.map((n) => (
                  <tr key={n.id} className="admin-notices-row">
                                         <td className="admin-notices-title">
                       <Link to={`/notices/${n.id}`} className="notice-title-link">
                         {n.title}
                         {n.is_pinned ? <span className="notices-pin">📌</span> : null}
                       </Link>
                     </td>
                     <td>{new Date(n.created_at).toLocaleString('ko-KR')}</td>
                     <td style={{ textAlign: 'center' }}>
                       <div className="admin-notices-actions">
                         <button className="btn btn-edit" onClick={() => onEdit(n)}>수정</button>
                         <button className="btn btn-delete" onClick={() => onDelete(n.id)}>삭제</button>
                       </div>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="admin-notices-pagination">
            <button 
              className="btn btn-pagination" 
              disabled={page===1} 
              onClick={()=>setPage(p=>p-1)}
            >
              이전
            </button>
            <span className="pagination-info">
              {page} / {Math.max(1, Math.ceil(total/pageSize))}
            </span>
            <button 
              className="btn btn-pagination" 
              disabled={page>=Math.ceil(total/pageSize)} 
              onClick={()=>setPage(p=>p+1)}
            >
              다음
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminNoticesPage;
