import { useState, useEffect } from 'react';
import { updateTask } from '../../api/tasks';
import { getChecklists, createChecklist, updateChecklist, deleteChecklist } from '../../api/tasks';
import { getActivityLogs } from '../../api/tasks';
import './TaskModal.css';

const PRIORITIES = [
  { value: 'low', label: 'Düşük', cls: 'p-low' },
  { value: 'medium', label: 'Orta', cls: 'p-medium' },
  { value: 'high', label: 'Yüksek', cls: 'p-high' },
];

export default function TaskModal({ task, stages, onClose, onUpdate, onDelete, onMove }) {
  const [editTitle, setEditTitle] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [editDesc, setEditDesc] = useState(false);
  const [checklists, setChecklists] = useState([]);
  const [logs, setLogs] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
  }, [task]);

  const reloadLogs = () => {
    getActivityLogs(task.id).then((r) => setLogs(r.data.data || [])).catch(() => {});
  };

  useEffect(() => {
    getChecklists(task.id).then((r) => setChecklists(r.data.data || r.data)).catch(() => {});
    reloadLogs();
  }, [task.id]);

  const saveTitle = async () => {
    if (!title.trim() || title === task.title) { setEditTitle(false); return; }
    setSaving(true);
    const res = await updateTask(task.id, { title: title.trim() });
    onUpdate(res.data);
    setSaving(false);
    setEditTitle(false);
    reloadLogs();
  };

  const saveDescription = async () => {
    setSaving(true);
    const res = await updateTask(task.id, { description });
    onUpdate(res.data);
    setSaving(false);
    setEditDesc(false);
  };

  const handlePriority = async (value) => {
    if (value === task.priority) return;
    const res = await updateTask(task.id, { priority: value });
    onUpdate(res.data);
    reloadLogs();
  };

  const handleDueDate = async (e) => {
    const res = await updateTask(task.id, { dueDate: e.target.value || null });
    onUpdate(res.data);
    reloadLogs();
  };

  const handleMove = async (e) => {
    const stageId = parseInt(e.target.value);
    if (stageId === task.stage_id) return;
    await onMove(task.id, stageId);
    onUpdate({ ...task, stage_id: stageId });
    reloadLogs();
  };

  const handleAddChecklist = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    const res = await createChecklist(task.id, { title: newItem.trim() });
    setChecklists((prev) => [...prev, res.data]);
    setNewItem('');
  };

  const toggleChecklist = async (item) => {
    const res = await updateChecklist(task.id, item.id, { isCompleted: !item.is_completed });
    setChecklists((prev) => prev.map((c) => c.id === item.id ? res.data : c));
  };

  const removeChecklist = async (id) => {
    await deleteChecklist(task.id, id);
    setChecklists((prev) => prev.filter((c) => c.id !== id));
  };

  const completedCount = checklists.filter((c) => c.is_completed).length;
  const progress = checklists.length > 0 ? Math.round((completedCount / checklists.length) * 100) : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* ── TITLE ── */}
        <div className="modal-title-wrap">
          {editTitle ? (
            <div className="title-edit">
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditTitle(false); }}
              />
              <button onClick={saveTitle} disabled={saving}>Kaydet</button>
              <button onClick={() => { setTitle(task.title); setEditTitle(false); }}>İptal</button>
            </div>
          ) : (
            <h2 className="modal-title" onClick={() => setEditTitle(true)}>{task.title}</h2>
          )}
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* ── TABS ── */}
        <div className="modal-tabs">
          <button className={activeTab === 'details' ? 'tab active' : 'tab'} onClick={() => setActiveTab('details')}>Detaylar</button>
          <button className={activeTab === 'checklist' ? 'tab active' : 'tab'} onClick={() => setActiveTab('checklist')}>
            Yapılacaklar {checklists.length > 0 && <span className="tab-badge">{completedCount}/{checklists.length}</span>}
          </button>
          <button className={activeTab === 'logs' ? 'tab active' : 'tab'} onClick={() => setActiveTab('logs')}>
            Aktivite {logs.length > 0 && <span className="tab-badge">{logs.length}</span>}
          </button>
        </div>

        <div className="modal-body">
          {/* ── DETAILS TAB ── */}
          {activeTab === 'details' && (
            <div className="details-tab">
              {/* Açıklama */}
              <div className="field-section">
                <div className="field-label">📝 Açıklama</div>
                {editDesc ? (
                  <div className="desc-edit">
                    <textarea
                      autoFocus
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Bir açıklama ekleyin..."
                    />
                    <div className="desc-actions">
                      <button onClick={saveDescription} disabled={saving}>Kaydet</button>
                      <button onClick={() => { setDescription(task.description || ''); setEditDesc(false); }}>İptal</button>
                    </div>
                  </div>
                ) : (
                  <div className="desc-display" onClick={() => setEditDesc(true)}>
                    {description || <span className="placeholder">Açıklama eklemek için tıklayın...</span>}
                  </div>
                )}
              </div>

              {/* Aşama */}
              <div className="field-section">
                <div className="field-label">📌 Aşama</div>
                <select className="field-select" value={task.stage_id || ''} onChange={handleMove}>
                  <option value="">— Seçilmedi —</option>
                  {stages.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Öncelik */}
              <div className="field-section">
                <div className="field-label">🔥 Öncelik</div>
                <div className="priority-buttons">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.value}
                      className={`priority-btn ${p.cls} ${task.priority === p.value ? 'selected' : ''}`}
                      onClick={() => handlePriority(p.value)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Son Tarih */}
              <div className="field-section">
                <div className="field-label">📅 Son Tarih</div>
                <input
                  type="date"
                  className="field-date"
                  value={task.due_date ? task.due_date.split('T')[0] : ''}
                  onChange={handleDueDate}
                />
              </div>

              {/* Sil */}
              <div className="field-section danger-zone">
                <button className="delete-task-btn" onClick={() => onDelete(task.id)}>
                  🗑 Görevi Sil
                </button>
              </div>
            </div>
          )}

          {/* ── CHECKLIST TAB ── */}
          {activeTab === 'checklist' && (
            <div className="checklist-tab">
              {checklists.length > 0 && (
                <div className="progress-wrap">
                  <span className="progress-pct">{progress}%</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              <ul className="checklist-list">
                {checklists.map((item) => (
                  <li key={item.id} className={`checklist-item ${item.is_completed ? 'done' : ''}`}>
                    <input
                      type="checkbox"
                      checked={item.is_completed}
                      onChange={() => toggleChecklist(item)}
                    />
                    <span className="checklist-text">{item.title}</span>
                    <button className="checklist-del" onClick={() => removeChecklist(item.id)}>✕</button>
                  </li>
                ))}
              </ul>

              <form className="checklist-form" onSubmit={handleAddChecklist}>
                <input
                  placeholder="Yeni madde ekle..."
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                />
                <button type="submit">Ekle</button>
              </form>
            </div>
          )}

          {/* ── LOGS TAB ── */}
          {activeTab === 'logs' && (
            <div className="logs-tab">
              {logs.length === 0 ? (
                <p className="no-logs">Henüz aktivite kaydı yok.</p>
              ) : (
                <ul className="log-list">
                  {logs.map((log) => (
                    <li key={log.id} className="log-item">
                      <div className="log-avatar">{(log.user_email || '?')[0].toUpperCase()}</div>
                      <div className="log-content">
                        <div className="log-desc">{log.description}</div>
                        <div className="log-time">
                          {new Date(log.created_at).toLocaleString('tr-TR')}
                          {' · '}{log.user_email}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
