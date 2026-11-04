import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';
import { slugify } from '../../utils/slugify';
import { useToast } from '../common/Toast';

export const TagManager: React.FC = () => {
  const { tags, articles, addTag, updateTag, deleteTag } = useBlog();
  const { showToast } = useToast();

  const [newTagName, setNewTagName] = useState('');
  const [newTagDesc, setNewTagDesc] = useState('');
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTagName.replace(/^#/, '').trim();
    if (!clean) return;

    if (tags.some(t => t.name.toLowerCase() === clean.toLowerCase())) {
      showToast('A tag with this name already exists', 'error');
      return;
    }

    addTag({
      name: clean,
      slug: slugify(clean),
      description: newTagDesc.trim() || `Articles covering #${clean} methodology`,
    });

    setNewTagName('');
    setNewTagDesc('');
    showToast(`Tag #${clean} created!`, 'success');
  };

  const handleStartEdit = (tagId: string, currentName: string) => {
    setEditingTagId(tagId);
    setEditName(currentName);
  };

  const handleSaveEdit = (tagId: string) => {
    const clean = editName.replace(/^#/, '').trim();
    if (!clean) return;

    updateTag(tagId, {
      name: clean,
      slug: slugify(clean),
    });

    setEditingTagId(null);
    setEditName('');
    showToast(`Tag updated to #${clean}`, 'success');
  };

  const handleDelete = (tagId: string, tagName: string) => {
    if (window.confirm(`Delete tag #${tagName}? It will also be detached from all articles.`)) {
      deleteTag(tagId);
      showToast(`Tag #${tagName} removed.`, 'info');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-serif font-bold text-2xl text-[#143520]">
          Agronomic Practice Tags ({tags.length})
        </h2>
        <p className="text-xs text-[#8F7855] mt-0.5">
          Standardize cross-cutting practices like #SoilHealth, #DripIrrigation, #Silvopasture, and #Biochar
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Create Tag Card (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#143520] flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#256B3A]" />
            <span>Add Practice Tag</span>
          </h3>

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#6F5B3C] mb-1">
                Tag Name *
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 bg-[#EBE6D6] border border-r-0 border-[#DDD4BC] rounded-l-xl text-xs font-bold text-[#8F7855]">
                  #
                </span>
                <input
                  type="text"
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  placeholder="e.g. Mycorrhizae"
                  className="flex-1 px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-r-xl text-xs text-[#13341D] font-medium focus:outline-hidden focus:border-[#256B3A]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6F5B3C] mb-1">
                Short Purpose / Definition
              </label>
              <textarea
                rows={2}
                value={newTagDesc}
                onChange={e => setNewTagDesc(e.target.value)}
                placeholder="Identifies studies involving mycorrhizal fungal colonization..."
                className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#143520] hover:bg-[#1E542E] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#BFDC28]" />
              <span>Create Tag</span>
            </button>
          </form>
        </div>

        {/* Existing Tags Grid & Management (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EBE6D6]">
            <div>
              <h3 className="font-serif font-bold text-base text-[#143520]">
                Clean & Standardize Active Tags
              </h3>
              <p className="text-xs text-[#8F7855]">
                Renaming a tag propagates updates across all associated articles
              </p>
            </div>
            <span className="text-xs font-semibold text-[#256B3A]">
              {tags.length} Active Tags
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tags.map(tag => {
              const postCount = articles.filter(a =>
                a.tags.some(t => t.toLowerCase() === tag.name.toLowerCase())
              ).length;

              const isEditing = editingTagId === tag.id;

              return (
                <div
                  key={tag.id}
                  className="p-3.5 rounded-xl border border-[#EBE6D6] hover:border-[#32864A] bg-[#FBFBF8] flex items-center justify-between gap-3 group transition-all"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <span className="text-xs font-bold text-[#8F7855]">#</span>
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="flex-1 px-2 py-1 bg-white border border-[#256B3A] rounded-lg text-xs font-semibold text-[#143520] focus:outline-hidden"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(tag.id)}
                        className="p-1 text-emerald-700 hover:bg-emerald-100 rounded"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingTagId(null)}
                        className="p-1 text-[#8F7855] hover:bg-[#EBE6D6] rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-[#143520]">
                            #{tag.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#EBF1EA] text-[#1E542E] font-medium">
                            {postCount} article{postCount === 1 ? '' : 's'}
                          </span>
                        </div>
                        {tag.description && (
                          <p className="text-[11px] text-[#6F5B3C] truncate mt-0.5">
                            {tag.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0">
                        <button
                          onClick={() => handleStartEdit(tag.id, tag.name)}
                          className="p-1.5 text-[#256B3A] hover:bg-[#EBF1EA] rounded-lg transition-colors cursor-pointer"
                          title="Rename tag"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tag.id, tag.name)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete tag"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
