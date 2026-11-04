import React, { useState } from 'react';
import { Plus, Edit, Trash2, FolderTree, Check } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';
import { slugify } from '../../utils/slugify';
import { useToast } from '../common/Toast';
import type { Category } from '../../types/blog';

export const CategoryManager: React.FC = () => {
  const { categories, articles, addCategory, updateCategory, deleteCategory } = useBlog();
  const { showToast } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#2D6A4F');
  const [icon, setIcon] = useState('Sprout');

  const availableIcons = ['Sprout', 'Cpu', 'Flower2', 'ShieldCheck', 'Leaf', 'Landmark'];

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setColor(cat.color);
    setIcon(cat.icon || 'Sprout');
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setColor('#2D6A4F');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      updateCategory(editingId, {
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        description: description.trim(),
        color,
        icon,
      });
      showToast('Category updated successfully!', 'success');
    } else {
      addCategory({
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        description: description.trim(),
        color,
        icon,
      });
      showToast(`Sector "${name}" created!`, 'success');
    }

    handleCancel();
  };

  const handleDelete = (id: string, catName: string) => {
    const postCount = articles.filter(
      a => a.category.toLowerCase() === catName.toLowerCase()
    ).length;

    if (postCount > 0) {
      const confirm = window.confirm(
        `Warning: There are ${postCount} article(s) assigned to "${catName}". Deleting this category may leave them unassigned. Proceed?`
      );
      if (!confirm) return;
    } else {
      if (!window.confirm(`Delete category "${catName}"?`)) return;
    }

    deleteCategory(id);
    showToast(`Category "${catName}" deleted.`, 'info');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-serif font-bold text-2xl text-[#143520]">
          Agricultural Sector Categories ({categories.length})
        </h2>
        <p className="text-xs text-[#8F7855] mt-0.5">
          Organize agronomy research into specialized domains such as Soil Health, Agro-Tech, Horticulture, and Silvopasture
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Card (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-[#143520] flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-[#256B3A]" />
              <span>{editingId ? 'Edit Sector Category' : 'Create New Sector'}</span>
            </h3>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="text-xs text-[#8F7855] hover:text-[#13341D]"
              >
                Cancel edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#6F5B3C] mb-1">
                Sector Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (!editingId) setSlug(slugify(e.target.value));
                }}
                placeholder="e.g. Controlled Environment Agriculture"
                className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6F5B3C] mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="controlled-environment-agriculture"
                className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs font-mono text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6F5B3C] mb-1">
                Domain Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Briefly define the scope of research, technologies, and farm types covered..."
                className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
              />
            </div>

            {/* Icon selection */}
            <div>
              <label className="block text-xs font-semibold text-[#6F5B3C] mb-1.5">
                Domain Icon Symbol
              </label>
              <div className="flex flex-wrap gap-2">
                {availableIcons.map(ic => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                      icon === ic
                        ? 'bg-[#143520] text-[#BFDC28] border-[#143520]'
                        : 'bg-[#F6F4EB] text-[#54432C] border-[#DDD4BC] hover:border-[#256B3A]'
                    }`}
                  >
                    <span>{ic}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#143520] hover:bg-[#1E542E] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {editingId ? <Check className="w-4 h-4 text-[#BFDC28]" /> : <Plus className="w-4 h-4 text-[#BFDC28]" />}
              <span>{editingId ? 'Save Category Changes' : 'Add Sector Category'}</span>
            </button>
          </form>
        </div>

        {/* Existing Categories Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#DDD4BC] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#EBE6D6]">
            <h3 className="font-serif font-bold text-base text-[#143520]">
              Active Taxonomy Hierarchy
            </h3>
            <p className="text-xs text-[#8F7855]">
              Click any sector to edit metadata or delete
            </p>
          </div>

          <div className="divide-y divide-[#F6F4EB]">
            {categories.map(cat => {
              const postCount = articles.filter(
                a => a.category.toLowerCase() === cat.name.toLowerCase()
              ).length;

              return (
                <div
                  key={cat.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FBFBF8] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-[#143520]">
                        {cat.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EBF1EA] text-[#1E542E]">
                        /{cat.slug}
                      </span>
                    </div>
                    <p className="text-xs text-[#6F5B3C] line-clamp-2">
                      {cat.description}
                    </p>
                    <div className="text-[11px] text-[#8F7855] pt-0.5">
                      {postCount} research paper{postCount === 1 ? '' : 's'} assigned
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => handleStartEdit(cat)}
                      className="p-2 text-[#256B3A] hover:bg-[#EBF1EA] rounded-xl transition-colors cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
