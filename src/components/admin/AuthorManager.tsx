import React, { useState, useRef } from 'react';
import { UserCheck, Plus, Edit, Trash2, Check, Award, Building, Upload, Link2, RefreshCw } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';
import { useToast } from '../common/Toast';
import { compressImage } from '../../utils/imageCompressor';
import type { Author } from '../../types/blog';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
];

export const AuthorManager: React.FC = () => {
  const { authors, articles, addAuthor, updateAuthor, deleteAuthor, uploadImage } = useBlog();
  const { showToast } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [institution, setInstitution] = useState('');
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0]);
  const [avatarTab, setAvatarTab] = useState<'upload' | 'embed'>('upload');
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [bio, setBio] = useState('');

  const handleStartEdit = (auth: Author) => {
    setEditingId(auth.id);
    setName(auth.name);
    setRole(auth.role);
    setInstitution(auth.institution || '');
    setAvatar(auth.avatar);
    setBio(auth.bio);
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setRole('');
    setInstitution('');
    setAvatar(PRESET_AVATARS[0]);
    setBio('');
    setIsAvatarUploading(false);
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP)', 'error');
      return;
    }

    setIsAvatarUploading(true);
    try {
      // Compress avatar for optimal edge caching and retina sharpness
      const result = await compressImage(file, 400, 0.85);
      const cdnUrl = await uploadImage(result.dataUrl, file.name);
      setAvatar(cdnUrl);
      showToast('Author photo uploaded successfully!', 'success');
    } catch {
      showToast('Failed to upload author photo. Please try again.', 'error');
    } finally {
      setIsAvatarUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      showToast('Please provide an author name and agronomic role.', 'error');
      return;
    }

    if (editingId) {
      updateAuthor(editingId, {
        name: name.trim(),
        role: role.trim(),
        institution: institution.trim(),
        avatar: avatar.trim() || PRESET_AVATARS[0],
        bio: bio.trim(),
      });
      showToast(`Author "${name}" updated successfully!`, 'success');
    } else {
      addAuthor({
        name: name.trim(),
        role: role.trim(),
        institution: institution.trim() || 'Mizoram Agronomy Collective',
        avatar: avatar.trim() || PRESET_AVATARS[0],
        bio: bio.trim() || 'Contributing agricultural specialist and field investigator.',
      });
      showToast(`New contributor "${name}" added!`, 'success');
    }

    handleCancel();
  };

  const handleDelete = (id: string, authorName: string) => {
    if (authors.length <= 1) {
      showToast('At least one author must remain in the publication system.', 'error');
      return;
    }
    if (window.confirm(`Are you sure you want to remove author profile "${authorName}"?`)) {
      deleteAuthor(id);
      showToast(`Author "${authorName}" removed.`, 'info');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-serif font-bold text-2xl text-[#143520]">
          Contributing Authors & Agronomists ({authors.length})
        </h2>
        <p className="text-xs text-[#8F7855] mt-0.5">
          Manage research contributors, institutions, credentials, and bios displayed on article bylines
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Card (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-[#143520] flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#256B3A]" />
              <span>{editingId ? 'Edit Contributor Profile' : 'Add New Contributor'}</span>
            </h3>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="text-xs text-[#8F7855] hover:text-[#13341D] cursor-pointer"
              >
                Cancel edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#6F5B3C] mb-1">
                Full Name & Title *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Dr. C. Lalremruata"
                className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6F5B3C] mb-1">
                Agronomic Role / Specialty *
              </label>
              <input
                type="text"
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g. Hill Horticulture & Soil Health Specialist"
                className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6F5B3C] mb-1">
                Institution / Farm / Station
              </label>
              <input
                type="text"
                value={institution}
                onChange={e => setInstitution(e.target.value)}
                placeholder="e.g. ICAR Research Complex / College of Agriculture, Selesih"
                className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
              />
            </div>

            {/* Avatar Photo (Upload or Embed) */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#6F5B3C]">
                Author Avatar / Photo
              </label>

              {/* Mode switch */}
              <div className="flex items-center gap-1.5 p-1 bg-[#F6F4EB] rounded-xl border border-[#DDD4BC]/60 w-fit">
                <button
                  type="button"
                  onClick={() => setAvatarTab('upload')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    avatarTab === 'upload'
                      ? 'bg-[#143520] text-white shadow-xs'
                      : 'text-[#54432C] hover:bg-[#EBE6D6]'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarTab('embed')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    avatarTab === 'embed'
                      ? 'bg-[#143520] text-white shadow-xs'
                      : 'text-[#54432C] hover:bg-[#EBE6D6]'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Embed via Link</span>
                </button>
              </div>

              {/* Avatar Uploader / Embed Box */}
              <div className="flex items-start gap-3.5 p-3.5 bg-[#FAF8F3] rounded-2xl border border-[#DDD4BC]">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#256B3A]/30 shrink-0 bg-[#EFECE1] flex items-center justify-center shadow-xs">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).src = PRESET_AVATARS[0];
                      }}
                    />
                  ) : (
                    <UserCheck className="w-6 h-6 text-[#8F7855]" />
                  )}

                  {isAvatarUploading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  {avatarTab === 'upload' ? (
                    <div>
                      <input
                        ref={avatarFileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={handleAvatarFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={isAvatarUploading}
                        onClick={() => avatarFileInputRef.current?.click()}
                        className="w-full py-2.5 px-3 bg-white hover:bg-[#F6F4EB] border border-dashed border-[#256B3A]/60 rounded-xl text-xs font-semibold text-[#143520] flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                      >
                        {isAvatarUploading ? (
                          <>
                            <RefreshCw className="w-4 h-4 text-[#256B3A] animate-spin" />
                            <span>Compressing & Uploading to KV...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-[#256B3A]" />
                            <span>Upload Photo from Device</span>
                          </>
                        )}
                      </button>
                      <p className="text-[10px] text-[#8F7855] mt-1">
                        Select a JPG, PNG, or WebP photo from your phone or PC
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="relative">
                        <input
                          type="url"
                          value={avatar}
                          onChange={e => setAvatar(e.target.value)}
                          placeholder="https://..."
                          className="w-full pl-8 pr-3 py-2 bg-white border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                        />
                        <Link2 className="w-3.5 h-3.5 text-[#8F7855] absolute left-2.5 top-2.5" />
                      </div>
                      <p className="text-[10px] text-[#8F7855] mt-1">
                        Paste any public image address (Unsplash, CDN, etc.)
                      </p>
                    </div>
                  )}

                  {/* Preset quick avatars */}
                  <div className="pt-1 border-t border-[#DDD4BC]/50">
                    <span className="text-[10px] font-semibold text-[#8F7855] uppercase tracking-wider block mb-1.5">
                      Or Choose Preset
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {PRESET_AVATARS.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAvatar(url)}
                          className={`w-7 h-7 rounded-lg overflow-hidden border cursor-pointer transition-all ${
                            avatar === url ? 'ring-2 ring-[#256B3A] scale-105 border-transparent' : 'border-[#DDD4BC] hover:opacity-80'
                          }`}
                          title={`Preset Avatar ${i + 1}`}
                        >
                          <img src={url} alt={`Preset ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6F5B3C] mb-1">
                Brief Bio / Research Focus
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Key research areas, field trial experience, or rural farming focus..."
                className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#143520] hover:bg-[#1E542E] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {editingId ? <Check className="w-4 h-4 text-[#BFDC28]" /> : <Plus className="w-4 h-4 text-[#BFDC28]" />}
              <span>{editingId ? 'Save Author Changes' : 'Create Author Profile'}</span>
            </button>
          </form>
        </div>

        {/* Existing Authors List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#DDD4BC] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#EBE6D6]">
            <h3 className="font-serif font-bold text-base text-[#143520]">
              Active Editorial Authors
            </h3>
            <p className="text-xs text-[#8F7855]">
              Contributors available to assign to articles and field investigations
            </p>
          </div>

          <div className="divide-y divide-[#F6F4EB]">
            {authors.map(auth => {
              const postCount = articles.filter(a => a.author.id === auth.id).length;

              return (
                <div
                  key={auth.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FBFBF8] transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={auth.avatar}
                      alt={auth.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-1 ring-[#256B3A]/30 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="font-serif font-bold text-base text-[#143520]">
                        {auth.name}
                      </div>
                      <div className="text-xs font-semibold text-[#256B3A] flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>{auth.role}</span>
                      </div>
                      {auth.institution && (
                        <div className="text-[11px] text-[#6F5B3C] flex items-center gap-1">
                          <Building className="w-3 h-3 text-[#8F7855]" />
                          <span>{auth.institution}</span>
                        </div>
                      )}
                      <p className="text-xs text-[#54432C] line-clamp-2 pt-0.5">
                        {auth.bio}
                      </p>
                      <div className="text-[11px] text-[#8F7855] pt-1">
                        {postCount} research paper{postCount === 1 ? '' : 's'} authored
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => handleStartEdit(auth)}
                      className="p-2 text-[#256B3A] hover:bg-[#EBF1EA] rounded-xl transition-colors cursor-pointer"
                      title="Edit Author"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(auth.id, auth.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete Author"
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
