import { useState, useEffect } from "react";
import { useOutletContext, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../../../api/AxiosInterceptor";

const SubAdmins = () => {
  const user = useSelector((s) => s.auth?.user);
  const { showToast } = useOutletContext();

  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New admin form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fetchSubAdmins = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/admin/subadmins");
      if (res.data.success) {
        setSubAdmins(res.data.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to fetch sub-admins", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.adminRole === "superadmin") {
      fetchSubAdmins();
    }
  }, [user]);

  // Protect client view
  if (!user || user.adminRole !== "superadmin") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast("Please fill in all fields", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await axiosInstance.post("/admin/subadmins", {
        name,
        email,
        password,
      });

      if (res.data.success) {
        showToast(res.data.message || "Sub-Admin created successfully!", "success");
        setModalOpen(false);
        setName("");
        setEmail("");
        setPassword("");
        fetchSubAdmins();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create Sub-Admin", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleBlock = async (adminId) => {
    try {
      const res = await axiosInstance.patch(`/admin/subadmins/${adminId}/block`);
      if (res.data.success) {
        showToast(res.data.message || "Admin status updated!", "success");
        fetchSubAdmins();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update admin status", "error");
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm("Are you sure you want to delete this administrator?")) return;

    try {
      const res = await axiosInstance.delete(`/admin/subadmins/${adminId}`);
      if (res.data.success) {
        showToast(res.data.message || "Admin deleted successfully", "success");
        fetchSubAdmins();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete admin", "error");
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Sub-Admins Directory</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage administrative credentials, lock accounts, or register new Sub-Admins.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 self-start sm:self-center px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-600/10 cursor-pointer transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Sub-Admin
        </button>
      </div>

      {/* Main content table */}
      <div className="flex-1 min-h-[320px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs overflow-auto flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : subAdmins.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200">No Sub-Admins Registered</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              You haven't added any secondary administrators yet. Click the button above to add one.
            </p>
          </div>
        ) : (
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {subAdmins.map((admin) => (
                    <tr key={admin._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {admin.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        {admin.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          admin.role === "superadmin"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                            : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                        }`}>
                          {admin.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          admin.isBlocked
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        }`}>
                          {admin.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {admin.role !== "superadmin" && (
                          <div className="flex justify-end items-center gap-2">
                            <button
                              onClick={() => handleToggleBlock(admin._id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                admin.isBlocked
                                  ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 dark:text-emerald-400"
                                  : "bg-amber-50 hover:bg-amber-100 text-amber-600 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 dark:text-amber-400"
                              }`}
                            >
                              {admin.isBlocked ? "Unblock" : "Block"}
                            </button>
                            <button
                              onClick={() => handleDeleteAdmin(admin._id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 dark:text-rose-400 transition-all cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-md font-extrabold text-slate-800 dark:text-slate-200">Register Sub-Admin</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddAdmin} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                  placeholder="e.g. Admin John"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                  placeholder="e.g. john@meesho.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {submitting ? "Registering..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAdmins;
