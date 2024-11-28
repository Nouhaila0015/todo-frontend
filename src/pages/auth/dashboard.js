import { useState, useEffect } from 'react';
import { Menu, Sun, Calendar, ChevronRight, Folder, Trash2, Edit, X, Plus } from 'lucide-react';
import axios from 'axios';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [newProject, setNewProject] = useState({ titre: '' });
  const [newTask, setNewTask] = useState({
    titre: '',
    description: '',
    deadline: '',
    id_Status: 1
  });

  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await axios.get('http://localhost:3001/utilisateurs/verify-session', { withCredentials: true });
        setUser(res.data.user);
        fetchProjects();
      } catch (error) {
        console.error("Auth error:", error);
      }
    };
    verifySession();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:3001/projets', { withCredentials: true });
      setProjects(res.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/projets', newProject, { withCredentials: true });
      setNewProject({ titre: '' });
      fetchProjects();
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const fetchTasks = async (projectId) => {
    try {
      const res = await axios.get(`http://localhost:3001/todos/projet/${projectId}`, { withCredentials: true });
      setTasks(res.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!selectedProject || !newTask.titre) return;

    try {
      await axios.post('http://localhost:3001/todos', {
        ...newTask,
        projetId: selectedProject.id_projet
      }, { withCredentials: true });
      
      setNewTask({ titre: '', description: '', deadline: '', id_Status: 1 });
      fetchTasks(selectedProject.id_projet);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const toggleTaskStatus = async (taskId, currentStatus) => {
    try {
      await axios.put(`http://localhost:3001/todos/${taskId}`, {
        id_Status: currentStatus === 1 ? 2 : 1
      }, { withCredentials: true });
      fetchTasks(selectedProject.id_projet);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:3001/todos/${taskId}`, { withCredentials: true });
      fetchTasks(selectedProject.id_projet);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const updateTask = async (taskId, updatedData) => {
    try {
      await axios.put(`http://localhost:3001/todos/${taskId}`, updatedData, { withCredentials: true });
      fetchTasks(selectedProject.id_projet);
      setEditingTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await axios.delete(`http://localhost:3001/projets/${projectId}`, { withCredentials: true });
      fetchProjects();
      if (selectedProject?.id_projet === projectId) {
        setSelectedProject(null);
        setTasks([]);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const updateProject = async (projectId, newTitle) => {
    try {
      await axios.put(`http://localhost:3001/projets/${projectId}`, { titre: newTitle }, { withCredentials: true });
      fetchProjects();
      setEditingProject(null);
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  if (!user) return <div className="p-4 text-gray-700">Veuillez vous connecter pour continuer.</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-72 bg-gray-100 border-r">
        <div className="p-4 flex items-center justify-between">
          <button className="p-2 hover:bg-gray-200 rounded">
            <Menu size={20} className="text-gray-700" />
          </button>
          <span className="font-medium text-gray-800">{user.username}</span>
        </div>

        <form onSubmit={handleAddProject} className="px-4 mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nouveau projet"
              value={newProject.titre}
              onChange={(e) => setNewProject({ titre: e.target.value })}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
        </form>

        <nav className="px-2 space-y-1">
          {projects.map(project => (
            <div key={project.id_projet} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-200">
              {editingProject === project.id_projet ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  updateProject(project.id_projet, e.target.title.value);
                }} className="flex-1 flex gap-2">
                  <input
                    name="title"
                    defaultValue={project.titre}
                    className="flex-1 px-2 py-1 rounded border"
                  />
                  <button type="submit" className="text-blue-600"><Edit size={16} /></button>
                  <button type="button" onClick={() => setEditingProject(null)}><X size={16} /></button>
                </form>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      fetchTasks(project.id_projet);
                    }}
                    className={`flex items-center gap-3 ${
                      selectedProject?.id_projet === project.id_projet ? 'text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <Folder size={16} />
                    <span>{project.titre}</span>
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingProject(project.id_projet)} className="text-gray-500 hover:text-blue-600">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => deleteProject(project.id_projet)} className="text-gray-500 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="bg-blue-600 text-white p-6">
          <h1 className="text-2xl font-semibold flex items-center gap-3">
            {selectedProject ? (
              <>
                <Folder size={24} />
                {selectedProject.titre}
              </>
            ) : (
              <>
                <Sun size={24} />
                Mes tâches
              </>
            )}
          </h1>
          <p className="mt-1 text-blue-50">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </header>

        <main className="flex-1 p-6">
          <form onSubmit={handleAddTask} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow mb-4">
            <ChevronRight size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Titre de la tâche"
              value={newTask.titre}
              onChange={(e) => setNewTask({...newTask, titre: e.target.value})}
              className="flex-1 outline-none text-gray-700"
              required
              disabled={!selectedProject}
            />
            <input
              type="text"
              placeholder="Description"
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              className="flex-1 outline-none text-gray-700 border-l px-2"
              required
              disabled={!selectedProject}
            />
            <input
              type="date"
              value={newTask.deadline}
              onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
              className="outline-none text-gray-700 border-l px-2"
              required
              disabled={!selectedProject}
            />
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
              disabled={!selectedProject}
            >
              Ajouter
            </button>
          </form>

          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id_Tache} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow">
                {editingTask?.id_Tache === task.id_Tache ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    updateTask(task.id_Tache, {
                      titre: e.target.title.value,
                      description: e.target.description.value,
                      deadline: e.target.deadline.value
                    });
                  }} className="flex-1 flex gap-2">
                    <input
                      name="title"
                      defaultValue={task.titre}
                      className="flex-1 px-2 py-1 rounded border"
                    />
                    <input
                      name="description"
                      defaultValue={task.description}
                      className="flex-1 px-2 py-1 rounded border"
                    />
                    <input
                      type="date"
                      name="deadline"
                      defaultValue={task.deadline?.split('T')[0]}
                      className="px-2 py-1 rounded border"
                    />
                    <button type="submit" className="text-blue-600"><Edit size={16} /></button>
                    <button type="button" onClick={() => setEditingTask(null)}><X size={16} /></button>
                  </form>
                ) : (
                  <>
                    <input
                      type="checkbox"
                      checked={task.id_Status === 2}
                      onChange={() => toggleTaskStatus(task.id_Tache, task.id_Status)}
                      className="w-5 h-5 rounded-full border-2"
                    />
                    <span className={`text-gray-700 ${task.id_Status === 2 ? 'line-through' : ''}`}>
                      {task.titre}
                    </span>
                    <span className="text-gray-600 text-sm">{task.description}</span>
                    <span className="text-gray-600 text-sm">
                      {new Date(task.deadline).toLocaleDateString('fr-FR')}
                    </span>
                    <div className="ml-auto flex gap-2">
                      <button onClick={() => setEditingTask(task)} className="text-gray-500 hover:text-blue-600">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => deleteTask(task.id_Tache)} className="text-gray-500 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}