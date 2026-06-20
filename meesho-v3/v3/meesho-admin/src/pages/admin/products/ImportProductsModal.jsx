import { useState, useEffect } from "react";
import { useAppDispatch } from "../../../redux/hooks";
import { createCategory, createSubCategory, fetchCategories, fetchSubCategories } from "../../../redux/slices/categorySlice";
import { adminCreateProduct, adminFetchProducts } from "../../../redux/slices/productSlice";

const Icons = {
  Close: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Check: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Spinner: ({ className = "w-5 h-5 animate-spin" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  ),
  Alert: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
};

export default function ImportProductsModal({ onClose, categories: initialCategories, subCategories: initialSubCategories, adminProducts, showToast }) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [rawProducts, setRawProducts] = useState([]);
  const [analyzed, setAnalyzed] = useState(null);
  const [importStatus, setImportStatus] = useState("idle"); // idle, importing, completed, failed
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [currentStepText, setCurrentStepText] = useState("");
  const [importLogs, setImportLogs] = useState([]);

  // Fetch products from JSON on load
  useEffect(() => {
    fetchOpenApiProducts();
  }, []);

  const fetchOpenApiProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://kolzsticks.github.io/Free-Ecommerce-Products-Api/main/products.json");
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setRawProducts(data);
      analyzeProducts(data);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch products from Open API", "error");
    } finally {
      setLoading(false);
    }
  };

  const analyzeProducts = (productsList) => {
    // Collect unique categories and subcategories from the API products
    const apiCats = [...new Set(productsList.map(p => p.category).filter(Boolean))];
    const apiSubs = []; // { name, parentName }
    productsList.forEach(p => {
      if (p.category && p.subCategory) {
        if (!apiSubs.some(s => s.name === p.subCategory && s.parentName === p.category)) {
          apiSubs.push({ name: p.subCategory, parentName: p.category });
        }
      }
    });

    // Check which categories are missing
    const missingCats = apiCats.filter(catName => 
      !initialCategories.some(c => c.name.toLowerCase() === catName.toLowerCase())
    );

    // Check which subcategories are missing
    const missingSubs = apiSubs.filter(sub => {
      // Find if parent category already exists in initialCategories
      const parent = initialCategories.find(c => c.name.toLowerCase() === sub.parentName.toLowerCase());
      if (!parent) return true; // Parent category is missing, so subcategory must be missing
      
      const parentId = parent._id || parent.id;
      // Parent exists, check if subcategory exists inside this parent
      return !initialSubCategories.some(s => 
        s.name.toLowerCase() === sub.name.toLowerCase() && 
        (s.category?._id || s.category) === parentId
      );
    });

    // Check which products already exist (match by title)
    const existingTitles = new Set(adminProducts.map(p => p.title.toLowerCase().trim()));
    const toImport = productsList.filter(p => !existingTitles.has(p.name.toLowerCase().trim()));
    const alreadyExistsCount = productsList.length - toImport.length;

    setAnalyzed({
      totalApiCount: productsList.length,
      toImport,
      alreadyExistsCount,
      missingCats,
      missingSubs
    });
  };

  const addLog = (text) => {
    setImportLogs(prev => [...prev.slice(-15), text]);
    setCurrentStepText(text);
  };

  const handleImport = async () => {
    if (!analyzed || analyzed.toImport.length === 0) {
      showToast("No new products to import", "info");
      return;
    }

    setImportStatus("importing");
    setProgress({ current: 0, total: analyzed.toImport.length });
    setImportLogs([]);
    addLog("Starting import process...");

    // Store runtime categories/subcategories in local cache mapping
    let currentCategories = [...initialCategories];
    let currentSubCategories = [...initialSubCategories];

    const getSlug = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    try {
      // Step 1: Ensure missing categories are created
      for (const catName of analyzed.missingCats) {
        // Double check local cache in case created during loop
        if (currentCategories.some(c => c.name.toLowerCase() === catName.toLowerCase())) continue;
        
        addLog(`Creating missing category: "${catName}"...`);
        const fd = new FormData();
        fd.append("name", catName);
        fd.append("slug", getSlug(catName));
        
        const actionResult = await dispatch(createCategory(fd));
        if (createCategory.fulfilled.match(actionResult)) {
          const createdCat = actionResult.payload;
          currentCategories.push(createdCat);
          addLog(`✓ Created category: "${createdCat.name}"`);
        } else {
          throw new Error(`Failed to create category: ${catName}`);
        }
      }

      // Step 2: Ensure missing subcategories are created
      for (const apiSub of analyzed.missingSubs) {
        // Find parent category ID
        const parentCat = currentCategories.find(c => c.name.toLowerCase() === apiSub.parentName.toLowerCase());
        if (!parentCat) {
          throw new Error(`Parent category "${apiSub.parentName}" not found for subcategory "${apiSub.name}"`);
        }

        // Check if subcategory already in local cache
        const parentId = parentCat._id || parentCat.id;
        const exists = currentSubCategories.some(s => 
          s.name.toLowerCase() === apiSub.name.toLowerCase() && 
          (s.category?._id || s.category) === parentId
        );
        if (exists) continue;

        addLog(`Creating missing subcategory: "${apiSub.name}" under "${apiSub.parentName}"...`);
        const fd = new FormData();
        fd.append("name", apiSub.name);
        const parentSlug = parentCat.slug || getSlug(parentCat.name);
        fd.append("slug", `${parentSlug}-${getSlug(apiSub.name)}`);
        fd.append("category", parentId);

        const actionResult = await dispatch(createSubCategory(fd));
        if (createSubCategory.fulfilled.match(actionResult)) {
          const createdSub = actionResult.payload;
          currentSubCategories.push(createdSub);
          addLog(`✓ Created subcategory: "${createdSub.name}"`);
        } else {
          throw new Error(`Failed to create subcategory: ${apiSub.name}`);
        }
      }

      // Refresh category list in parent components just in case
      await dispatch(fetchCategories());
      await dispatch(fetchSubCategories());

      // Step 3: Import each product
      let successCount = 0;
      const totalCount = analyzed.toImport.length;

      for (let i = 0; i < totalCount; i++) {
        const prod = analyzed.toImport[i];
        setProgress(prev => ({ ...prev, current: i + 1 }));
        addLog(`[${i + 1}/${totalCount}] Processing product: "${prod.name}"...`);

        try {
          // Find matching category ID
          const parentCat = currentCategories.find(c => c.name.toLowerCase() === prod.category.toLowerCase());
          const parentCatId = parentCat?._id || parentCat?.id;

          // Find matching subcategory ID
          const subCat = currentSubCategories.find(s => 
            s.name.toLowerCase() === prod.subCategory.toLowerCase() && 
            (s.category?._id || s.category || s.categoryGroupId) === parentCatId
          );
          const subCatId = subCat?._id || subCat?.id;

          if (!parentCatId) {
            addLog(`⚠️ Skipping "${prod.name}": Category not found in database.`);
            continue;
          }

          // Fetch the product image
          addLog(`Downloading image for "${prod.name}"...`);
          let imageFile = null;
          try {
            const imgResponse = await fetch(prod.image);
            if (!imgResponse.ok) throw new Error("Failed to fetch image");
            const blob = await imgResponse.blob();
            const ext = blob.type.split("/")[1] || "jpg";
            imageFile = new File([blob], `product_${prod.id}.${ext}`, { type: blob.type });
          } catch (imgErr) {
            addLog(`⚠️ Image download failed for "${prod.name}": ${imgErr.message}. Importing without image.`);
          }

          // Construct product FormData
          const fd = new FormData();
          fd.append("title", prod.name);
          fd.append("description", prod.description || `High-quality ${prod.name}.`);
          
          // Price in Rupees: Map priceCents directly as Rupees (fits premium catalog)
          // 2000 cents -> ₹2000 price, and discountPrice -> ₹2600 (30% off)
          const price = prod.priceCents;
          fd.append("price", price);
          fd.append("discountPrice", Math.round(price * 1.3));
          
          fd.append("category", parentCatId);
          if (subCatId) {
            fd.append("subCategory", subCatId);
          }
          fd.append("stock", 100);

          // Sizes: Default to Free Size for Beauty/Electronics, S/M/L/XL for Apparel
          const catLower = prod.category.toLowerCase();
          const subLower = prod.subCategory?.toLowerCase() || "";
          let sizesList = ["Free Size"];
          if (catLower.includes("clothing") || catLower.includes("apparel") || subLower.includes("shirt") || subLower.includes("dress")) {
            sizesList = ["S", "M", "L", "XL"];
          }
          sizesList.forEach(sz => {
            fd.append("sizes", sz);
            fd.append("size", sz);
          });

          if (imageFile) {
            fd.append("images", imageFile);
          }

          addLog(`Uploading and creating product: "${prod.name}"...`);
          const actionResult = await dispatch(adminCreateProduct(fd));
          if (adminCreateProduct.fulfilled.match(actionResult)) {
            successCount++;
            addLog(`✓ Successfully imported: "${prod.name}"`);
          } else {
            const errMsg = actionResult.payload || "API Error";
            addLog(`❌ Failed to create product "${prod.name}": ${errMsg}`);
          }
        } catch (prodErr) {
          console.error(prodErr);
          addLog(`❌ Error importing "${prod.name}": ${prodErr.message}`);
        }
      }

      addLog(`Import finished. Successfully registered ${successCount} of ${totalCount} new products!`);
      setImportStatus("completed");
      showToast(`Successfully imported ${successCount} products!`, "success");
      
      // Refresh admin products list
      dispatch(adminFetchProducts());

    } catch (err) {
      console.error(err);
      addLog(`❌ Critical error during import process: ${err.message}`);
      setImportStatus("failed");
      showToast(err.message || "Import process encountered a critical error", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Sync Products from Open API
          </h3>
          {importStatus !== "importing" && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer"
            >
              <Icons.Close />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
          
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-450">
              <Icons.Spinner className="w-8 h-8 text-indigo-600" />
              <p className="font-semibold text-xs">Fetching and analyzing Open API catalog...</p>
            </div>
          )}

          {!loading && analyzed && importStatus === "idle" && (
            <div className="flex flex-col gap-4">
              
              {/* Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100/50 dark:border-slate-850 rounded-xl">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Total API Items</span>
                  <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-0.5">{analyzed.totalApiCount}</p>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100/50 dark:border-slate-850 rounded-xl">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Ready to Import</span>
                  <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{analyzed.toImport.length}</p>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100/50 dark:border-slate-850 rounded-xl">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Already Exists</span>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-450 mt-0.5">{analyzed.alreadyExistsCount}</p>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100/50 dark:border-slate-850 rounded-xl">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">New Categories</span>
                  <p className="text-lg font-black text-amber-600 dark:text-amber-450 mt-0.5">{analyzed.missingCats.length + analyzed.missingSubs.length}</p>
                </div>
              </div>

              {/* Taxonomy warnings */}
              {(analyzed.missingCats.length > 0 || analyzed.missingSubs.length > 0) && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl text-amber-800 dark:text-amber-400 flex items-start gap-3">
                  <Icons.Alert className="shrink-0 w-5 h-5 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="font-bold text-xs">Dynamic Taxonomy Creation Required</h5>
                    <p className="text-[10px] leading-relaxed mt-1 text-amber-700/90 dark:text-amber-400/90 font-medium">
                      The open API products list contains new categories/subcategories that do not exist in your database:
                      {analyzed.missingCats.length > 0 && ` Categories (${analyzed.missingCats.join(", ")}).`}
                      {analyzed.missingSubs.length > 0 && ` Subcategories (${analyzed.missingSubs.map(s=>s.name).join(", ")}).`}
                      {" "}These will be automatically created first during the import process.
                    </p>
                  </div>
                </div>
              )}

              {/* Preview items list */}
              <div>
                <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">
                  Products to be Imported ({analyzed.toImport.length})
                </h4>
                {analyzed.toImport.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl font-bold">
                    All open API products already exist in your local products database.
                  </div>
                ) : (
                  <div className="border border-slate-100 dark:border-slate-850 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-850 max-h-[250px] overflow-y-auto">
                    {analyzed.toImport.map((p) => (
                      <div key={p.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850/20 transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-100 dark:border-slate-800 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-sm sm:max-w-md">{p.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] font-black text-indigo-500 uppercase">{p.category}</span>
                              <span className="text-[8px] text-slate-400 font-bold">•</span>
                              <span className="text-[9px] text-slate-400 font-semibold">{p.subCategory}</span>
                            </div>
                          </div>
                        </div>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 text-right shrink-0">
                          ₹{p.priceCents}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Importing Progress state */}
          {importStatus === "importing" && (
            <div className="flex flex-col gap-4 py-4">
              
              {/* Progress bar */}
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Icons.Spinner className="w-4 h-4" /> Import in progress...
                </span>
                <span>{progress.current} / {progress.total} Products ({Math.round((progress.current / progress.total) * 100)}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300 shadow-md shadow-indigo-200 dark:shadow-none"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>

              {/* Logs area */}
              <div className="mt-2">
                <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Live Import console logs</span>
                <div className="bg-slate-950 text-emerald-450 p-4 rounded-xl border border-slate-850 font-mono text-[10px] leading-relaxed max-h-[160px] overflow-y-auto flex flex-col gap-1 select-text scrollbar-none">
                  {importLogs.map((log, index) => (
                    <div key={index} className="truncate">
                      <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                      {log}
                    </div>
                  ))}
                  <div className="text-indigo-400 font-bold border-t border-slate-900 pt-1 mt-1 truncate">
                    &gt; {currentStepText}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Completed state */}
          {(importStatus === "completed" || importStatus === "failed") && (
            <div className="flex flex-col items-center justify-center py-8 gap-4 text-center select-none">
              
              {importStatus === "completed" ? (
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl shadow-lg">
                  ✓
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-955/40 border-2 border-rose-500 text-rose-600 dark:text-rose-455 flex items-center justify-center text-3xl shadow-lg">
                  !
                </div>
              )}

              <div className="max-w-md">
                <h4 className="text-sm font-black text-slate-850 dark:text-slate-100">
                  {importStatus === "completed" ? "API Sync Process Successful!" : "Sync Process Failed"}
                </h4>
                <p className="text-slate-400 mt-2 font-medium leading-relaxed">
                  {importStatus === "completed" 
                    ? "New products and missing taxonomies have been successfully registered. The dashboard catalogs have been refreshed automatically." 
                    : "The import procedure was aborted due to a critical error. Check the console logs for diagnostic details."}
                </p>
              </div>

              {/* Logs summary for debugging */}
              <div className="w-full text-left max-w-md mt-2">
                <div className="bg-slate-950 text-slate-400 p-4 rounded-xl font-mono text-[9px] leading-normal max-h-[120px] overflow-y-auto">
                  {importLogs.map((log, index) => (
                    <div key={index} className="truncate">{log}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4.5 border-t border-slate-100 dark:border-slate-800">
          {importStatus !== "importing" && (
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-650 dark:text-slate-300 transition-all cursor-pointer bg-white dark:bg-slate-900"
            >
              {importStatus === "idle" ? "Cancel" : "Close"}
            </button>
          )}
          {importStatus === "idle" && analyzed && analyzed.toImport.length > 0 && (
            <button
              onClick={handleImport}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all hover:shadow-md cursor-pointer"
            >
              Import {analyzed.toImport.length} Products
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
