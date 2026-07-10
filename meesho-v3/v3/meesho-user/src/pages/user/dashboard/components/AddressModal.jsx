import { useState } from "react";
import { useAppDispatch } from "../../../../redux/hooks";
import { addUserAddress, fetchAddresses } from "../../../../redux/slices/userSlice";

const Icons = {
  Close: () => (
    <svg className="w-5 h-5 transition-transform duration-300 hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

export default function AddressModal({ onClose }) {
  const dispatch = useAppDispatch();

  const [addressForm, setAddressForm] = useState({
    fullName: "",
    mobile: "",
    pincode: "",
    state: "",
    city: "",
    addressLine: "",
    landmark: "",
    addressType: "Home",
    isDefault: false,
  });
  const [errors, setErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState([]);

  const validateField = (name, value) => {
    let error = "";
    if (name === "fullName" && !value.trim()) error = "Full Name is required.";
    else if (name === "mobile") {
      if (!value.trim()) error = "Mobile Contact is required.";
      else if (!/^\d{10}$/.test(value.trim())) error = "Enter a valid 10-digit mobile number.";
    }
    else if (name === "pincode") {
      if (!value.trim()) error = "Pincode is required.";
      else if (!/^\d{6}$/.test(value.trim())) error = "Enter a valid 6-digit pin code.";
    }
    else if (name === "city" && !value.trim()) error = "City is required.";
    else if (name === "state" && !value.trim()) error = "State is required.";
    else if (name === "addressLine" && !value.trim()) error = "Address Details are required.";
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;

    setAddressForm((prev) => {
      const newForm = { ...prev, [name]: finalValue };
      if (type !== "checkbox" && name !== "landmark") {
        const fieldError = validateField(name, finalValue);
        setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          if (fieldError) newErrors[name] = fieldError;
          else delete newErrors[name];
          return newErrors;
        });
      }
      return newForm;
    });
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setBackendErrors([]);

    const newErrors = {};
    Object.keys(addressForm).forEach((key) => {
      if (key !== "addressType" && key !== "isDefault" && key !== "landmark") {
        const error = validateField(key, addressForm[key]);
        if (error) newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await dispatch(addUserAddress(addressForm)).unwrap();
      dispatch(fetchAddresses());
      onClose();
    } catch (err) {
      if (err && typeof err === 'object') {
        if (err.errors && Array.isArray(err.errors)) {
          setBackendErrors(err.errors);
        } else if (err.message) {
          setBackendErrors([err.message]);
        } else {
          setBackendErrors(['Failed to add address']);
        }
      } else if (typeof err === 'string') {
        setBackendErrors([err]);
      } else {
        setBackendErrors(['Failed to add address']);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 my-8 overflow-hidden text-slate-805 dark:text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 sticky top-0 z-10">
          <h3 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-widest">
            Add Shipping Address
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 rounded-xl transition-all cursor-pointer bg-transparent border-0"
          >
            <Icons.Close />
          </button>
        </div>

        <form onSubmit={handleAddAddress} noValidate>
          <div className="p-6 flex flex-col gap-4 text-xs font-semibold">
            {/* Input - Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-550 dark:text-slate-400">Full Name *</label>
              <input
                type="text"
                name="fullName"
                required
                value={addressForm.fullName}
                onChange={handleChange}
                placeholder="Receiver's name"
                className="px-3.5 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-hidden focus:border-[#9F2089] dark:focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 bg-slate-50 dark:bg-slate-950 transition-all text-slate-805 dark:text-slate-100 font-bold"
              />
              {errors.fullName && <p className="text-rose-500 text-[10px] font-bold mt-0.5 ml-1 animate-fade-in">{errors.fullName}</p>}
            </div>

            {/* Input - Contact */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-550 dark:text-slate-400">Mobile Contact *</label>
              <input
                type="tel"
                name="mobile"
                required
                value={addressForm.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className="px-3.5 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-hidden focus:border-[#9F2089] dark:focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 bg-slate-50 dark:bg-slate-950 transition-all text-slate-805 dark:text-slate-100 font-bold"
              />
              {errors.mobile && <p className="text-rose-500 text-[10px] font-bold mt-0.5 ml-1 animate-fade-in">{errors.mobile}</p>}
            </div>

            {/* Grid - Pincode & City */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-550 dark:text-slate-400">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  value={addressForm.pincode}
                  onChange={handleChange}
                  placeholder="6-digit pin code"
                  className="px-3.5 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-hidden focus:border-[#9F2089] dark:focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 bg-slate-50 dark:bg-slate-950 transition-all text-slate-805 dark:text-slate-100 font-bold"
                />
                {errors.pincode && <p className="text-rose-500 text-[10px] font-bold mt-0.5 ml-1 animate-fade-in">{errors.pincode}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-550 dark:text-slate-400">City *</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={addressForm.city}
                  onChange={handleChange}
                  placeholder="City name"
                  className="px-3.5 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-hidden focus:border-[#9F2089] dark:focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 bg-slate-50 dark:bg-slate-950 transition-all text-slate-805 dark:text-slate-100 font-bold"
                />
                {errors.city && <p className="text-rose-500 text-[10px] font-bold mt-0.5 ml-1 animate-fade-in">{errors.city}</p>}
              </div>
            </div>

            {/* Input - State */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-550 dark:text-slate-400">State *</label>
              <input
                type="text"
                name="state"
                required
                value={addressForm.state}
                onChange={handleChange}
                placeholder="State name"
                className="px-3.5 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-hidden focus:border-[#9F2089] dark:focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 bg-slate-50 dark:bg-slate-950 transition-all text-slate-805 dark:text-slate-100 font-bold"
              />
              {errors.state && <p className="text-rose-500 text-[10px] font-bold mt-0.5 ml-1 animate-fade-in">{errors.state}</p>}
            </div>

            {/* Input - Address details */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-550 dark:text-slate-400">Address Details *</label>
              <input
                type="text"
                name="addressLine"
                required
                value={addressForm.addressLine}
                onChange={handleChange}
                placeholder="House No., Building, Street Name"
                className="px-3.5 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-hidden focus:border-[#9F2089] dark:focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 bg-slate-50 dark:bg-slate-950 transition-all text-slate-805 dark:text-slate-100 font-bold"
              />
              {errors.addressLine && <p className="text-rose-500 text-[10px] font-bold mt-0.5 ml-1 animate-fade-in">{errors.addressLine}</p>}
            </div>

            {/* Input - Landmark */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-550 dark:text-slate-400">Landmark</label>
              <input
                type="text"
                name="landmark"
                value={addressForm.landmark}
                onChange={handleChange}
                placeholder="Famous spot nearby (optional)"
                className="px-3.5 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-hidden focus:border-[#9F2089] dark:focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 bg-slate-50 dark:bg-slate-950 transition-all text-slate-805 dark:text-slate-100 font-bold"
              />
            </div>

            {/* Address Type selection pills */}
            <div className="flex items-center justify-between gap-4 py-1.5">
              <span className="text-slate-550 dark:text-slate-450">Address Type:</span>
              <div className="flex gap-2.5">
                {["Home", "Office"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setAddressForm({ ...addressForm, addressType: type })
                    }
                    className={`px-5 py-2.5 border rounded-2xl text-xs font-black transition-all cursor-pointer ${addressForm.addressType === type
                      ? "border-[#9F2089] text-[#9F2089] bg-pink-500/10 dark:border-pink-500 dark:text-pink-400 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-850"
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkbox default address */}
            <label className="flex items-center gap-2.5 mt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                name="isDefault"
                checked={addressForm.isDefault}
                onChange={handleChange}
                className="text-[#9F2089] focus:ring-[#9F2089] dark:text-pink-500 w-4 h-4 rounded-md border-slate-300 dark:border-slate-800"
              />
              <span className="text-slate-550 dark:text-slate-450 font-bold">
                Set as Default Delivery Address
              </span>
            </label>

            {backendErrors.length > 0 && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/90 border border-rose-100 dark:border-rose-800 rounded-2xl flex flex-col gap-1.5 text-[11px] font-bold text-rose-800 dark:text-rose-300 mt-2 animate-fade-in">
                {backendErrors.map((msg, index) => (
                  <div key={index} className="flex items-start gap-1.5">
                    <span className="shrink-0 text-rose-500 mt-0.5">•</span>
                    <span>{msg}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4.5 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-850 rounded-b-3xl flex gap-3.5 text-xs">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 rounded-2xl font-black transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-97 text-center uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#9F2089] hover:bg-[#851b72] text-white rounded-2xl font-black transition-all cursor-pointer active:scale-97 text-center uppercase tracking-wider shadow-md shadow-pink-500/15"
            >
              Add Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
