import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import axios from 'axios';

const ProjectInvite = ({ projectId }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState('Viewer');
    const [error, setError] = useState('');

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/collaborations', {
                email,
                projectId,
                permission
            }, { withCredentials: true });
            setEmail('');
            setIsModalOpen(false);
            setError('');
        } catch (error) {
            setError(error.response?.data?.message || "Une erreur s'est produite");
        }
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="p-1 text-gray-500 hover:text-blue-600"
                title="Inviter des membres"
            >
                <Plus size={16} />
            </button>

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
        </>
    );
};

export default ProjectInvite;