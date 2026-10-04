'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminGuard from '@/components/admin/AdminGuard';
import { getNewsPosts, createNewsPost, updateNewsPost, deleteNewsPost, FirestoreNews } from '@/lib/firestore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChevronLeft, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { DeleteModal } from '@/components/admin/DeleteModal';

export default function AdminNews() {
  const [news, setNews] = useState<FirestoreNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FirestoreNews | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    body: '',
    imageUrl: '',
    publishedAt: ''
  });

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    try {
      setLoading(true);
      const data = await getNewsPosts();
      setNews(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      body: '',
      imageUrl: '',
      publishedAt: ''
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const toDatetimeLocal = (date: Date) => {
    if (!date) return '';
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const handleEdit = (post: FirestoreNews) => {
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      body: post.body,
      imageUrl: post.imageUrl || '',
      publishedAt: toDatetimeLocal(post.publishedAt)
    });
    setEditingId(post.id);
    setIsFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const deletedPost = deleteTarget;
    setIsDeleting(true);
    setError(null);
    setNews((current) => current.filter((post) => post.id !== deletedPost.id));
    try {
      await deleteNewsPost(deletedPost.id);
      setDeleteTarget(null);
    } catch (err: any) {
      setNews((current) => [...current, deletedPost].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()));
      setError(err.message || 'Failed to delete news post');
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      const payload = {
        ...formData,
        publishedAt: new Date(formData.publishedAt)
      };

      if (editingId) {
        await updateNewsPost(editingId, payload);
      } else {
        await createNewsPost(payload);
      }
      await fetchNews();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save news post');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <AdminGuard>
      <div className="pt-24 container-content min-h-screen pb-16 text-text-primary">
        <div className="mb-6">
          <Link href="/admin" className="text-text-secondary hover:text-accent font-mono text-sm flex items-center inline-flex">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-sans font-bold">Manage News</h1>
          <Button onClick={() => setIsFormOpen(!isFormOpen)} variant={isFormOpen ? 'secondary' : 'primary'}>
            {isFormOpen ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Create New Post</>}
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger font-mono text-sm">
            {error}
          </div>
        )}

        {isFormOpen && (
          <div className="bg-secondary border border-border p-6 mb-8">
            <h2 className="text-xl font-sans font-bold mb-4 border-b border-border pb-2">
              {editingId ? 'Edit Post' : 'Create New Post'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-mono text-text-secondary uppercase">Title</label>
                  <Input name="title" value={formData.title} onChange={handleInputChange} required className="w-full" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-mono text-text-secondary uppercase">Excerpt</label>
                  <Input name="excerpt" value={formData.excerpt} onChange={handleInputChange} required className="w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono text-text-secondary uppercase">Published Date</label>
                  <Input type="datetime-local" name="publishedAt" value={formData.publishedAt} onChange={handleInputChange} required className="w-full bg-secondary border-border text-text-primary" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono text-text-secondary uppercase">Image URL (Optional)</label>
                  <Input name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} className="w-full" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-text-secondary uppercase">Body (Markdown/HTML or Text)</label>
                <textarea 
                  name="body" 
                  value={formData.body} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full h-48 bg-primary border border-border p-3 text-text-primary focus:border-accent focus:outline-none transition-colors"
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {formLoading ? 'Saving...' : 'Save Post'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="space-y-4">
            {news.length === 0 ? (
              <div className="text-center py-10 text-text-secondary border border-border bg-secondary">
                No news posts found. Create one to get started.
              </div>
            ) : (
              news.map((post) => (
                <div key={post.id} className="border border-border bg-secondary p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-sans font-bold text-accent">{post.title}</h3>
                    <div className="text-sm text-text-secondary font-mono mt-1 mb-2">
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </div>
                    <p className="text-sm text-text-primary line-clamp-2">{post.excerpt}</p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <Button variant="secondary" size="sm" onClick={() => handleEdit(post)}>
                      <Edit2 className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button variant="danger" size="sm" aria-label={`Delete ${post.title}`} onClick={() => setDeleteTarget(post)}>
                      <Trash2 className="w-4 h-4" aria-hidden />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <DeleteModal
        isOpen={!!deleteTarget}
        title="Delete news post?"
        description={deleteTarget ? `Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.` : ''}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminGuard>
  );
}
