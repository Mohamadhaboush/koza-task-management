import { useState } from 'react';
import './Sidebar.css';

export default function Sidebar({
  projects,
  activeProject,
  showArchived,
  onToggleShowArchived,
  onSelect,
  onCreateProject,
  onArchiveProject,
  onUnarchiveProject,
}) {
  const [newName, setNewName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await onCreateProject(newName.trim());
    setNewName('');
    setShowForm(false);
  };

  const handleContextMenu = (e, project) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, project });
  };

  const closeCtx = () => setContextMenu(null);

  return (
    <aside className="sidebar" onClick={closeCtx}>
      <div className="sidebar-header-row">
        <span className="sidebar-section-title">
          {showArchived ? 'ARŞİVLENMİŞ PROJELER' : 'PROJELER'}
        </span>
        <button
          className="toggle-archived-btn"
          onClick={onToggleShowArchived}
          title={showArchived ? 'Aktif projelere dön' : 'Arşivlenmiş projeleri göster'}
        >
          {showArchived ? '📂 Aktifler' : '📦 Arşiv'}
        </button>
      </div>

      <ul className="project-list">
        {projects.length === 0 && (
          <li className="no-projects-msg">
            {showArchived ? 'Arşivde proje yok.' : 'Henüz proje yok.'}
          </li>
        )}
        {projects.map((p) => (
          <li
            key={p.id}
            className={`project-item ${activeProject?.id === p.id ? 'active' : ''}`}
            onClick={() => onSelect(p)}
            onContextMenu={(e) => handleContextMenu(e, p)}
          >
            <span
              className="project-color"
              style={{ background: stringToColor(p.name) }}
            />
            <span className="project-name">{p.name}</span>
            <button
              className="project-action-trigger"
              onClick={(e) => {
                e.stopPropagation();
                handleContextMenu(e, p);
              }}
              title="Seçenekler"
            >
              ⋮
            </button>
          </li>
        ))}
      </ul>

      {!showArchived && (
        <>
          {showForm ? (
            <form className="new-project-form" onSubmit={handleCreate}>
              <input
                autoFocus
                placeholder="Proje adı..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setShowForm(false)}
              />
              <div className="form-actions">
                <button type="submit">Ekle</button>
                <button type="button" onClick={() => setShowForm(false)}>İptal</button>
              </div>
            </form>
          ) : (
            <button className="add-project-btn" onClick={() => setShowForm(true)}>
              + Yeni Proje
            </button>
          )}
        </>
      )}

      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.project.is_archived ? (
            <button
              className="ctx-item"
              onClick={() => {
                onUnarchiveProject(contextMenu.project.id);
                closeCtx();
              }}
            >
              📂 Arşivden Çıkar
            </button>
          ) : (
            <button
              className="ctx-item danger"
              onClick={() => {
                onArchiveProject(contextMenu.project.id);
                closeCtx();
              }}
            >
              📦 Arşivle
            </button>
          )}
        </div>
      )}
    </aside>
  );
}

// Proje adından deterministik renk üret
function stringToColor(str) {
  const colors = ['#0065ff', '#00875a', '#ff5630', '#6554c0', '#ff8b00', '#00b8d9', '#36b37e'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
