import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  fetchCategories, createCategory, updateCategory, deleteCategory,
  fetchSubCategories, createSubCategory, updateSubCategory, deleteSubCategory,
  clearCategoryMessages,
} from '../../../redux/slices/categorySlice';

const Icons = {
  Folder: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  ),
  Trash: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Edit: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  Plus: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Close: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Image: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Tag: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Layers: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  Search: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  CheckCircle: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Eye: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
};

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm text-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl border border-slate-100 dark:border-slate-800 my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-2xl z-10 sticky top-0">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer">
            <Icons.Close />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh]">{children}</div>
      </div>
    </div>
  );
}

function CategoryForm({ editing, onSubmit, onCancel, isLoading }) {
  const [name, setName] = useState(editing?.name || '');
  const [slug, setSlug] = useState(editing?.slug || '');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(editing?.image || null);
  const [formErrors, setFormErrors] = useState({});

  const validateCategoryForm = (n, s) => {
    const errors = {};
    if (!n.trim()) errors.name = "Category name is required.";
    if (!s.trim()) errors.slug = "Slug is required.";
    return errors;
  };

  const handleNameChange = (e) => {
    const v = e.target.value;
    setName(v);
    let newSlug = slug;
    if (!editing) {
      newSlug = v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setSlug(newSlug);
    }
    const errors = validateCategoryForm(v, newSlug);
    setFormErrors(errors);
  };

  const handleSlugChange = (e) => {
    const v = e.target.value;
    setSlug(v);
    const errors = validateCategoryForm(name, v);
    setFormErrors(errors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateCategoryForm(name, slug);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const fd = new FormData();
    fd.append('name', name);
    fd.append('slug', slug);
    if (image) fd.append('profileImage', image);
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {preview && (
        <div className="flex justify-center">
          <img src={preview} alt="preview" className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800" />
        </div>
      )}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1.5">Image</label>
        <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if(f){ setImage(f); setPreview(URL.createObjectURL(f)); }}} className="text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:text-xs file:font-semibold file:border-0 file:bg-indigo-50 dark:file:bg-indigo-950/40 file:text-indigo-600 dark:file:text-indigo-400 file:px-3 file:py-1.5 file:rounded-lg hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900 transition-all cursor-pointer" />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1.5">Name *</label>
        <input name="name" value={name} onChange={handleNameChange} required placeholder="e.g. Electronics" className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-slate-50/50 dark:bg-slate-950 dark:text-slate-100" />
        {formErrors.name && <p className="text-[10px] text-rose-500 font-bold ml-1 mt-0.5">{formErrors.name}</p>}
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1.5">Slug *</label>
        <input name="slug" value={slug} onChange={handleSlugChange} required placeholder="e.g. electronics" className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-slate-50/50 dark:bg-slate-950 dark:text-slate-100" />
        {formErrors.slug && <p className="text-[10px] text-rose-500 font-bold ml-1 mt-0.5">{formErrors.slug}</p>}
      </div>
      <div className="flex gap-3 mt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all bg-white dark:bg-slate-900">Cancel</button>
        <button type="submit" disabled={isLoading} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-70 flex items-center justify-center gap-1.5">
          {isLoading ? <><div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /><span>Saving...</span></> : editing ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}

function SubCategoryForm({ editing, categories, onSubmit, onCancel, isLoading }) {
  const [name, setName] = useState(editing?.name || '');
  const [slug, setSlug] = useState(editing?.slug || '');
  const [categoryId, setCategoryId] = useState(editing?.category?._id || editing?.category || '');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(editing?.image || null);
  const [formErrors, setFormErrors] = useState({});

  const validateSubCategoryForm = (n, s, c) => {
    const errors = {};
    if (!n.trim()) errors.name = "Subcategory name is required.";
    if (!s.trim()) errors.slug = "Slug is required.";
    if (!c) errors.categoryId = "Parent Category is required.";
    return errors;
  };

  const handleNameChange = (e) => {
    const v = e.target.value;
    setName(v);
    let newSlug = slug;
    if (!editing) {
      newSlug = v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setSlug(newSlug);
    }
    const errors = validateSubCategoryForm(v, newSlug, categoryId);
    setFormErrors(errors);
  };

  const handleSlugChange = (e) => {
    const v = e.target.value;
    setSlug(v);
    const errors = validateSubCategoryForm(name, v, categoryId);
    setFormErrors(errors);
  };

  const handleCategoryChangeLocal = (e) => {
    const v = e.target.value;
    setCategoryId(v);
    const errors = validateSubCategoryForm(name, slug, v);
    setFormErrors(errors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateSubCategoryForm(name, slug, categoryId);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const fd = new FormData();
    fd.append('name', name);
    fd.append('slug', slug);
    fd.append('category', categoryId);
    if (image) fd.append('profileImage', image);
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {preview && (
        <div className="flex justify-center">
          <img src={preview} alt="preview" className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800" />
        </div>
      )}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1.5">Image</label>
        <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if(f){ setImage(f); setPreview(URL.createObjectURL(f)); }}} className="text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:text-xs file:font-semibold file:border-0 file:bg-indigo-50 dark:file:bg-indigo-950/40 file:text-indigo-600 dark:file:text-indigo-400 file:px-3 file:py-1.5 file:rounded-lg hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900 transition-all cursor-pointer" />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1.5">Name *</label>
        <input name="name" value={name} onChange={handleNameChange} required placeholder="e.g. Smartphones" className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-slate-50/50 dark:bg-slate-950 dark:text-slate-100" />
        {formErrors.name && <p className="text-[10px] text-rose-500 font-bold ml-1 mt-0.5">{formErrors.name}</p>}
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1.5">Slug *</label>
        <input name="slug" value={slug} onChange={handleSlugChange} required placeholder="e.g. smartphones" className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-slate-50/50 dark:bg-slate-950 dark:text-slate-100" />
        {formErrors.slug && <p className="text-[10px] text-rose-500 font-bold ml-1 mt-0.5">{formErrors.slug}</p>}
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1.5">Parent Category *</label>
        <select name="categoryId" value={categoryId} onChange={handleCategoryChangeLocal} required className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 bg-slate-50/50 dark:bg-slate-950 dark:text-slate-100">
          <option value="" className="dark:bg-slate-900">-- Select --</option>
          {categories.map(c => <option key={c._id} value={c._id} className="dark:bg-slate-900">{c.name}</option>)}
        </select>
        {formErrors.categoryId && <p className="text-[10px] text-rose-500 font-bold ml-1 mt-0.5">{formErrors.categoryId}</p>}
      </div>
      <div className="flex gap-3 mt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all bg-white dark:bg-slate-900">Cancel</button>
        <button type="submit" disabled={isLoading} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-70 flex items-center justify-center gap-1.5">
          {isLoading ? <><div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /><span>Saving...</span></> : editing ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}

export default function AdminCategories() {
  const _catContext = useOutletContext() || {};
  const showToast = typeof _catContext.showToast === "function" ? _catContext.showToast : () => {};
  const dispatch = useAppDispatch();
  const { categories, subCategories, isLoading, error, successMessage } = useAppSelector(s => s.category);
  const { user } = useAppSelector(s => s.auth);
  const [tab, setTab] = useState('categories');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // { type: 'cat'|'sub', editing: null|obj }
  const [deleteTarget, setDeleteTarget] = useState(null); // { type, id, name }
  const [viewDetail, setViewDetail] = useState(null); // { type: 'cat'|'sub', item: obj }

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
    if (subCategories.length === 0) {
      dispatch(fetchSubCategories());
    }
  }, [dispatch, categories.length, subCategories.length]);

  useEffect(() => {
    if (successMessage) { showToast(successMessage, 'success'); dispatch(clearCategoryMessages()); }
    if (error) { showToast(error, 'error'); dispatch(clearCategoryMessages()); }
  }, [successMessage, error, dispatch, showToast]);

  const handleCatSubmit = (fd) => {
    const action = modal.editing
      ? dispatch(updateCategory({ id: modal.editing._id, formData: fd }))
      : dispatch(createCategory(fd));
    action.then(r => { if (!r.error) setModal(null); });
  };

  const handleSubSubmit = (fd) => {
    const action = modal.editing
      ? dispatch(updateSubCategory({ id: modal.editing._id, formData: fd }))
      : dispatch(createSubCategory(fd));
    action.then(r => { if (!r.error) setModal(null); });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'cat') dispatch(deleteCategory(deleteTarget.id));
    else dispatch(deleteSubCategory(deleteTarget.id));
    setDeleteTarget(null);
  };

  const getCatName = (sub) => sub.category?.name || categories.find(c => c._id === (sub.category?._id || sub.category))?.name || '—';

  // Stats KPIs calculations
  const totalCategories = categories.length;
  const totalSubcategories = subCategories.length;
  const totalTaxonomy = totalCategories + totalSubcategories;
  const activeLinks = categories.filter(c => subCategories.some(s => (s.category?._id || s.category) === c._id)).length;

  // Search filtering
  const filteredCats = categories.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.slug || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredSubs = subCategories.filter(s =>
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.slug || '').toLowerCase().includes(search.toLowerCase()) ||
    getCatName(s).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-slate-800 dark:text-slate-200 flex-1 min-h-0">
      
      {/* High-level Taxonomy Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 flex-shrink-0">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Icons.Folder className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Parent Categories</span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{totalCategories} Groups</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Icons.Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Subcategories</span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{totalSubcategories} Nodes</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Icons.Tag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Combined Taxonomy</span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{totalTaxonomy} Tags</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Icons.CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Linked Categories</span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{activeLinks} Active</h3>
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        {/* Search Input */}
        <div className="relative max-w-sm w-full">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${tab === 'categories' ? 'categories' : 'subcategories'}...`}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-all shadow-xs"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            <Icons.Search />
          </div>
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-bold">
              ×
            </button>
          )}
        </div>

        {/* Tab Switch + Action Button */}
        <div className="flex flex-wrap items-center gap-3.5 self-end sm:self-auto">
          <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl w-max border border-slate-200/50 dark:border-slate-800">
            {['categories', 'subcategories'].map(t => (
              <button key={t} onClick={() => { setTab(t); setSearch(''); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${tab === t ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-250'}`}>
                {t}
              </button>
            ))}
          </div>

          <button onClick={() => setModal({ type: tab === 'categories' ? 'cat' : 'sub', editing: null })}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all hover:shadow-md hover:shadow-indigo-100 shrink-0 cursor-pointer">
            <Icons.Plus className="w-3.5 h-3.5" />
            Add {tab === 'categories' ? 'Category' : 'Subcategory'}
          </button>
        </div>
      </div>

      {/* Categories Table */}
      {tab === 'categories' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-auto shadow-xs flex-1 min-h-[320px]">
          <table className="w-full text-left border-collapse text-xs relative">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10">
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-4 px-5">Image</th>
                <th className="py-4 px-5">Name</th>
                <th className="py-4 px-5">Slug</th>
                {user?.adminRole === "superadmin" && <th className="py-4 px-5">Admin</th>}
                <th className="py-4 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {isLoading && filteredCats.length === 0
                ? <tr><td colSpan={user?.adminRole === "superadmin" ? 5 : 4} className="py-12 text-center text-slate-400 dark:text-slate-500 font-semibold">Loading classification database...</td></tr>
                : filteredCats.length === 0
                ? <tr><td colSpan={user?.adminRole === "superadmin" ? 5 : 4} className="py-16 text-center text-slate-400 dark:text-slate-500 font-bold">
                    <div className="flex flex-col items-center gap-3">
                      <Icons.Folder className="w-10 h-10 text-slate-300 dark:text-slate-650" />
                      <span>{search ? 'No categories match your search.' : 'No categories yet. Add one!'}</span>
                    </div>
                  </td></tr>
                : filteredCats.map(cat => (
                  <tr key={cat._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="py-4.5 px-5">
                      {cat.image
                        ? <img src={cat.image} alt={cat.name} className="w-10 h-10 rounded-xl object-cover border border-slate-100 dark:border-slate-800" />
                        : <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-400 dark:text-indigo-300"><Icons.Folder className="w-5 h-5" /></div>}
                    </td>
                    <td className="py-4.5 px-5 font-bold text-slate-800 dark:text-slate-200">{cat.name}</td>
                    <td className="py-4.5 px-5 text-slate-400 dark:text-slate-500 font-medium">{cat.slug}</td>
                    {user?.adminRole === "superadmin" && (
                      <td className="py-4.5 px-5 text-slate-500 dark:text-slate-400 font-semibold">{cat.createdBy?.name || 'SuperAdmin'}</td>
                    )}
                    <td className="py-4.5 px-5">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setViewDetail({ type: 'cat', item: cat })}
                          className="p-2 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 rounded-xl border border-slate-100 dark:border-slate-800 transition-all cursor-pointer"
                          title="View Category Details"
                        >
                          <Icons.Eye />
                        </button>
                        <button onClick={() => setModal({ type: 'cat', editing: cat })}
                          className="p-2 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 rounded-xl border border-slate-100 dark:border-slate-800 transition-all cursor-pointer">
                          <Icons.Edit />
                        </button>
                        <button onClick={() => setDeleteTarget({ type: 'cat', id: cat._id, name: cat.name })}
                          className="p-2 bg-slate-50 dark:bg-slate-950 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-450 rounded-xl border border-slate-100 dark:border-slate-800 transition-all cursor-pointer">
                          <Icons.Trash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Subcategories Table */}
      {tab === 'subcategories' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-auto shadow-xs flex-1 min-h-[320px]">
          <table className="w-full text-left border-collapse text-xs relative">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10">
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-4 px-5">Image</th>
                <th className="py-4 px-5">Name</th>
                <th className="py-4 px-5">Slug</th>
                <th className="py-4 px-5">Parent Group</th>
                {user?.adminRole === "superadmin" && <th className="py-4 px-5">Admin</th>}
                <th className="py-4 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {isLoading && filteredSubs.length === 0
                ? <tr><td colSpan={user?.adminRole === "superadmin" ? 6 : 5} className="py-12 text-center text-slate-400 dark:text-slate-500 font-semibold">Loading subcategory database...</td></tr>
                : filteredSubs.length === 0
                ? <tr><td colSpan={user?.adminRole === "superadmin" ? 6 : 5} className="py-16 text-center text-slate-400 dark:text-slate-500 font-bold">
                    <div className="flex flex-col items-center gap-3">
                      <Icons.Layers className="w-10 h-10 text-slate-300 dark:text-slate-650" />
                      <span>{search ? 'No subcategories match your search.' : 'No subcategories yet. Add one!'}</span>
                    </div>
                  </td></tr>
                : filteredSubs.map(sub => (
                  <tr key={sub._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="py-4.5 px-5">
                      {sub.image
                        ? <img src={sub.image} alt={sub.name} className="w-10 h-10 rounded-xl object-cover border border-slate-100 dark:border-slate-800" />
                        : <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-400 dark:text-indigo-300"><Icons.Folder className="w-5 h-5" /></div>}
                    </td>
                    <td className="py-4.5 px-5 font-bold text-slate-800 dark:text-slate-200">{sub.name}</td>
                    <td className="py-4.5 px-5 text-slate-400 dark:text-slate-500 font-medium">{sub.slug}</td>
                    <td className="py-4.5 px-5">
                      <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30 rounded-full text-[10px] font-bold">{getCatName(sub)}</span>
                    </td>
                    {user?.adminRole === "superadmin" && (
                      <td className="py-4.5 px-5 text-slate-500 dark:text-slate-400 font-semibold">{sub.createdBy?.name || 'SuperAdmin'}</td>
                    )}
                    <td className="py-4.5 px-5">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setViewDetail({ type: 'sub', item: sub })}
                          className="p-2 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 rounded-xl border border-slate-100 dark:border-slate-800 transition-all cursor-pointer"
                          title="View Subcategory Details"
                        >
                          <Icons.Eye />
                        </button>
                        <button onClick={() => setModal({ type: 'sub', editing: sub })}
                          className="p-2 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 rounded-xl border border-slate-100 dark:border-slate-800 transition-all cursor-pointer">
                          <Icons.Edit />
                        </button>
                        <button onClick={() => setDeleteTarget({ type: 'sub', id: sub._id, name: sub.name })}
                          className="p-2 bg-slate-50 dark:bg-slate-950 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-450 rounded-xl border border-slate-100 dark:border-slate-800 transition-all cursor-pointer">
                          <Icons.Trash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal && (
        <Modal
          title={modal.type === 'cat' ? (modal.editing ? 'Edit Category' : 'Add Category') : (modal.editing ? 'Edit Subcategory' : 'Add Subcategory')}
          onClose={() => setModal(null)}
        >
          {modal.type === 'cat'
            ? <CategoryForm editing={modal.editing} isLoading={isLoading} onSubmit={handleCatSubmit} onCancel={() => setModal(null)} />
            : <SubCategoryForm editing={modal.editing} categories={categories} isLoading={isLoading} onSubmit={handleSubSubmit} onCancel={() => setModal(null)} />}
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <Modal title="Confirm Delete" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Are you sure you want to delete</p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-5">"{deleteTarget.name}"?</p>
          <p className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/20 border border-rose-100/30 dark:border-rose-900/30 px-3 py-2 rounded-xl mb-6 font-semibold">This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all bg-white dark:bg-slate-900">Cancel</button>
            <button onClick={handleDelete} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all">Yes, Delete</button>
          </div>
        </Modal>
      )}

      {/* Detail View Modal */}
      {viewDetail && (
        <Modal 
          title={viewDetail.type === 'cat' ? 'Category Details' : 'Subcategory Details'} 
          onClose={() => setViewDetail(null)}
        >
          <div className="flex flex-col items-center gap-4 text-xs text-slate-800 dark:text-slate-200">
            {viewDetail.item.image ? (
              <img src={viewDetail.item.image} alt="" className="w-20 h-20 rounded-2xl object-cover border border-slate-100 dark:border-slate-800 shadow-xs" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-400 flex items-center justify-center font-bold text-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
                📁
              </div>
            )}

            <div className="w-full flex flex-col gap-4 mt-2">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100/50 dark:border-slate-800/60 rounded-xl">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Name</span>
                <p className="font-extrabold text-slate-800 dark:text-slate-100 text-sm mt-0.5">{viewDetail.item.name}</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100/50 dark:border-slate-800/60 rounded-xl">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Slug URL</span>
                <p className="font-semibold text-slate-500 dark:text-slate-450 mt-0.5 select-all">{viewDetail.item.slug}</p>
              </div>

              {viewDetail.type === 'sub' && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100/50 dark:border-slate-800/60 rounded-xl">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Parent Category Group</span>
                  <p className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm mt-0.5">{getCatName(viewDetail.item)}</p>
                </div>
              )}

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100/50 dark:border-slate-800/60 rounded-xl">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Unique Database ID</span>
                <p className="font-bold text-slate-600 dark:text-slate-400 mt-0.5 select-all">{viewDetail.item._id || viewDetail.item.id}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}