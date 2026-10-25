import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getProjects,
  createProject,
  archiveProject,
  updateProject,
  getStages,
  createStage,
  deleteStage,
} from '../api/projects';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import Sidebar from '../components/Sidebar/Sidebar';
import Board from '../components/Board/Board';
import TaskModal from '../components/TaskModal/TaskModal';
import './BoardPage.css';

export default function BoardPage() {
  const { user, signOut } = useAuth();
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [stages, setStages] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);

  // Projeleri yükle
  const loadProjects = useCallback(async (isArchivedView = showArchived) => {
    try {
      const res = await getProjects({ is_archived: isArchivedView, limit: 50 });
      const loaded = res.data.data || [];
      setProjects(loaded);
      setActiveProject((prev) => {
        if (!prev) return loaded[0] || null;
        const exists = loaded.find((p) => p.id === prev.id);
        return exists || loaded[0] || null;
      });
    } catch {
      /* ignore */
    }
  }, [showArchived]);

  useEffect(() => {
    loadProjects(showArchived);
  }, [showArchived, loadProjects]);

  // Aktif projenin stage ve tasklerini yükle
  useEffect(() => {
    if (!activeProject) {
      setStages([]);
      setTasks([]);
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const [stagesRes, tasksRes] = await Promise.all([
          getStages(activeProject.id),
          getTasks({ projectId: activeProject.id, limit: 100 }),
        ]);
        setStages(stagesRes.data);
        setTasks(tasksRes.data.data || []);
      } catch (err) {
        console.error('Aşamalar veya görevler yüklenemedi:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeProject]);

  const handleToggleShowArchived = () => {
    setShowArchived((prev) => !prev);
  };

  const handleCreateProject = async (name) => {
    const res = await createProject({ name });
    await loadProjects(false);
    setActiveProject(res.data);
  };

  const handleArchiveProject = async (id) => {
    await archiveProject(id);
    await loadProjects(showArchived);
  };

  const handleUnarchiveProject = async (id) => {
    // Backend updateProject ile is_archived: false yapıyoruz
    await updateProject(id, { name: activeProject?.name, is_archived: false });
    await loadProjects(showArchived);
  };

  const handleCreateStage = async (name) => {
    const res = await createStage(activeProject.id, { name });
    setStages((prev) => [...prev, res.data]);
  };

  const handleDeleteStage = async (stageId) => {
    await deleteStage(activeProject.id, stageId);
    setStages((prev) => prev.filter((s) => s.id !== stageId));
    setTasks((prev) => prev.filter((t) => t.stage_id !== stageId));
  };

  const handleCreateTask = async (stageId, title) => {
    const res = await createTask({ projectId: activeProject.id, stageId, title });
    setTasks((prev) => [...prev, res.data]);
  };

  const handleMoveTask = async (taskId, newStageId) => {
    await updateTask(taskId, { stageId: newStageId });
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, stage_id: newStageId } : t))
    );
  };

  const handleDeleteTask = async (taskId) => {
    await deleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTask(null);
  };

  const handleTaskUpdate = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    setSelectedTask(updatedTask);
  };

  return (
    <div className="board-page">
      <header className="app-header">
        <div className="header-left">
          <span className="header-logo">🦋 Koza</span>
        </div>
        <div className="header-right">
          <span className="header-user">{user?.email}</span>
          <button className="signout-btn" onClick={signOut}>
            Çıkış
          </button>
        </div>
      </header>

      <div className="board-layout">
        <Sidebar
          projects={projects}
          activeProject={activeProject}
          showArchived={showArchived}
          onToggleShowArchived={handleToggleShowArchived}
          onSelect={setActiveProject}
          onCreateProject={handleCreateProject}
          onArchiveProject={handleArchiveProject}
          onUnarchiveProject={handleUnarchiveProject}
        />

        <main className="board-main">
          {activeProject ? (
            <>
              <div className="board-header">
                <h1 className="board-title">{activeProject.name}</h1>
                {activeProject.is_archived && (
                  <span className="archived-badge">Arşivlendi (Salt Okunur)</span>
                )}
              </div>
              {loading ? (
                <div className="board-loading">Yükleniyor...</div>
              ) : (
                <Board
                  stages={stages}
                  tasks={tasks}
                  isArchived={activeProject.is_archived}
                  onCreateStage={handleCreateStage}
                  onDeleteStage={handleDeleteStage}
                  onCreateTask={handleCreateTask}
                  onMoveTask={handleMoveTask}
                  onSelectTask={setSelectedTask}
                />
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                {showArchived ? '📦' : '📋'}
              </div>
              <p>
                {showArchived
                  ? 'Arşivde gösterilecek bir proje seçilmedi.'
                  : 'Soldaki panelden bir proje seçin veya oluşturun'}
              </p>
            </div>
          )}
        </main>
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          stages={stages}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
          onDelete={handleDeleteTask}
          onMove={handleMoveTask}
        />
      )}
    </div>
  );
}
