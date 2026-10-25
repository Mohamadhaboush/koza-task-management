import './Card.css';

const PRIORITY_LABELS = { low: 'Düşük', medium: 'Orta', high: 'Yüksek' };
const PRIORITY_CLASS = { low: 'priority-low', medium: 'priority-medium', high: 'priority-high' };

export default function Card({ task, onClick }) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date();

  return (
    <div className="card" onClick={onClick}>
      <div className="card-title">{task.title}</div>

      <div className="card-meta">
        {task.priority && (
          <span className={`card-priority ${PRIORITY_CLASS[task.priority]}`}>
            {PRIORITY_LABELS[task.priority]}
          </span>
        )}
        {task.due_date && (
          <span className={`card-due ${isOverdue ? 'overdue' : ''}`}>
            📅 {new Date(task.due_date).toLocaleDateString('tr-TR')}
          </span>
        )}
      </div>
    </div>
  );
}
