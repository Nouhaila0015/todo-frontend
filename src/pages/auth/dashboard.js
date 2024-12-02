import { useState, useEffect } from 'react';
import { Menu, Sun, Calendar, ChevronRight, Folder, Trash2, Edit, X, Plus, Star, LogOut } from 'lucide-react';
import axios from 'axios';
import TaskList from '../../components/TaskList';
import NotificationBell from '@/components/NotificationBell';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [todayTasks, setTodayTasks] = useState([]);
    const [editingTask, setEditingTask] = useState(null);
    const [editingProject, setEditingProject] = useState(null);
    const [newProject, setNewProject] = useState({ titre: '' });
    const [newTask, setNewTask] = useState({ 
        titre: '', 
        description: '', 
        deadline: '', 
        id_Status: 1,
        isImportant: false 
    });

    useEffect(() => {
        const verifySession = async () => {
            try {
                const res = await axios.get('http://localhost:3001/utilisateurs/verify-session', {
                    withCredentials: true,
                });
                setUser(res.data.user);
                fetchProjects();
                fetchTodayTasks();
            } catch (error) {
                console.error('Auth error:', error);
                window.location.href = '/auth/login';
            }
        };
        verifySession();
    }, []);
    
    const checkForSpecialProjects = async (task) => {
      // Vérifier pour "Ma journée"
      const today = new Date();
      const taskDate = new Date(task.deadline);
      const isToday = taskDate.toDateString() === today.toDateString();
  
      // Vérifier pour "Deadline"
      const isPastDue = taskDate < today && task.id_Status !== 2;
  
      try {
          // Obtenir les projets spéciaux
          const res = await axios.get('http://localhost:3001/projets', { withCredentials: true });
          const projects = res.data;
          
          const maJourneeProject = projects.find(p => p.titre === "Ma journée");
          const importantProject = projects.find(p => p.titre === "Important");
          const deadlineProject = projects.find(p => p.titre === "Deadline");
  
          if (!maJourneeProject || !importantProject || !deadlineProject) {
              console.error('Projets spéciaux non trouvés');
              return;
          }
  
          // Mettre à jour la tâche avec les bons projets
          if (task.isImportant) {
              await axios.put(`http://localhost:3001/todos/${task.id_Tache}`, 
                  { projetId: importantProject.id_projet },
                  { withCredentials: true }
              );
          }
  
          if (isToday) {
              await axios.put(`http://localhost:3001/todos/${task.id_Tache}`, 
                  { isToday: true },
                  { withCredentials: true }
              );
          }
  
          if (isPastDue) {
              await axios.put(`http://localhost:3001/todos/${task.id_Tache}`, 
                  { projetId: deadlineProject.id_projet },
                  { withCredentials: true }
              );
          }
      } catch (error) {
          console.error('Error updating special projects:', error);
      }
  };

    const fetchProjects = async () => {
        try {
            const res = await axios.get('http://localhost:3001/projets', { withCredentials: true });
            setProjects(res.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const handleAddProject = async (e) => {
        e.preventDefault();
        if (!newProject.titre) return;

        try {
            await axios.post(
                'http://localhost:3001/projets',
                {
                    titre: newProject.titre,
                    created_by: user.id,
                },
                { withCredentials: true }
            );
            setNewProject({ titre: '' });
            fetchProjects();
        } catch (error) {
            console.error('Error adding project:', error);
        }
    };

    const fetchTodayTasks = async () => {
        try {
            const res = await axios.get('http://localhost:3001/todos/today', { withCredentials: true });
            setTodayTasks(res.data);
        } catch (error) {
            console.error("Error fetching today's tasks:", error);
        }
    };

    const fetchTasks = async (projectId) => {
        try {
            const res = await axios.get(`http://localhost:3001/todos/projet/${projectId}`, { withCredentials: true });
            setTasks(res.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleAddTask = async (e) => {
      e.preventDefault();
      if (!selectedProject || !newTask.titre) return;
  
      try {
          // Créer la tâche dans le projet sélectionné
          const originalTask = await axios.post(
              'http://localhost:3001/todos',
              {
                  ...newTask,
                  projetId: selectedProject.id_projet,
                  isToday: false
              },
              { withCredentials: true }
          );
  
          // Vérifier si c'est une tâche pour aujourd'hui
          const today = new Date();
          const taskDate = new Date(newTask.deadline);
          const isToday = taskDate.toDateString() === today.toDateString();
  
          if (isToday) {
              // Trouver le projet "Ma journée"
              const res = await axios.get('http://localhost:3001/projets', { withCredentials: true });
              const maJourneeProject = res.data.find(p => p.titre === "Ma journée");
  
              if (maJourneeProject) {
                  // Créer une copie dans "Ma journée"
                  await axios.post(
                      'http://localhost:3001/todos',
                      {
                          ...newTask,
                          projetId: maJourneeProject.id_projet,
                          isToday: true
                      },
                      { withCredentials: true }
                  );
              }
          }
  
          setNewTask({ titre: '', description: '', deadline: '', id_Status: 1, isImportant: false });
          fetchTasks(selectedProject.id_projet);
          fetchTodayTasks();
      } catch (error) {
          console.error('Error adding task:', error);
      }
  };

    const toggleTaskStatus = async (taskId, currentStatus) => {
        try {
            await axios.put(
                `http://localhost:3001/todos/${taskId}`,
                {
                    id_Status: currentStatus === 1 ? 2 : 1,
                },
                { withCredentials: true }
            );
            if (selectedProject) {
                fetchTasks(selectedProject.id_projet);
            }
            fetchTodayTasks();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const toggleImportant = async (taskId, currentImportance) => {
      try {
          // Récupérer les détails de la tâche actuelle
          const taskResponse = await axios.get(`http://localhost:3001/todos/${taskId}`, { withCredentials: true });
          const task = taskResponse.data;
  
          // Trouver le projet Important
          const res = await axios.get('http://localhost:3001/projets', { withCredentials: true });
          const importantProject = res.data.find(p => p.titre === "Important");
          
          if (!importantProject) {
              console.error('Projet Important non trouvé');
              return;
          }
  
          if (!currentImportance) {
              // Créer une copie dans le projet Important
              await axios.post(
                  'http://localhost:3001/todos',
                  {
                      titre: task.titre,
                      description: task.description,
                      deadline: task.deadline,
                      id_Status: task.id_Status,
                      projetId: importantProject.id_projet,
                      isImportant: true
                  },
                  { withCredentials: true }
              );
          } else {
              // Supprimer la tâche du projet Important
              // Vous devrez ajouter une route pour trouver et supprimer la tâche dans le projet Important
              const importantTasks = await axios.get(
                  `http://localhost:3001/todos/projet/${importantProject.id_projet}`,
                  { withCredentials: true }
              );
              const taskToDelete = importantTasks.data.find(t => 
                  t.titre === task.titre && 
                  t.description === task.description
              );
              if (taskToDelete) {
                  await axios.delete(`http://localhost:3001/todos/${taskToDelete.id_Tache}`, { withCredentials: true });
              }
          }
  
          // Mettre à jour l'état important de la tâche originale
          await axios.put(
              `http://localhost:3001/todos/${taskId}`,
              { isImportant: !currentImportance },
              { withCredentials: true }
          );
          
          if (selectedProject) {
              fetchTasks(selectedProject.id_projet);
          }
          fetchTodayTasks();
      } catch (error) {
          console.error('Error toggling importance:', error);
      }
  };

    const deleteTask = async (taskId) => {
        try {
            await axios.delete(`http://localhost:3001/todos/${taskId}`, { withCredentials: true });
            if (selectedProject) {
                fetchTasks(selectedProject.id_projet);
            }
            fetchTodayTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const updateTask = async (taskId, updatedData) => {
      try {
          const response = await axios.put(
              `http://localhost:3001/todos/${taskId}`, 
              updatedData, 
              { withCredentials: true }
          );
  
          await checkForSpecialProjects(response.data);
          
          if (selectedProject) {
              fetchTasks(selectedProject.id_projet);
          }
          fetchTodayTasks();
          setEditingTask(null);
      } catch (error) {
          console.error('Error updating task:', error);
      }
  };

    const updateProject = async (projectId, newTitle) => {
        try {
            await axios.put(
                `http://localhost:3001/projets/${projectId}`,
                { titre: newTitle },
                { withCredentials: true }
            );
            fetchProjects();
            setEditingProject(null);
        } catch (error) {
            console.error('Error updating project:', error);
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
            console.error('Error deleting project:', error);
        }
    };
    const handleLogout = async () => {
      try {
          await axios.post('http://localhost:3001/utilisateurs/logout', {}, { withCredentials: true });
          window.location.href = '/auth/login';
      } catch (error) {
          console.error('Error during logout:', error);
      }
  };

    if (!user) return <div className="p-4 text-gray-700">Veuillez vous connecter pour continuer.</div>;

    return (
      <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-gray-100 border-r">
          {/* Header du Sidebar */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                    <NotificationBell />
                    <button onClick={handleLogout}>
                        <LogOut size={20} />
                    </button>
            </div>
              <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-200 rounded">
                      <Menu size={20} className="text-gray-700" />
                  </button>
                  <span className="font-medium text-gray-800">{user.username}</span>
              </div>
              <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-200 rounded transition-colors"
                  title="Déconnexion"
              >
                  <LogOut size={20} />
              </button>
          </div>

          {/* Formulaire de nouveau projet */}
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

          {/* Liste des projets */}
          <nav className="px-2 space-y-1">
              {projects.map((project) => (
                  <div key={project.id_projet} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-200">
                      {editingProject === project.id_projet ? (
                          <form
                              onSubmit={(e) => {
                                  e.preventDefault();
                                  updateProject(project.id_projet, e.target.title.value);
                              }}
                              className="flex-1 flex gap-2"
                          >
                              <input
                                  name="title"
                                  defaultValue={project.titre}
                                  className="flex-1 px-2 py-1 rounded border"
                              />
                              <button type="submit" className="text-blue-600">
                                  <Edit size={16} />
                              </button>
                              <button type="button" onClick={() => setEditingProject(null)}>
                                  <X size={16} />
                              </button>
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
                                  <button
                                      onClick={() => setEditingProject(project.id_projet)}
                                      className="text-gray-500 hover:text-blue-600"
                                  >
                                      <Edit size={16} />
                                  </button>
                                  <button
                                      onClick={() => deleteProject(project.id_projet)}
                                      className="text-gray-500 hover:text-red-600"
                                  >
                                      <Trash2 size={16} />
                                  </button>
                              </div>
                          </>
                      )}
                  </div>
              ))}
          </nav>
      </div>

      {/* Main Content */}
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
                          Mes tâches d'aujourd'hui
                      </>
                  )}
              </h1>
              <p className="mt-1 text-blue-50">
                  {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
          </header>

          <main className="flex-1 p-6 overflow-auto">
              {selectedProject && (
                  <form onSubmit={handleAddTask} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow mb-4">
                      <ChevronRight size={20} className="text-gray-400" />
                      <input
                          type="text"
                          placeholder="Titre de la tâche"
                          value={newTask.titre}
                          onChange={(e) => setNewTask({ ...newTask, titre: e.target.value })}
                          className="flex-1 outline-none text-gray-700"
                          required
                      />
                      <input
                          type="text"
                          placeholder="Description"
                          value={newTask.description}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          className="flex-1 outline-none text-gray-700 border-l px-2"
                          required
                      />
                      <input
                          type="date"
                          value={newTask.deadline}
                          onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                          className="outline-none text-gray-700 border-l px-2"
                          required
                      />
                      <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                          Ajouter
                      </button>
                  </form>
              )}

              <TaskList
                  tasks={selectedProject ? tasks : todayTasks}
                  editingTask={editingTask}
                  setEditingTask={setEditingTask}
                  updateTask={updateTask}
                  toggleTaskStatus={toggleTaskStatus}
                  toggleImportant={toggleImportant}
                  deleteTask={deleteTask}
              />
          </main>
      </div>
  </div>
);
}