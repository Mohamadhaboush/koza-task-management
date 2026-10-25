import { useState } from 'react';
import Column from '../Column/Column';
import './Board.css';

export default function Board({ stages, tasks, isArchived, onCreateStage, onDeleteStage, onCreateTask, onMoveTask, onSelectTask }) {
  const [newColName, setNewColName] = useState('');
  const [showColForm, setShowColForm] = useState(false);

  const handleAddStage = async (e) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    await onCreateStage(newColName.trim());
    setNewColName('');
    setShowColForm(false);
  };

  return (
    <div className="board-scroll">
      <div className="board-columns">
        {stages.map((stage) => (
          <Column
            key={stage.id}
            stage={stage}
            tasks={tasks.filter((t) => t.stage_id === stage.id)}
            stages={stages}
            isArchived={isArchived}
            onDelete={() => onDeleteStage(stage.id)}
            onCreateTask={(title) => onCreateTask(stage.id, title)}
            onMoveTask={onMoveTask}
            onSelectTask={onSelectTask}
          />
        ))}

        {!isArchived && (
          <div className="add-column-wrap">
            {showColForm ? (
              <form className="add-column-form" onSubmit={handleAddStage}>
                <input
                  autoFocus
                  placeholder="Sütun adı..."
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Escape' && setShowColForm(false)}
                />
                <div className="col-form-actions">
                  <button type="submit">Sütun Ekle</button>
                  <button type="button" onClick={() => setShowColForm(false)}>✕</button>
                </div>
              </form>
            ) : (
              <button className="add-column-btn" onClick={() => setShowColForm(true)}>
                + Sütun Ekle
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
