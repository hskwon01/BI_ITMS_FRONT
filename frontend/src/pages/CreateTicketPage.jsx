import React, { useState, useEffect } from 'react';
import { createTicket, uploadTicketFiles } from '../api/ticket';
import { useNavigate } from 'react-router-dom';
import DragDropFileUpload from '../components/DragDropFileUpload';
import CommonLayout from '../components/CommonLayout';
import '../css/CreateTicketPage.css';

const CreateTicketPage = () => {
  const [ticketType, setTicketType] = useState('SR'); // 'SR' or 'SM'
  const [form, setForm] = useState({
    title: '',
    description: '',
    urgency: '',
    product: '',
    platform: '',
    sw_version: '',
    os: '',
    client_company: '',
  });
  const [otherData, setOtherData] = useState({
    product: '',
    sw_version: '',
    os: '',
    platform: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const productOptions = [
    'webMethods API Gateway',
    'webMethods Integration Server',
    'webMethods B2B Trading Networks',
    'My webMethods Server',
    'webMethods Terracotta',
    'webMethods Universal Messaging',
    'iChain',
    '기타',
  ];
  const defaultVersionOptions = ['11.1', '10.15', '10.11', '10.7', '10.5', '10.3', '10.1', '9.X', '기타'];
  const iChainVersionOptions = ['4', '5', '기타'];
  const osOptions = ['Red Hat Enterprise Linux', 'Windows Server (Microsoft)', 'CentOS', 'openSUSE', 'z/Linux', '기타'];
  const platformOptions = ['On Premises', 'AWS', 'Microsoft Azure', 'Google Cloud Platform', '기타'];
  const clientCompanyOptions = ['Glovis', 'MnM', 'ASC Korea', '기타'];

  const versionOptions = form.product === 'iChain' ? iChainVersionOptions : defaultVersionOptions;

  useEffect(() => {
    setForm((prevForm) => ({ ...prevForm, sw_version: '' }));
    setOtherData((prev) => ({ ...prev, sw_version: '' }));
  }, [form.product]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOtherChange = (e) => {
    setOtherData({ ...otherData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const getFinalValue = (fieldName) => {
        if (form[fieldName] === '기타') {
          return `기타(${otherData[fieldName]})`;
        }
        return form[fieldName];
      };

      // FormData를 사용하여 파일과 데이터를 함께 전송
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('urgency', form.urgency);
      formData.append('product', getFinalValue('product'));
      formData.append('platform', getFinalValue('platform'));
      formData.append('sw_version', getFinalValue('sw_version'));
      formData.append('os', getFinalValue('os'));
      formData.append('client_company', form.client_company);
      formData.append('ticket_type', ticketType);

      // 파일들을 FormData에 추가
      files.forEach((file) => {
        formData.append('files', file);
      });

      // createTicket API 호출 시 FormData 사용
      await createTicket(formData, token);
      showToast('티켓이 성공적으로 등록되었습니다.');
      navigate('/my-tickets');
    } catch (error) {
      const errorMessage = error.response?.data?.message || '티켓 등록에 실패했습니다.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CommonLayout>
      <div className="create-ticket-container">
        {toast.show && (
          <div className={`toast-notification ${toast.type}`}>
            {toast.message}
          </div>
        )}

        <div className="create-ticket-card">
          <div className="create-ticket-header">
            <h1>기술 지원 요청</h1>
            <p className="create-ticket-desc">새로운 기술 지원 티켓을 등록하세요</p>
          </div>

          <div className="ticket-type-selector">
            <button
              className={`ticket-type-btn ${ticketType === 'SR' ? 'active' : ''}`}
              onClick={() => setTicketType('SR')}
            >
              SR 티켓
            </button>
            <button
              className={`ticket-type-btn ${ticketType === 'SM' ? 'active' : ''}`}
              onClick={() => setTicketType('SM')}
            >
              SM 티켓
            </button>
          </div>

          <form onSubmit={handleSubmit} className="create-ticket-form">
            <div className="form-group">
              <label htmlFor="title">제목 *</label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="티켓 제목을 입력하세요"
                value={form.title}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">설명 *</label>
              <textarea
                id="description"
                name="description"
                placeholder="문제 상황을 자세히 설명해주세요"
                value={form.description}
                onChange={handleChange}
                className="form-textarea"
                rows="6"
                required
              />
            </div>

            {ticketType === 'SR' ? (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="urgency">긴급도 *</label>
                    <select
                      id="urgency"
                      name="urgency"
                      value={form.urgency}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="">긴급도를 선택하세요</option>
                      <option value="낮음">낮음</option>
                      <option value="보통">보통</option>
                      <option value="높음">높음</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="product">관련 제품</label>
                    <select
                      id="product"
                      name="product"
                      value={form.product}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="">제품을 선택하세요</option>
                      {productOptions.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    {form.product === '기타' && (
                      <input
                        type="text"
                        name="product"
                        placeholder="제품명 입력"
                        value={otherData.product}
                        onChange={handleOtherChange}
                        className="form-input other-input"
                      />
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="platform">Platform</label>
                    <select
                      id="platform"
                      name="platform"
                      value={form.platform}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="">Platform을 선택하세요</option>
                      {platformOptions.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    {form.platform === '기타' && (
                      <input
                        type="text"
                        name="platform"
                        placeholder="Platform 입력"
                        value={otherData.platform}
                        onChange={handleOtherChange}
                        className="form-input other-input"
                      />
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="sw_version">S/W Version</label>
                    <select
                      id="sw_version"
                      name="sw_version"
                      value={form.sw_version}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="">버전을 선택하세요</option>
                      {versionOptions.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                    {form.sw_version === '기타' && (
                      <input
                        type="text"
                        name="sw_version"
                        placeholder="버전 입력"
                        value={otherData.sw_version}
                        onChange={handleOtherChange}
                        className="form-input other-input"
                      />
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="os">OS</label>
                    <select
                      id="os"
                      name="os"
                      value={form.os}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="">OS를 선택하세요</option>
                      {osOptions.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                    {form.os === '기타' && (
                      <input
                        type="text"
                        name="os"
                        placeholder="OS 입력"
                        value={otherData.os}
                        onChange={handleOtherChange}
                        className="form-input other-input"
                      />
                    )}
                  </div>
                </div>
              </>
            ) : ( // SM Ticket Form
              <>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="urgency">긴급도 *</label>
                        <select
                        id="urgency"
                        name="urgency"
                        value={form.urgency}
                        onChange={handleChange}
                        className="form-select"
                        required
                        >
                        <option value="">긴급도를 선택하세요</option>
                        <option value="낮음">낮음</option>
                        <option value="보통">보통</option>
                        <option value="높음">높음</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="client_company">고객사 *</label>
                        <select
                        id="client_company"
                        name="client_company"
                        value={form.client_company}
                        onChange={handleChange}
                        className="form-select"
                        required
                        >
                        <option value="">고객사를 선택하세요</option>
                        {clientCompanyOptions.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                        </select>
                    </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="files">첨부 파일</label>
              <DragDropFileUpload
                files={files}
                setFiles={setFiles}
                filePreviews={filePreviews}
                setFilePreviews={setFilePreviews}
                maxFiles={5}
                maxSize={10 * 1024 * 1024}
                acceptedTypes={[
                  'image/*',
                  'application/pdf',
                  'text/*',
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'application/vnd.ms-excel',
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                ]}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/my-tickets')}
                className="btn-secondary"
              >
                취소
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? '등록 중...' : '티켓 등록'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </CommonLayout>
  );
};

export default CreateTicketPage;
