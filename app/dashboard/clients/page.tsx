'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/components/card';
import { Alert } from '@/components/alert';
import { Copy, Plus, Check, Loader2, Link as LinkIcon, Users, Building, Mail } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Client {
    id: string;
    name: string;
    company_name: string | null;
    email: string | null;
    logo_url: string | null;
    token: string;
    is_completed: boolean;
    created_at: string;
}

export default function ClientsPage() {
    const { data: session } = useSession();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        company_name: '',
        email: '',
        logo_url: '',
    });

    useEffect(() => {
        if (session?.user?.organization_id) {
            fetchClients();
        }
    }, [session]);

    const fetchClients = async () => {
        try {
            const res = await fetch(`/api/dashboard/clients?org=${session?.user?.organization_id}`);
            if (res.ok) {
                const data = await res.json();
                setClients(data);
            }
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError('');

        try {
            const res = await fetch('/api/dashboard/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const newClient = await res.json();
                setClients([newClient, ...clients]);
                setFormData({ name: '', company_name: '', email: '', logo_url: '' });
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to create client');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const copyToClipboard = (token: string, id: string) => {
        const url = `${window.location.origin}/r/${token}`;
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-base-content/60" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-base-content">Client Management</h1>
                <p className="text-base-content/70 mt-1">
                    Create unique review links for your clients and track submissions.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form to create a new client */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Plus className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-semibold text-base-content">New Review Link</h2>
                        </div>
                    </CardHeader>
                    <CardBody>
                        {error && (
                            <div className="mb-4">
                                <Alert type="error" message={error} onClose={() => setError('')} />
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-base-content/80 mb-1">
                                    Client Name *
                                </label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" />
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full pl-9 pr-3"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-base-content/80 mb-1">
                                    Company Name (Optional)
                                </label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" />
                                    <input
                                        type="text"
                                        name="company_name"
                                        value={formData.company_name}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full pl-9 pr-3"
                                        placeholder="Acme Corp"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-base-content/80 mb-1">
                                    Email (Optional)
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full pl-9 pr-3"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-base-content/80 mb-1">
                                    Client Logo (Optional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData({ ...formData, logo_url: reader.result as string });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="file-input file-input-bordered w-full"
                                />
                                {formData.logo_url && (
                                    <div className="mt-2">
                                        <img src={formData.logo_url} alt="Logo preview" className="h-10 object-contain rounded" />
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={creating}
                                className="btn btn-primary w-full mt-2 flex items-center justify-center gap-2"
                            >
                                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Unique Link'}
                            </button>
                        </form>
                    </CardBody>
                </Card>

                {/* List of generated links */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-base-content">Active & Past Links</h2>
                    </CardHeader>
                    <CardBody className="p-0">
                        {clients.length === 0 ? (
                            <div className="p-8 text-center text-base-content/70">
                                No client links generated yet.
                            </div>
                        ) : (
                            <div className="divide-y divide-base-200">
                                {clients.map((client) => (
                                    <div key={client.id} className="p-4 sm:p-6 hover:bg-base-200 transition-colors rounded-xl">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                {client.logo_url && (
                                                    <img src={client.logo_url} alt="Logo" className="w-10 h-10 object-contain rounded-md bg-base-100 p-1 shrink-0" />
                                                )}
                                                <div>
                                                    <h3 className="font-semibold text-base-content flex items-center gap-2">
                                                        {client.name}
                                                        {client.is_completed ? (
                                                            <span className="badge badge-sm badge-success gap-1">
                                                                <Check className="w-3 h-3" /> Reviewed
                                                            </span>
                                                        ) : (
                                                            <span className="badge badge-sm badge-warning">
                                                                Pending
                                                            </span>
                                                        )}
                                                    </h3>
                                                    {client.company_name && (
                                                        <p className="text-sm text-base-content/70 flex items-center gap-1 mt-1">
                                                            <Building className="w-3 h-3" /> {client.company_name}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-base-content/50 mt-1">
                                                        Created {new Date(client.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="hidden sm:block text-xs font-mono bg-base-200 text-base-content/70 px-3 py-2 rounded max-w-50 truncate">
                                                    .../r/{client.token.substring(0, 8)}...
                                                </div>
                                                <button
                                                    onClick={() => copyToClipboard(client.token, client.id)}
                                                    className={copiedId === client.id ? 'btn btn-sm btn-success' : 'btn btn-sm btn-ghost'}
                                                >
                                                    {copiedId === client.id ? (
                                                        <><Check className="w-4 h-4" /> Copied</>
                                                    ) : (
                                                        <><Copy className="w-4 h-4" /> Copy Link</>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
