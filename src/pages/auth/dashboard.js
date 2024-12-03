import { useState, useEffect } from 'react';
import { Menu, Sun, Calendar, ChevronRight, Folder, Trash2, Edit, X, Plus, Star, LogOut } from 'lucide-react';
import axios from 'axios';
import TaskList from '../../components/TaskList';
import NotificationBell from '@/components/NotificationBell';
import ProjectInvite from '@/components/ProjectInvite';
import { io } from 'socket.io-client';
import styles from '@/styles/AuthHome.module.css';

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
        <div className="flex h-screen bg-gradient-to-br from-purple-50 to-blue-100">
            {/* Sidebar */}
            <div className="w-80 bg-white p-6 flex flex-col h-full">
                {/* Logo et titre */}
                <div className="flex items-center gap-3 mb-8">
                    <div className={styles.logo}></div>
                    <h1 className="text-xl font-bold text-purple-600">DAUPHINEPLANNER</h1>
                </div>
    
                {/* User Info */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center">
                        <span className="text-lg font-medium text-purple-700">
                            {user.username.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1">
                        <div className="text-sm text-gray-900 font-medium">Hello {user.username}</div>
                        <div className="text-xs text-gray-800">{user.email}</div>
                    </div>
                    <NotificationBell />
                </div>
    
                {/* Nouveau projet */}
                <form onSubmit={handleAddProject} className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Nouveau projet"
                            value={newProject.titre}
                            onChange={(e) => setNewProject({ titre: e.target.value })}
                            className="w-full px-4 py-2 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
                            required
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </form>
    
                {/* Navigation des projets */}
                <nav className="space-y-1 flex-1 overflow-y-auto">
                    {projects.map((project) => (
                        <div
                            key={project.id_projet}
                            className={`group flex items-center justify-between p-3 rounded-lg transition-all ${
                                selectedProject?.id_projet === project.id_projet
                                    ? 'bg-purple-100'
                                    : 'hover:bg-gray-50'
                            }`}
                        >
                            {editingProject === project.id_projet ? (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        updateProject(project.id_projet, e.target.title.value);
                                    }}
                                    className="flex flex-1 items-center gap-2"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <input
                                        name="title"
                                        defaultValue={project.titre}
                                        className="flex-1 px-3 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        autoFocus
                                    />
                                    <button type="submit" className="p-1 text-blue-600 hover:text-blue-700">
                                        <Edit size={16} />
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingProject(null);
                                        }}
                                        className="p-1 text-gray-400 hover:text-gray-600"
                                    >
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
                                        className="flex items-center gap-3 text-gray-700 flex-1"
                                    >
                                        {project.titre === "Ma journée" ? (
                                            <Sun size={18} className="text-purple-600" />
                                        ) : project.titre === "Important" ? (
                                            <Star size={18} className="text-purple-600" />
                                        ) : project.titre === "Deadline" ? (
                                            <Calendar size={18} className="text-purple-600" />
                                        ) : (
                                            <Folder size={18} className="text-purple-600" />
                                        )}
                                        <span>{project.titre}</span>
                                    </button>
                                    {!["Ma journée", "Important", "Deadline"].includes(project.titre) && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-1 text-gray-400 hover:text-purple-600"
                                            >
                                                <Plus size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingProject(project.id_projet);
                                                }}
                                                className="p-1 text-gray-400 hover:text-purple-600"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteProject(project.id_projet);
                                                }}
                                                className="p-1 text-gray-400 hover:text-red-600"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </nav>
    
                {/* Déconnexion */}
                <button
                    onClick={handleLogout}
                    className="mt-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <LogOut size={18} />
                    <span>Déconnexion</span>
                </button>
            </div>
    
            {/* Main Content */}
            <div className="flex-1 p-6">
                <div className="bg-white rounded-lg h-full flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b">
                        <h1 className="text-2xl font-semibold flex items-center gap-3 text-gray-800">
                            {selectedProject ? (
                                <>
                                    {selectedProject.titre === "Ma journée" ? (
                                        <Sun size={24} className="text-purple-600" />
                                    ) : selectedProject.titre === "Important" ? (
                                        <Star size={24} className="text-purple-600" />
                                    ) : selectedProject.titre === "Deadline" ? (
                                        <Calendar size={24} className="text-purple-600" />
                                    ) : (
                                        <Folder size={24} className="text-purple-600" />
                                    )}
                                    {selectedProject.titre}
                                </>
                            ) : (
                                <>
                                    <Sun size={24} className="text-purple-600" />
                                    Ma journée
                                </>
                            )}
                        </h1>
                        <p className="mt-1 text-gray-500">
                            {new Date().toLocaleDateString('fr-FR', { 
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long'
                            })}
                        </p>
                    </div>
    
                    {/* Contenu des tâches */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        <form onSubmit={handleAddTask} className="flex items-center gap-3 mb-6">
                            <input
                                type="text"
                                placeholder="Nouvelle tâche"
                                value={newTask.titre}
                                onChange={(e) => setNewTask({ ...newTask, titre: e.target.value })}
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Description"
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
                            />
                            <input
                                type="date"
                                value={newTask.deadline}
                                onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
                                required
                            />
                            <button
                                type="submit"
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Ajouter
                            </button>
                        </form>
    
                        <TaskList
                            tasks={selectedProject ? tasks : todayTasks}
                            editingTask={editingTask}
                            setEditingTask={setEditingTask}
                            updateTask={updateTask}
                            toggleTaskStatus={toggleTaskStatus}
                            toggleImportant={toggleImportant}
                            deleteTask={deleteTask}
                        />
                    </div>
                </div>
            </div>
    
            {/* Modal d'invitation */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Inviter un membre</h3>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
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
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
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
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
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
                                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
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