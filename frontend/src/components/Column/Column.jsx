import { useState } from 'react';
import Card from '../Card/Card';
import './Column.css';

export default function Column({ stage, tasks, stages, isArchived, onDelete, onCreateTask, onMoveTask, onSelectTask }) {
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    await onCreateTask(newCardTitle.trim());
    setNewCardTitle('');
    setShowForm(false);
  };

  return (
    <div className="column">
      <div className="column-header">
        <span className="column-title">{stage.name}</span>
        <span className="column-count">{tasks.length}</span>
        {!isArchived && (
          <button className="column-delete-btn" onClick={onDelete} title="Sütunu sil">✕</button>
        )}
      </div>

      <div className="column-cards">
        {tasks.map((task) => (
          <Card
            key={task.id}
            task={task}
            stages={stages}
            currentStageId={stage.id}
            onMove={onMoveTask}
            onClick={() => onSelectTask(task)}
          />
        ))}
      </div>

      {!isArchived && (
        showForm ? (
          <form className="add-card-form" onSubmit={handleAddCard}>
            <textarea
              autoFocus
              placeholder="Bu kart için bir başlık girin..."
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setShowForm(false);
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddCard(e);
                }
              }}
              rows={3}
            />
            <div className="card-form-actions">
              <button type="submit">Kart Ekle</button>
              <button type="button" onClick={() => setShowForm(false)}>✕</button>
            </div>
          </form>
        ) : (
          <button className="add-card-btn" onClick={() => setShowForm(true)}>
            + Kart ekle
          </button>
        )
      )}
    </div>
  );
}
