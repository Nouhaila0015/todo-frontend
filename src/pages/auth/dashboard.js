import { useState, useEffect } from 'react';
import { Menu, Sun, Calendar, ChevronRight, Folder, Trash2, Edit, X, Plus, Star, LogOut } from 'lucide-react';
import axios from 'axios';
import TaskList from '../../components/TaskList';
import NotificationBell from '@/components/NotificationBell';
import ProjectInvite from '@/components/ProjectInvite';
import { io } from 'socket.io-client';

export default function Dashboard() {
    const [socket, setSocket] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
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
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [invitingProjectId, setInvitingProjectId] = useState(null);
    const [inviteEmail, setInviteEmail] = useState('');
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState('Viewer');
    const [error, setError] = useState('');

    useEffect(() => {
        const newSocket = io('http://localhost:3001');
        setSocket(newSocket);

        return () => newSocket.disconnect();
    }, []);

    useEffect(() => {
        if (socket && selectedProject) {
            socket.emit('joinProject', selectedProject.id_projet);
        }
    }, [socket, selectedProject]);

    useEffect(() => {
        if (socket) {
            socket.on('taskUpdate', (updatedTask) => {
                if (selectedProject && selectedProject.id_projet === updatedTask.projectId) {
                    fetchTasks(selectedProject.id_projet);
                }
            });
        }
    }, [socket, selectedProject]);

    

    




    useEffect(() => {
        const verifySession = async () => {
            try {
                const res = await axios.get('http://localhost:3001/utilisateurs/verify-session', {
                    withCredentials: true,
                });
                setUser(res.data.user);
    
                const projectsResponse = await axios.get('http://localhost:3001/projets', { withCredentials: true });
                setProjects(projectsResponse.data);
    
                // Trouver le projet "Ma journée" dans les projets récupérés
                const maJourneeProject = projectsResponse.data.find((project) => project.titre === "Ma journée");
    
                if (maJourneeProject) {
                    setSelectedProject(maJourneeProject); // Sélectionne automatiquement "Ma journée"
                    fetchTasks(maJourneeProject.id_projet); // Charge les tâches de "Ma journée"
                } else {
                    console.warn("Le projet 'Ma journée' n'a pas été trouvé.");
                }
            } catch (error) {
                console.error('Auth error:', error);
                window.location.href = '/auth/login';
            }
        };
        verifySession();
    }, []);
    
    
    
    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            // Create collaboration
            const collabResponse = await axios.post('http://localhost:3001/collaborations/invite', {
                email,
                projectId: selectedProject.id_projet,
                permission
            }, { withCredentials: true });
    
            // Create a notification for the invited user
            await axios.post('http://localhost:3001/notifications', {
                user_email: email,
                message: `You have been invited to join the project "${selectedProject.titre}"`,
                type: 'PROJECT_INVITATION',
                projectId: selectedProject.id_projet
            }, { withCredentials: true });
    
            setIsModalOpen(false);
            setEmail('');
            setError('');
        } catch (error) {
            setError(error.response?.data?.message || "An error occurred");
        }
    };

    const handleInviteSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                'http://localhost:3001/collaborations/invite',
                {
                    email: inviteEmail,
                    projectId: invitingProjectId,
                    permission: 'Viewer'
                },
                { withCredentials: true }
            );
            setIsInviteModalOpen(false);
            setInviteEmail('');
        } catch (error) {
            console.error('Error inviting user:', error);
        }
    };

    const checkForSpecialProjects = async (task) => {
        const today = new Date();
        const taskDate = new Date(task.deadline);
        const isToday = taskDate.toDateString() === today.toDateString();
        const isPastDue = taskDate < today && task.id_Status !== 2;

        try {
            const res = await axios.get('http://localhost:3001/projets', { withCredentials: true });
            const projects = res.data;
            const maJourneeProject = projects.find(p => p.titre === "Ma journée");
            const importantProject = projects.find(p => p.titre === "Important");
            const deadlineProject = projects.find(p => p.titre === "Deadline");

            if (!maJourneeProject || !importantProject || !deadlineProject) {
                console.error('Special projects not found');
                return;
            }

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
            // Create the task and let the backend handle "Ma journée" and "Deadline" logic
            await axios.post(
                'http://localhost:3001/todos',
                {
                    ...newTask,
                    projetId: selectedProject.id_projet, // Pass the selected project ID
                },
                { withCredentials: true }
            );
    
            setNewTask({ titre: '', description: '', deadline: '', id_Status: 1, isImportant: false });
            fetchTasks(selectedProject.id_projet);
            fetchTodayTasks(); // Refresh "Ma journée"
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
            // Fetch task details directly
            const taskResponse = await axios.get(`http://localhost:3001/todos/${taskId}`, { withCredentials: true });
            const task = taskResponse.data;
    
            // Get the "Important" project details
            const res = await axios.get('http://localhost:3001/projets', { withCredentials: true });
            const importantProject = res.data.find(p => p.titre === "Important");
    
            if (!importantProject) {
                console.error('Projet Important non trouvé');
                return;
            }
    
            // Prevent duplication by checking if the task is already in the "Important" project
            const importantTasks = await axios.get(`http://localhost:3001/todos/projet/${importantProject.id_projet}`, {
                withCredentials: true,
            });
            const isAlreadyInImportant = importantTasks.data.some(
                (t) => t.titre === task.titre && t.deadline === task.deadline
            );
    
            if (!currentImportance && !isAlreadyInImportant) {
                // Add to the "Important" project if not already marked important
                await axios.post(
                    'http://localhost:3001/todos',
                    {
                        titre: task.titre,
                        description: task.description,
                        deadline: task.deadline,
                        id_Status: task.id_Status,
                        projetId: importantProject.id_projet,
                        isImportant: true,
                    },
                    { withCredentials: true }
                );
            } else if (currentImportance && isAlreadyInImportant) {
                // Remove the task from the "Important" project
                const taskToDelete = importantTasks.data.find(
                    (t) => t.titre === task.titre && t.deadline === task.deadline
                );
                if (taskToDelete) {
                    await axios.delete(`http://localhost:3001/todos/${taskToDelete.id_Tache}`, { withCredentials: true });
                }
            }
    
            // Update the original task's `isImportant` status
            await axios.put(
                `http://localhost:3001/todos/${taskId}`,
                { isImportant: !currentImportance },
                { withCredentials: true }
            );
    
            // Refresh tasks
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
            const response = await axios.put(`http://localhost:3001/todos/${taskId}`, updatedData, { withCredentials: true });
            
            if (socket && selectedProject) {
                socket.emit('taskUpdated', {
                    projectId: selectedProject.id_projet,
                    task: response.data
                });
            }

            fetchTasks(selectedProject.id_projet);
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

    if (!user) return <div className="p-4 text-gray-700">Please log in to continue.</div>;

    return (
        <div className="flex h-screen bg-gray-50">
            <div className="w-72 bg-gray-100 border-r">
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-200 rounded">
                            <Menu size={20} className="text-gray-700" />
                        </button>
                        <span className="font-medium text-gray-800">{user.username}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <NotificationBell />
                        <button 
                            onClick={handleLogout}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-200 rounded transition-colors"
                            title="Déconnexion"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
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
                                        <ProjectInvite projectId={project.id_projet} />
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









    
            {/* Modal d'invitation */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Inviter un membre</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>
    
                        <form onSubmit={handleInvite}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
    
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Permission
                                </label>
                                <select
                                    value={permission}
                                    onChange={(e) => setPermission(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Viewer">Lecteur</option>
                                    <option value="Editor">Éditeur</option>
                                </select>
                            </div>
    
                            {error && (
                                <p className="text-red-500 text-sm mb-4">{error}</p>
                            )}
    
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                            >
                                Inviter
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
    
}