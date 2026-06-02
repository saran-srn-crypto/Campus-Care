import React, { useMemo, useState } from 'react';
import { ImagePlus, X, Send } from 'lucide-react';
import { useTickets } from '../../hooks/useTickets';
import { useNotifications } from '../../hooks/useNotifications';

const initialForm = (category) => ({
  title: '',
  category,
  priority: 'Low',
  location: '',
  description: '',
});

export default function CreateTicketForm({ ownerName }) {
  const { state, addTicket } = useTickets();
  const { addNotification, showToast } = useNotifications();
  const defaultCategory = state.categories[0] || 'Hostel';
  const [form, setForm] = useState(initialForm(defaultCategory));
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const inputCls = 'w-full border border-[#cbd5e1] rounded-lg bg-white text-ink px-3 py-2.5 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(31,87,195,0.14)]';
  const fileNames = useMemo(() => files.map(file => file.name), [files]);

  const set = (key) => (e) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const next = {};
    if (form.title.trim().length < 5) next.title = 'Enter a clear issue title.';
    if (!form.category) next.category = 'Select a category.';
    if (form.location.trim().length < 3) next.location = 'Add the affected location.';
    if (form.description.trim().length < 15) next.description = 'Add at least 15 characters of detail.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const addFiles = (fileList) => {
    const selected = Array.from(fileList || []).filter(file => file.type.startsWith('image/'));
    if (!selected.length) return;
    
    selected.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFiles(prev => {
          if (prev.some(f => f.name === file.name)) return prev;
          return [...prev, { name: file.name, data: reader.result }].slice(0, 6);
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (name) => {
    setFiles(prev => prev.filter(file => file.name !== name));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const ticket = await addTicket({
        ...form,
        owner: ownerName,
        attachments: files.map(f => f.data),
      });
      addNotification(
        'New ticket ' + (ticket?.id || '') + ' created',
        form.category + ' complaint submitted by ' + ownerName + '.'
      );
      showToast('Complaint ticket created.');
      setForm(initialForm(defaultCategory));
      setFiles([]);
      setErrors({});
    } catch (error) {
      showToast(error.message || 'Could not create ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <article className="border border-line rounded-lg bg-white shadow-card overflow-hidden">
      <div className="p-5 border-b border-line">
        <h2 className="m-0">Raise New Complaint</h2>
        <p className="mt-1 mb-0 text-muted">Create a ticket with category, location, and supporting images.</p>
      </div>

      <form className="grid gap-5 p-5" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <label htmlFor="ticketTitle" className="text-[#344054] text-sm font-bold">Issue title</label>
            <input id="ticketTitle" required placeholder="Wi-Fi not working in Block C" value={form.title} onChange={set('title')} className={inputCls} aria-invalid={!!errors.title} />
            {errors.title && <span className="text-danger text-xs font-bold" role="alert">{errors.title}</span>}
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="ticketLocation" className="text-[#344054] text-sm font-bold">Location</label>
            <input id="ticketLocation" required placeholder="Block, room, lab, hall, or portal" value={form.location} onChange={set('location')} className={inputCls} aria-invalid={!!errors.location} />
            {errors.location && <span className="text-danger text-xs font-bold" role="alert">{errors.location}</span>}
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="ticketCategory" className="text-[#344054] text-sm font-bold">Category</label>
            <select id="ticketCategory" value={form.category} onChange={set('category')} className={inputCls} aria-invalid={!!errors.category}>
              {state.categories.map(c => <option key={c}>{c}</option>)}
            </select>
            {errors.category && <span className="text-danger text-xs font-bold" role="alert">{errors.category}</span>}
          </div>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="ticketDescription" className="text-[#344054] text-sm font-bold">Issue description</label>
          <textarea
            id="ticketDescription"
            required
            placeholder="Explain what happened, when it started, and who is affected"
            value={form.description}
            onChange={set('description')}
            className={inputCls + ' min-h-32 resize-y'}
            aria-invalid={!!errors.description}
          />
          {errors.description && <span className="text-danger text-xs font-bold" role="alert">{errors.description}</span>}
        </div>

        <div className="grid gap-1.5">
          <span className="text-[#344054] text-sm font-bold">Supporting images</span>
          <label
            htmlFor="ticketFiles"
            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }}
            className={[
              'min-h-[150px] rounded-lg border-2 border-dashed px-4 py-5 bg-surface-soft grid place-items-center text-center transition-colors cursor-pointer',
              isDragging ? 'border-primary bg-[#e9f0ff]' : 'border-[#cbd5e1] hover:border-primary',
            ].join(' ')}
          >
            <input id="ticketFiles" type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addFiles(e.target.files)} />
            <span className="grid gap-2 justify-items-center">
              <span className="w-11 h-11 rounded-lg bg-white text-primary grid place-items-center border border-line">
                <ImagePlus size={22} />
              </span>
              <span className="font-extrabold">Drop images or browse</span>
              <span className="text-sm text-muted">PNG, JPG, and WEBP files</span>
            </span>
          </label>

          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {files.map(file => (
                <span key={file.name} className="inline-flex items-center gap-2 min-h-[32px] rounded-full bg-[#e9f0ff] text-primary-dark px-3 py-1 text-xs font-extrabold">
                  {file.name}
                  <button type="button" onClick={() => removeFile(file.name)} className="w-5 h-5 rounded-full grid place-items-center hover:bg-white" aria-label={'Remove ' + file.name}>
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 z-[1] -mx-5 -mb-5 px-5 py-3 border-t border-line bg-white/95 backdrop-blur-sm flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-muted">{files.length} image{files.length === 1 ? '' : 's'} attached</span>
          <button
            type="submit"
            disabled={submitting}
            className="min-h-[42px] rounded-lg border border-transparent bg-primary text-white px-5 py-2 font-extrabold hover:bg-primary-dark transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            <Send size={16} />
            {submitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </div>
      </form>
    </article>
  );
}
