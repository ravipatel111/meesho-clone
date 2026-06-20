import { useState, useEffect, useRef } from "react";
import {
  firstOrPlaceholder,
  resolveOrPlaceholder,
  PLACEHOLDER_IMAGE,
} from "../../../utils/imageUrl";
import { useSearchParams, useOutletContext } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  adminFetchProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  clearProductMessages,
} from "../../../redux/slices/productSlice";
import {
  fetchCategories,
  fetchSubCategories,
} from "../../../redux/slices/categorySlice";


const Icons = {
  Plus: ({ className = "w-4 h-4" }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Trash: ({ className = "w-4 h-4" }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  ),
  Edit: ({ className = "w-4 h-4" }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  ),
  Close: ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  Package: ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  ),
  Search: ({ className = "w-4 h-4" }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  AlertTriangle: ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  CheckCircle: ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  AlertCircle: ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  Eye: ({ className = "w-4 h-4" }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ),
};

const getAvailableSizes = (prod) => {
  if (!prod) return [];

  if (Array.isArray(prod.sizes) && prod.sizes.length > 0) {
    return prod.sizes;
  }
  if (Array.isArray(prod.size) && prod.size.length > 0) {
    return prod.size;
  }

  if (typeof prod.sizes === "string" && prod.sizes.trim()) {
    return prod.sizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof prod.size === "string" && prod.size.trim()) {
    return prod.size
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [];
};

const getVideoUrl = (prod) => {
  if (!prod) return null;
  if (typeof prod.video === "string" && prod.video.trim()) {
    return prod.video;
  }
  if (prod.video?.url) {
    return prod.video.url;
  }
  if (Array.isArray(prod.videos) && prod.videos[0]) {
    return typeof prod.videos[0] === "string"
      ? prod.videos[0]
      : prod.videos[0].url;
  }
  if (Array.isArray(prod.video) && prod.video[0]) {
    return typeof prod.video[0] === "string"
      ? prod.video[0]
      : prod.video[0].url;
  }
  return null;
};

function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`bg-white dark:bg-slate-900 rounded-2xl w-full shadow-xl border border-slate-100 dark:border-slate-800 ${wide ? "max-w-5xl" : "max-w-md"}`}
      >
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-2xl z-10">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
          >
            <Icons.Close />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ImageModal({ url, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-zoom-out animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full max-h-[85vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={url}
          alt="Product Preview"
          className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-slate-800"
        />
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-white transition-all cursor-pointer text-xs font-bold"
        >
          Close ×
        </button>
      </div>
    </div>
  );
}

function ProductForm({
  editing,
  categories,
  subCategories,
  onSubmit,
  onCancel,
  isLoading,
  onZoomImage,
}) {
  const [form, setForm] = useState({
    title: editing?.title || "",
    description: editing?.description || "",
    price: editing?.price || "",
    discountPrice: editing?.discountPrice || "",
    category: editing?.category?._id || editing?.category || "",
    subCategory: editing?.subCategory?._id || editing?.subCategory || "",
    stock: editing?.stock ?? "",
    sizes: Array.isArray(editing?.sizes)
      ? editing.sizes
      : Array.isArray(editing?.size)
        ? editing.size
        : typeof editing?.sizes === "string" && editing.sizes.trim()
          ? editing.sizes
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : typeof editing?.size === "string" && editing.size.trim()
            ? editing.size
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
  });
  const [formErrors, setFormErrors] = useState({});

  const validateProductForm = (name, value, currentForm = form) => {
    let error = "";
    if (name === "title") {
      if (!value || !String(value).trim()) error = "Product title is required.";
    } else if (name === "price") {
      if (!value) error = "Price is required.";
      else if (Number(value) <= 0) error = "Price must be greater than 0.";
    } else if (name === "stock") {
      if (!value && value !== 0 && value !== '0') error = "Stock is required.";
      else if (Number(value) < 0) error = "Stock cannot be negative.";
    } else if (name === "category") {
      if (!value) error = "Category is required.";
    }
    return error;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const newForm = { ...prev, [name]: value };
      const fieldError = validateProductForm(name, value, newForm);
      setFormErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        if (fieldError) newErrors[name] = fieldError;
        else delete newErrors[name];
        return newErrors;
      });
      return newForm;
    });
  };

  const handleCategoryChangeLocal = (e) => {
    const val = e.target.value;
    setForm((prev) => {
      const newForm = { ...prev, category: val, subCategory: "" };
      const fieldError = validateProductForm("category", val, newForm);
      setFormErrors((prevE) => {
        const errs = { ...prevE };
        if (fieldError) errs.category = fieldError;
        else delete errs.category;
        return errs;
      });
      return newForm;
    });
  };

  const sizeOptions = ["XXS", "S", "M", "L", "XL", "XXL", "XXXL", "Free Size"];

  const handleSizeToggle = (size) => {
    setForm((prev) => {
      const alreadyHas = (prev.sizes || []).includes(size);
      const updated = alreadyHas
        ? (prev.sizes || []).filter((s) => s !== size)
        : [...(prev.sizes || []), size];
      return { ...prev, sizes: updated };
    });
  };

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState(editing?.images || []);
  const [localPreviews, setLocalPreviews] = useState([]);

  const [video, setVideo] = useState(null);
  const [existingVideo, setExistingVideo] = useState(() => {
    if (!editing) return null;
    if (typeof editing.video === "string" && editing.video.trim())
      return editing.video;
    if (editing.video?.url) return editing.video.url;
    if (Array.isArray(editing.videos) && editing.videos[0]) {
      return typeof editing.videos[0] === "string"
        ? editing.videos[0]
        : editing.videos[0].url;
    }
    if (Array.isArray(editing.video) && editing.video[0]) {
      return typeof editing.video[0] === "string"
        ? editing.video[0]
        : editing.video[0].url;
    }
    return null;
  });
  const [videoPreview, setVideoPreview] = useState("");

  useEffect(() => {
    return () => {
      if (videoPreview && videoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [videoPreview]);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("Video file size must be less than 50MB");
      e.target.value = "";
      return;
    }

    setVideo(file);
    if (videoPreview && videoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(URL.createObjectURL(file));
  };

  const removeVideo = () => {
    setVideo(null);
    if (videoPreview && videoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview("");
    setExistingVideo(null);
  };

  const [imagesInputKey, setImagesInputKey] = useState(0);

  const filteredSubs = subCategories.filter(
    (s) => (s.category?._id || s.category) === form.category,
  );

  const previewsRef = useRef(localPreviews);
  useEffect(() => {
    previewsRef.current = localPreviews;
  }, [localPreviews]);

  useEffect(() => {
    return () => {
      previewsRef.current.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const currentTotal = existingImages.length + images.length;
    const remainingCapacity = 5 - currentTotal;

    if (remainingCapacity <= 0) {
      alert("Maximum of 5 images allowed");
      e.target.value = "";
      return;
    }

    const filesToAdd = files.slice(0, remainingCapacity);
    if (files.length > remainingCapacity) {
      alert(
        `Only adding the first ${remainingCapacity} images to respect the 5-image limit.`,
      );
    }

    setImages((prev) => [...prev, ...filesToAdd]);
    setLocalPreviews((prev) => [
      ...prev,
      ...filesToAdd.map((f) => URL.createObjectURL(f)),
    ]);

    e.target.value = "";
  };

  const removeImage = (index, type) => {
    if (type === "existing") {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setImages((prev) => prev.filter((_, i) => i !== index));
      setLocalPreviews((prev) => {
        const urlToRemove = prev[index];
        if (urlToRemove && urlToRemove.startsWith("blob:")) {
          URL.revokeObjectURL(urlToRemove);
        }
        return prev.filter((_, i) => i !== index);
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const error = validateProductForm(key, form[key], form);
      if (error) newErrors[key] = error;
    });
    setFormErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k !== "sizes" && v !== "") fd.append(k, v);
    });
    if (form.sizes && form.sizes.length > 0) {
      form.sizes.forEach((s) => {
        fd.append("sizes", s);
        fd.append("size", s);
      });
    }
    images.forEach((img) => fd.append("images", img));
    if (editing) {
      fd.append("existingImages", JSON.stringify(existingImages));
      if (!existingVideo) {
        fd.append("removeVideo", "true");
      }
    }
    if (video) {
      fd.append("video", video);
      fd.append("videos", video);
    }
    onSubmit(fd);
  };

  const inp =
    "w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-slate-50/50 dark:bg-slate-950 dark:text-slate-100";
  const lbl =
    "block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1.5";

  const allPreviews = [
    ...existingImages.map((img, i) => ({
      type: "existing",
      url: resolveOrPlaceholder(img),
      index: i,
    })),
    ...localPreviews.map((url, i) => ({ type: "local", url, index: i })),
  ];

  const totalCount = existingImages.length + images.length;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      {/* Image Previews */}
      {allPreviews.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {allPreviews.map((p) => (
            <div key={p.url} className="relative w-16 h-16 group">
              <img
                src={p.url}
                alt=""
                className="w-full h-full rounded-xl object-cover border border-slate-200 dark:border-slate-800 cursor-zoom-in hover:opacity-90 transition-all"
                onClick={() => onZoomImage && onZoomImage(p.url)}
              />
              <button
                type="button"
                onClick={() => removeImage(p.index, p.type)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
                title="Remove image"
              >
                <span className="text-[10px] font-bold leading-none">×</span>
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <label className={lbl}>Product Images ({totalCount} / 5)</label>
        {totalCount < 5 ? (
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImages}
            className="text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:text-xs file:font-semibold file:border-0 file:bg-indigo-50 dark:file:bg-indigo-950/40 file:text-indigo-600 dark:file:text-indigo-400 file:px-3 file:py-1.5 file:rounded-lg hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900 transition-all cursor-pointer"
          />
        ) : (
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2 rounded-xl w-max">
            Maximum limit of 5 images reached.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className={lbl}>Title *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleFormChange}
            required
            placeholder="Product title"
            className={inp}
          />
          {formErrors.title && <p className="text-[10px] text-rose-500 font-bold ml-1 mt-0.5">{formErrors.title}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className={lbl}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleFormChange}
            placeholder="Product description..."
            rows={2}
            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-slate-50/50 dark:bg-slate-950 dark:text-slate-100 resize-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className={lbl}>Available Sizes</label>
          <div className="flex gap-2 flex-wrap mt-1">
            {sizeOptions.map((size) => {
              const isSelected = (form.sizes || []).includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeToggle(size)}
                  className={`px-3 py-1.5 rounded-xl border-2 text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/15 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-black"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-transparent hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        <div className="sm:col-span-2 border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-0">
          <label className={lbl}>Product Video Demo (Max 50MB)</label>
          {existingVideo || videoPreview ? (
            <div className="relative w-full max-w-[240px] aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black flex items-center justify-center mt-1">
              <video
                src={videoPreview || existingVideo}
                controls
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={removeVideo}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md transition-all cursor-pointer z-10 font-bold"
                title="Remove Video"
              >
                ×
              </button>
            </div>
          ) : (
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:text-xs file:font-semibold file:border-0 file:bg-indigo-50 dark:file:bg-indigo-950/40 file:text-indigo-600 dark:file:text-indigo-400 file:px-3 file:py-1.5 file:rounded-lg hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900 transition-all cursor-pointer mt-1"
            />
          )}
        </div>

        <div>
          <label className={lbl}>Price (₹) *</label>
          <input
            type="number"
            name="price"
            min="1"
            value={form.price}
            onChange={handleFormChange}
            required
            placeholder="999"
            className={inp}
          />
          {formErrors.price && <p className="text-[10px] text-rose-500 font-bold ml-1 mt-0.5">{formErrors.price}</p>}
        </div>

        <div>
          <label className={lbl}>Discount Price (₹)</label>
          <input
            type="number"
            name="discountPrice"
            min="0"
            value={form.discountPrice}
            onChange={handleFormChange}
            placeholder="799"
            className={inp}
          />
        </div>

        <div>
          <label className={lbl}>Category *</label>
          <select
            name="category"
            value={form.category}
            onChange={handleCategoryChangeLocal}
            required
            className={inp}
          >
            <option value="" className="dark:bg-slate-900">
              -- Select Category --
            </option>
            {categories.map((c) => (
              <option key={c._id} value={c._id} className="dark:bg-slate-900">
                {c.name}
              </option>
            ))}
          </select>
          {formErrors.category && <p className="text-[10px] text-rose-500 font-bold ml-1 mt-0.5">{formErrors.category}</p>}
        </div>

        <div>
          <label className={lbl}>Subcategory</label>
          <select
            name="subCategory"
            value={form.subCategory}
            onChange={handleFormChange}
            className={inp}
            disabled={!form.category}
          >
            <option value="" className="dark:bg-slate-900">
              -- Select Subcategory --
            </option>
            {filteredSubs.map((s) => (
              <option key={s._id} value={s._id} className="dark:bg-slate-900">
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={lbl}>Stock *</label>
          <input
            type="number"
            name="stock"
            min="0"
            value={form.stock}
            onChange={handleFormChange}
            required
            placeholder="100"
            className={inp}
          />
          {formErrors.stock && <p className="text-[10px] text-rose-500 font-bold ml-1 mt-0.5">{formErrors.stock}</p>}
        </div>
      </div>

      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all bg-white dark:bg-slate-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-70 flex items-center justify-center gap-1.5"
        >
          {isLoading ? (
            <>
              <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : editing ? (
            "Update Product"
          ) : (
            "Create Product"
          )}
        </button>
      </div>
    </form>
  );
}

export default function AdminProducts() {
  const context = useOutletContext() || {};
  const showToast = typeof context.showToast === "function" ? context.showToast : () => {};
  const dispatch = useAppDispatch();
  const { adminProducts, isLoading, error, successMessage } = useAppSelector(
    (s) => s.product,
  );
  const { categories, subCategories } = useAppSelector((s) => s.category);

  const [zoomedImage, setZoomedImage] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get("filter") || "all";
  const categoryParam = searchParams.get("category") || "";
  const subCategoryParam = searchParams.get("subCategory") || "";

  const stockFilter = ["all", "active", "lowstock", "outofstock"].includes(
    filterParam,
  )
    ? filterParam
    : "all";

  const [modal, setModal] = useState(null); // { editing: null | product }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (adminProducts.length === 0) {
      dispatch(adminFetchProducts());
    }
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
    if (subCategories.length === 0) {
      dispatch(fetchSubCategories());
    }
  }, [dispatch, adminProducts.length, categories.length, subCategories.length]);

  useEffect(() => {
    if (successMessage) {
      showToast(successMessage, "success");
      dispatch(clearProductMessages());
    }
    if (error) {
      showToast(error, "error");
      dispatch(clearProductMessages());
    }
  }, [successMessage, error, dispatch, showToast]);

  const handleSubmit = (fd) => {
    const action = modal.editing
      ? dispatch(adminUpdateProduct({ id: modal.editing._id, formData: fd }))
      : dispatch(adminCreateProduct(fd));
    action.then((r) => {
      if (!r.error) setModal(null);
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    dispatch(adminDeleteProduct(deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleCategoryChange = (catId) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (catId) {
        next.set("category", catId);
      } else {
        next.delete("category");
      }
      next.delete("subCategory");
      return next;
    });
  };

  const handleSubCategoryChange = (subCatId) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (subCatId) {
        next.set("subCategory", subCatId);
      } else {
        next.delete("subCategory");
      }
      return next;
    });
  };

  const statusColor = (s) =>
    ({
      approved:
        "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30",
      pending:
        "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30",
      rejected:
        "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-455 border border-rose-100 dark:border-rose-900/30",
    })[s] ||
    "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800";

  const filtered = adminProducts.filter((p) => {
    const matchesSearch = p.title?.toLowerCase().includes(search.toLowerCase());

    let matchesStock = true;
    if (stockFilter === "active") matchesStock = p.status === "approved";
    else if (stockFilter === "lowstock")
      matchesStock = p.stock > 0 && p.stock < 10;
    else if (stockFilter === "outofstock") matchesStock = p.stock === 0;

    let matchesCategory = true;
    if (categoryParam) {
      const pCatId = p.category?._id || p.category;
      matchesCategory = pCatId === categoryParam;
    }

    let matchesSubCategory = true;
    if (subCategoryParam) {
      const pSubCatId = p.subCategory?._id || p.subCategory;
      matchesSubCategory = pSubCatId === subCategoryParam;
    }

    return (
      matchesSearch && matchesStock && matchesCategory && matchesSubCategory
    );
  });

  // Calculate Product KPIs
  const totalProducts = adminProducts.length;
  const outOfStockCount = adminProducts.filter((p) => p.stock === 0).length;
  const lowStockCount = adminProducts.filter(
    (p) => p.stock > 0 && p.stock < 10,
  ).length;
  const approvedCount = adminProducts.filter(
    (p) => p.status === "approved",
  ).length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-slate-800 dark:text-slate-200 flex-1 min-h-0">
      {/* High-level Products Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 flex-shrink-0">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Icons.Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              Total Products
            </span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {totalProducts} Items
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-455 flex items-center justify-center">
            <Icons.AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              Out of Stock
            </span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {outOfStockCount} Alerts
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Icons.AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              Low Stock Alert
            </span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {lowStockCount} Warnings
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 flex items-center justify-center">
            <Icons.CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              Active Approved
            </span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {approvedCount} Published
            </h3>
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-all shadow-xs"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            <Icons.Search />
          </div>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350 font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Filters + Add Product Button */}
        <div className="flex flex-wrap items-center gap-3.5 self-end sm:self-auto">
          <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl w-max border border-slate-200/50 dark:border-slate-800">
            {[
              { key: "all", label: "All" },
              { key: "active", label: "Active" },
              { key: "lowstock", label: "Low Stock" },
              { key: "outofstock", label: "Out of Stock" },
            ].map((st) => (
              <button
                key={st.key}
                onClick={() => {
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.set("filter", st.key);
                    return next;
                  });
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  stockFilter === st.key
                    ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-250"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setModal({ editing: null })}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all hover:shadow-md hover:shadow-indigo-100 shrink-0 cursor-pointer"
          >
            <Icons.Plus className="w-3.5 h-3.5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Category & Subcategory Filter Row */}
      <div className="flex flex-wrap items-center gap-4 bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Classification:
          </span>
        </div>

        {/* Category Select */}
        <div
          className={`relative ${filterParam === "category" ? "ring-2 ring-indigo-500/50 rounded-xl" : ""}`}
        >
          <select
            value={categoryParam}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="pl-3 pr-8 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
          >
            <option value="" className="dark:bg-slate-900">
              All Categories
            </option>
            {categories.map((c) => (
              <option key={c._id} value={c._id} className="dark:bg-slate-900">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory Select */}
        <div
          className={`relative ${filterParam === "subcategory" ? "ring-2 ring-indigo-500/50 rounded-xl" : ""}`}
        >
          <select
            value={subCategoryParam}
            onChange={(e) => handleSubCategoryChange(e.target.value)}
            disabled={!categoryParam}
            className="pl-3 pr-8 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="" className="dark:bg-slate-900">
              All Subcategories
            </option>
            {subCategories
              .filter((s) => (s.category?._id || s.category) === categoryParam)
              .map((s) => (
                <option key={s._id} value={s._id} className="dark:bg-slate-900">
                  {s.name}
                </option>
              ))}
          </select>
        </div>

        {/* Active Filter Indicators / Clear Button */}
        {(categoryParam || subCategoryParam || filterParam !== "all") && (
          <button
            onClick={() => {
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set("filter", "all");
                next.delete("category");
                next.delete("subCategory");
                return next;
              });
            }}
            className="ml-auto text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-y-auto shadow-xs flex-1 min-h-0">
        <table className="w-full text-left border-collapse text-xs relative">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10">
            <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-4 px-5">Image</th>
              <th className="py-4 px-5">Title</th>
              <th className="py-4 px-5">Price</th>
              <th className="py-4 px-5">Stock</th>
              <th className="py-4 px-5">Category</th>
              <th className="py-4 px-5">Status</th>
              <th className="py-4 px-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {isLoading && filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-slate-400 dark:text-slate-500 font-semibold"
                >
                  Loading products...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-16 text-center text-slate-400 dark:text-slate-500 font-bold"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Icons.Package className="w-10 h-10 text-slate-300 dark:text-slate-650" />
                    <span>
                      {search
                        ? "No products match your search filters."
                        : "No products yet. Add one!"}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p._id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors"
                >
                  <td className="py-4.5 px-5">
                    <img
                      src={firstOrPlaceholder(p.images)}
                      alt={p.title}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100 dark:border-slate-800 cursor-zoom-in hover:opacity-90 transition-all"
                      onClick={() =>
                        setZoomedImage(firstOrPlaceholder(p.images))
                      }
                    />
                  </td>
                  <td className="py-4.5 px-5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-bold text-slate-800 dark:text-slate-200 max-w-[170px] truncate">
                        {p.title}
                      </p>
                      {getVideoUrl(p) && (
                        <span
                          className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 rounded-md text-[8px] font-black uppercase shrink-0"
                          title="Contains Video Demo"
                        >
                          🎥 Video
                        </span>
                      )}
                    </div>
                    {p.description && (
                      <p className="text-slate-400 dark:text-slate-500 mt-0.5 max-w-[200px] truncate">
                        {p.description}
                      </p>
                    )}
                    {getAvailableSizes(p) &&
                      getAvailableSizes(p).length > 0 && (
                        <div className="flex gap-1 flex-wrap mt-1.5">
                          {getAvailableSizes(p).map((s) => (
                            <span
                              key={s}
                              className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 rounded-md text-[8px] font-black uppercase"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                  </td>
                  <td className="py-4.5 px-5">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      ₹{p.price}
                    </p>
                    {p.discountPrice > 0 && (
                      <p className="text-slate-400 dark:text-slate-500 line-through text-[10px]">
                        ₹{p.discountPrice}
                      </p>
                    )}
                  </td>
                  <td className="py-4.5 px-5">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        p.stock === 0
                          ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30"
                          : p.stock < 10
                            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"
                            : "bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-300 border border-slate-100 dark:border-slate-800"
                      }`}
                    >
                      {p.stock} units
                    </span>
                  </td>
                  <td className="py-4.5 px-5 text-slate-500 dark:text-slate-400 font-semibold">
                    {p.category?.name || "—"}
                  </td>
                  <td className="py-4.5 px-5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${statusColor(p.status)}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4.5 px-5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setViewProduct(p)}
                        className="p-2 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 rounded-xl border border-slate-100 dark:border-slate-800 transition-all cursor-pointer"
                        title="View Product Details"
                      >
                        <Icons.Eye />
                      </button>
                      <button
                        onClick={() => setModal({ editing: p })}
                        className="p-2 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 rounded-xl border border-slate-100 dark:border-slate-800 transition-all cursor-pointer"
                      >
                        <Icons.Edit />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteTarget({ id: p._id, name: p.title })
                        }
                        className="p-2 bg-slate-50 dark:bg-slate-950 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-455 rounded-xl border border-slate-100 dark:border-slate-800 transition-all cursor-pointer"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {modal && (
        <Modal
          title={modal.editing ? "Edit Product" : "Add Product"}
          onClose={() => setModal(null)}
          wide
        >
          <ProductForm
            editing={modal.editing}
            categories={categories}
            subCategories={subCategories}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            onCancel={() => setModal(null)}
            onZoomImage={setZoomedImage}
          />
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <Modal title="Confirm Delete" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            Are you sure you want to delete
          </p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-5">
            "{deleteTarget.name}"?
          </p>
          <p className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/20 border border-rose-100/30 dark:border-rose-900/30 px-3 py-2 rounded-xl mb-6 font-semibold">
            This cannot be undone. Product will be permanently removed.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all bg-white dark:bg-slate-900"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              Yes, Delete
            </button>
          </div>
        </Modal>
      )}

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <ImageModal url={zoomedImage} onClose={() => setZoomedImage(null)} />
      )}



      {/* Product Details Modal */}
      {viewProduct && (
        <Modal
          title="Product Detailed Specifications"
          onClose={() => setViewProduct(null)}
          wide
        >
          <div className="flex flex-col gap-5 text-xs text-slate-800 dark:text-slate-200">
            {/* Gallery */}
            <div>
              <span className="block font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[9px] mb-2">
                Image Gallery
              </span>
              <div className="flex gap-2.5 overflow-x-auto pb-2">
                {viewProduct.images?.length > 0 ? (
                  viewProduct.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={resolveOrPlaceholder(img)}
                      alt=""
                      className="w-20 h-20 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shrink-0 cursor-zoom-in hover:opacity-90 transition-all"
                      onClick={() => setZoomedImage(resolveOrPlaceholder(img))}
                    />
                  ))
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-slate-350">
                    No Images
                  </div>
                )}
              </div>
            </div>

            {/* Core Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100/50 dark:border-slate-800/60 rounded-xl">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                  Product Title
                </span>
                <p className="font-extrabold text-slate-800 dark:text-slate-100 text-sm mt-0.5">
                  {viewProduct.title}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100/50 dark:border-slate-800/60 rounded-xl">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                  Classification
                </span>
                <p className="font-extrabold text-slate-800 dark:text-slate-100 text-sm mt-0.5">
                  {viewProduct.category?.name || "General"}
                </p>
              </div>
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                  Retail Price
                </span>
                <p className="font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                  ₹{viewProduct.price}
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                  Discounted Price
                </span>
                <p className="font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  ₹{viewProduct.discountPrice || "—"}
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                  In Stock
                </span>
                <p className="font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                  {viewProduct.stock} units
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <span className="block font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[9px] mb-1.5">
                Description
              </span>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed text-slate-600 dark:text-slate-400 text-[11px] whitespace-pre-line">
                {viewProduct.description || "No product description provided."}
              </div>
            </div>

            {/* Details & Status */}
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-450 uppercase text-[9px]">
                Publication Status
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                  viewProduct.status === "approved"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30"
                    : viewProduct.status === "pending"
                      ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"
                      : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-455 border border-rose-100 dark:border-rose-900/30"
                }`}
              >
                {viewProduct.status}
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
