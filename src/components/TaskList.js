import { Edit, Trash2, X, Star } from 'lucide-react';

export default function TaskList({ 
    tasks, 
    editingTask, 
    setEditingTask, 
    updateTask, 
    toggleTaskStatus, 
    toggleImportant,
    deleteTask 
}) {
    return (
        <div className="space-y-2">
            {tasks.map((task) => (
                <div key={task.id_Tache} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow">
                    {editingTask?.id_Tache === task.id_Tache ? (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                updateTask(task.id_Tache, {
                                    titre: e.target.title.value,
                                    description: e.target.description.value,
                                    deadline: e.target.deadline.value,
                                    isImportant: task.isImportant
                                });
                            }}
                            className="flex-1 flex gap-2"
                        >
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
                            <button type="submit" className="text-blue-600">
                                <Edit size={16} />
                            </button>
                            <button type="button" onClick={() => setEditingTask(null)}>
                                <X size={16} />
                            </button>
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
                            <div className="ml-auto flex gap-2 items-center">
                                <button
                                    onClick={() => toggleImportant(task.id_Tache, task.isImportant)}
                                    className={`text-gray-500 hover:text-yellow-500 transition-colors ${
                                        task.isImportant ? 'text-yellow-500' : ''
                                    }`}
                                >
                                    <Star size={16} fill={task.isImportant ? "currentColor" : "none"} />
                                </button>
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
    );
}