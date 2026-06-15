// src/pages/CampaignCreatives.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import api, { campaignAPI } from '../services/api';

const CampaignCreatives = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    ad_type: 'display',
    format: '728x90',
    title: '',
    description: '',
    image_url: '',
    destination_url: '',
    call_to_action: 'Learn More',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const loadCampaign = async () => {
    try {
      const response = await campaignAPI.getOne(id);
      setCampaign(response.data.data);
    } catch (err) {
      setError('Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  const loadCreatives = async () => {
    try {
      const response = await api.get(`/campaigns/${id}/creatives`);
      setCreatives(response.data.data || []);
    } catch (err) {
      console.error('Error loading creatives:', err);
    }
  };

  useEffect(() => {
    loadCampaign();
    loadCreatives();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(event.type === 'dragenter' || event.type === 'dragover');
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (event.dataTransfer.files?.[0]) handleFile(event.dataTransfer.files[0]);
  };

  const handleFileInput = (event) => {
    if (event.target.files?.[0]) handleFile(event.target.files[0]);
  };

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      let imageUrl = formData.image_url;
      if (imageFile) {
        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('image', imageFile);
        const uploadResponse = await api.post('/campaigns/creatives/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (uploadResponse.data.success) imageUrl = uploadResponse.data.data.fullUrl;
        setUploading(false);
      }

      const response = await api.post(`/campaigns/${id}/creatives`, { ...formData, image_url: imageUrl });

      if (response.data.success) {
        setSuccess('Ad creative created successfully.');
        setShowForm(false);
        loadCreatives();
        setFormData({ name: '', ad_type: 'display', format: '728x90', title: '', description: '', image_url: '', destination_url: '', call_to_action: 'Learn More' });
        setImageFile(null);
        setImagePreview(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ad creative');
      setUploading(false);
    }
  };

  const handleActivateCampaign = async () => {
    if (creatives.length === 0) {
      setError('Add at least one creative before activating');
      return;
    }
    try {
      await campaignAPI.update(id, { status: 'active' });
      setSuccess('Campaign activated successfully.');
      loadCampaign();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to activate campaign');
    }
  };

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-black/50">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />
      <header className="bg-black py-16 text-white">
        <div className="aa-wide">
          <button onClick={() => navigate('/dashboard')} className="mb-5 text-[17px] text-[#9cbba9] hover:underline">
            Dashboard &gt;
          </button>
          <h1 className="aa-display">{campaign?.name}</h1>
          <p className="mt-3 text-[21px] leading-[1.19] text-white/80">Status: {campaign?.status}</p>
          {campaign?.status === 'draft' && creatives.length > 0 && (
            <button onClick={handleActivateCampaign} className="btn-primary mt-7">Activate campaign</button>
          )}
        </div>
      </header>

      <main className="aa-wide py-8">
        {(error || success) && (
          <div className="mb-6 grid gap-3">
            {error && <div className="rounded-lg bg-white px-4 py-3 text-sm text-black/80">{error}</div>}
            {success && <div className="rounded-lg bg-white px-4 py-3 text-sm text-black/80">{success}</div>}
          </div>
        )}

        {campaign?.status === 'draft' && (
          <section className="data-card mb-6 p-6">
            <p className="section-kicker">Setup</p>
            <h2 className="mt-2 text-[28px] font-normal leading-[1.14] text-[#151713]">Add at least one creative before activation.</h2>
            <p className="mt-3 text-sm text-black/70">Creatives in this campaign: {creatives.length}</p>
          </section>
        )}

        <section className="data-card overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-black/[0.06] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-[28px] font-normal leading-[1.14] text-[#151713]">Ad Creatives</h2>
            {!showForm && <button onClick={() => setShowForm(true)} className="btn-primary">Create Ad Creative</button>}
          </div>

          {showForm && (
            <div className="border-b border-black/[0.06] bg-[#f7f5ef] p-6">
              <h3 className="text-[21px] font-semibold leading-[1.19] text-[#151713]">New creative</h3>
              <form onSubmit={handleSubmit} className="mt-5 grid gap-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Creative Name">
                    <input name="name" value={formData.name} onChange={handleChange} required className="form-input" />
                  </Field>
                  <Field label="Ad Format">
                    <select name="format" value={formData.format} onChange={handleChange} className="form-input">
                      <option value="728x90">Leaderboard (728x90)</option>
                      <option value="970x250">Billboard (970x250)</option>
                      <option value="responsive">Native / Responsive</option>
                      <option value="300x250">Medium Rectangle (300x250)</option>
                      <option value="160x600">Wide Skyscraper (160x600)</option>
                      <option value="320x50">Mobile Banner (320x50)</option>
                      <option value="300x600">Half Page (300x600)</option>
                    </select>
                  </Field>
                </div>
                <Field label="Ad Title">
                  <input name="title" value={formData.title} onChange={handleChange} required className="form-input" />
                </Field>
                <Field label="Description">
                  <textarea name="description" value={formData.description} onChange={handleChange} required rows="2" className="form-input" />
                </Field>
                <Field label="Ad Image">
                  {!imagePreview ? (
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`rounded-lg bg-white p-8 text-center ${dragActive ? 'outline outline-2 outline-[#2f6f4e]' : ''}`}
                    >
                      <input type="file" accept="image/*" onChange={handleFileInput} className="hidden" id="file-upload" />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="mx-auto mb-3 h-9 w-9 text-[#2f6f4e]" />
                        <p className="text-sm font-semibold text-[#151713]">Drag an image here, or browse</p>
                        <p className="mt-1 text-xs text-black/50">PNG, JPG, GIF up to 5MB</p>
                      </label>
                    </div>
                  ) : (
                    <div className="relative rounded-lg bg-white p-4">
                      <img src={imagePreview} alt="Preview" className="mb-2 h-48 w-full object-contain" />
                      <button type="button" onClick={removeImage} className="absolute right-3 top-3 rounded-full bg-black/80 p-2 text-white">
                        <X className="h-4 w-4" />
                      </button>
                      <p className="text-center text-sm text-black/60">{imageFile?.name}</p>
                    </div>
                  )}
                </Field>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Destination URL">
                    <input type="url" name="destination_url" value={formData.destination_url} onChange={handleChange} required className="form-input" />
                  </Field>
                  <Field label="Call to Action">
                    <input name="call_to_action" value={formData.call_to_action} onChange={handleChange} className="form-input" />
                  </Field>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={uploading} className="btn-primary">{uploading ? 'Uploading...' : 'Create Ad Creative'}</button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="p-6">
            {creatives.length === 0 ? (
              <div className="py-12 text-center">
                <p className="mb-4 text-sm text-black/50">No ad creatives yet</p>
                {!showForm && <button onClick={() => setShowForm(true)} className="btn-primary">Create first creative</button>}
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {creatives.map((creative) => (
                  <article key={creative.id} className="overflow-hidden rounded-lg bg-[#f7f5ef]">
                    <img src={creative.image_url} alt={creative.title} className="h-44 w-full bg-white object-contain" />
                    <div className="p-5">
                      <h3 className="text-[21px] font-semibold leading-[1.19] text-[#151713]">{creative.title}</h3>
                      <p className="mt-2 text-sm leading-[1.29] text-black/70">{creative.description}</p>
                      <div className="mt-5 flex items-center justify-between">
                        <StatusPill status={creative.status} />
                        <span className="text-xs text-black/50">{creative.format}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

const Field = ({ label, children }) => (
  <label className="block">
    <span className="form-label">{label}</span>
    <span className="mt-2 block">{children}</span>
  </label>
);

const StatusPill = ({ status }) => (
  <span className={`inline-flex rounded-[980px] px-3 py-1 text-xs font-semibold ${
    status === 'active' || status === 'approved' ? 'bg-[#2f6f4e] text-white' : 'bg-white text-black/60'
  }`}>
    {status}
  </span>
);

export default CampaignCreatives;
