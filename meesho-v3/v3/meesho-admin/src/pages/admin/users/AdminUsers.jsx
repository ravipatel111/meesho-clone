import { useState, useEffect } from "react";
import { resolveOrPlaceholder, resolveImageUrl } from "../../../utils/imageUrl";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  fetchAllUsers,
  updateUserRole,
  deleteUser,
  blockUser,
  unblockUser,
} from "../../../redux/slices/adminSlice";
import { useOutletContext } from "react-router-dom";

const getProfileImageUrl = (img) => resolveImageUrl(img);

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────
const Icons = {
  Search: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Users: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Eye: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Trash: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Close: ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Info: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Lock: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Unlock: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
    </svg>
  ),
};

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-xl border border-slate-100 dark:border-slate-800 my-8 text-xs">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 rounded-t-2xl z-10">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer">
            <Icons.Close />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[75vh]">{children}</div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const dispatch = useAppDispatch();
  const _usersContext = useOutletContext() || {};
  const isDarkMode = _usersContext.isDarkMode ?? false;
  const showToast = typeof _usersContext.showToast === "function" ? _usersContext.showToast : () => {};

  const {
    users,
    isLoading: adminLoading,
    error: adminError,
  } = useAppSelector((s) => s.admin);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [userToDelete, setUserToDelete] = useState(null);
  const [viewUser, setViewUser] = useState(null);

  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchAllUsers());
    }
  }, [dispatch, users.length]);

  useEffect(() => {
    if (adminError) showToast(adminError, "error");
  }, [adminError]);

  const handleRoleChange = async (userId, role) => {
    try {
      await dispatch(updateUserRole({ userId, role })).unwrap();
      showToast("User role updated successfully!", "success");
    } catch (err) {
      showToast(err || "Failed to update user role", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await dispatch(deleteUser(userToDelete._id || userToDelete.id)).unwrap();
      showToast("User account deleted successfully!", "success");
      setUserToDelete(null);
    } catch (err) {
      showToast(err || "Failed to delete user account", "error");
      setUserToDelete(null);
    }
  };

  const handleBlock = async (userId) => {
    try {
      await dispatch(blockUser(userId)).unwrap();
      showToast("User account has been blocked successfully!", "success");
    } catch (err) {
      showToast(err || "Failed to block user account", "error");
    }
  };

  const handleUnblock = async (userId) => {
    try {
      await dispatch(unblockUser(userId)).unwrap();
      showToast("User account has been unblocked successfully!", "success");
    } catch (err) {
      showToast(err || "Failed to unblock user account", "error");
    }
  };

  const filtered = (users || []).filter((u) => {
    const nameMatch = (u.username || u.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = (u.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = nameMatch || emailMatch;
    const matchesRole = roleFilter === "all" || (u.role || "user").toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className={`flex flex-col gap-6 flex-1 min-h-0 overflow-hidden ${isDarkMode ? "dark" : ""}`}>

      {/* Delete Confirm Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in text-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 flex items-center justify-center mb-4">
              <Icons.Trash className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Delete User Account</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1 leading-relaxed">Are you absolutely sure you want to delete the account for:</p>
            <p className="text-slate-800 dark:text-slate-200 text-sm font-bold mb-4">
              {userToDelete.email} ({userToDelete.name || "No Name"})
            </p>
            <p className="text-rose-600 dark:text-rose-400 text-xs font-semibold mb-6 flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/20 px-3 py-2 rounded-xl border border-rose-100/50 dark:border-rose-900/30">
              <Icons.Info className="w-4 h-4 shrink-0" />
              This action is permanent and cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setUserToDelete(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all bg-white dark:bg-slate-900">Cancel</button>
              <button onClick={handleConfirmDelete} className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-all">Delete Account</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-xs flex-shrink-0">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
          User Management
        </h2>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="relative max-w-sm w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Name or Email..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-600/30 transition-all bg-slate-50/50 dark:bg-slate-950 dark:text-slate-100"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              <Icons.Search className="w-4 h-4" />
            </div>
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-bold">
                ×
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl w-max border border-slate-100 dark:border-slate-800">
            {["all", "admin", "user"].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${roleFilter === role ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"}`}
              >
                {role === "all" ? "All Roles" : `${role}s`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex-1 min-h-[320px] flex flex-col">
        {adminLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-600/20 border-t-indigo-600 animate-spin" />
            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Fetching directory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800">
              <Icons.Users className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">No Accounts Found</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
              We couldn't find any user profiles matching your keywords or filter choices.
            </p>
          </div>
        ) : (
          <div className="overflow-auto flex-1 min-h-0 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs relative">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10">
                <tr className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-4 px-6">Avatar</th>
                  <th className="py-4 px-6">Account Name</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((u) => {
                  const uId = u._id || u.id;
                  const initial = (u.username || u.name || u.email || "U").charAt(0).toUpperCase();
                  return (
                    <tr key={uId} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center border border-slate-200/50 dark:border-slate-700 overflow-hidden shrink-0">
                          {getProfileImageUrl(u.profileImage) ? (
                            <img src={getProfileImageUrl(u.profileImage)} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                          ) : initial}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-200">
                        {u.username || u.name || "—"}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400">
                        {u.email}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isBlocked
                            ? "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-455 border border-rose-100 dark:border-rose-900/30"
                            : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isBlocked ? "bg-rose-500" : "bg-emerald-500"}`} />
                          {u.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setViewUser(u)}
                            className="p-2 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 rounded-xl border border-slate-100 dark:border-slate-800 transition-all cursor-pointer active:scale-95"
                            title="View User Details"
                          >
                            <Icons.Eye className="w-3.5 h-3.5" />
                          </button>
                          {u.role !== "admin" && (
                            u.isBlocked ? (
                              <button
                                onClick={() => handleUnblock(uId)}
                                className="p-2 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl transition-all inline-flex items-center gap-1 border border-emerald-100/50 dark:border-emerald-900/30 active:scale-95 cursor-pointer"
                                title="Unblock User Account"
                              >
                                <Icons.Unlock className="w-3.5 h-3.5" />
                                <span className="font-bold text-[10px]">Unblock</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBlock(uId)}
                                className="p-2 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-650 dark:text-amber-400 rounded-xl transition-all inline-flex items-center gap-1 border border-amber-100/50 dark:border-amber-900/30 active:scale-95 cursor-pointer"
                                title="Block User Account"
                              >
                                <Icons.Lock className="w-3.5 h-3.5" />
                                <span className="font-bold text-[10px]">Block</span>
                              </button>
                            )
                          )}
                          <button
                            onClick={() => setUserToDelete(u)}
                            className="p-2 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl transition-all inline-flex items-center gap-1 border border-rose-100/50 dark:border-rose-900/30 active:scale-95 cursor-pointer"
                            title="Delete User Account"
                          >
                            <Icons.Trash className="w-3.5 h-3.5" />
                            <span className="font-bold text-[10px]">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User View Modal */}
      {viewUser && (
        <Modal title="User Account Dossier" onClose={() => setViewUser(null)}>
          <div className="flex flex-col items-center gap-4 text-xs text-slate-800 dark:text-slate-200">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-850 text-slate-600 font-black flex items-center justify-center border border-slate-200 dark:border-slate-700 text-2xl shadow-xs overflow-hidden shrink-0">
              {getProfileImageUrl(viewUser.profileImage) ? (
                <img src={getProfileImageUrl(viewUser.profileImage)} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                (viewUser.username || viewUser.name || viewUser.email || "U").charAt(0).toUpperCase()
              )}
            </div>
            <div className="w-full flex flex-col gap-4 mt-2">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100/50 dark:border-slate-800/60 rounded-xl">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Account Name</span>
                <p className="font-extrabold text-slate-800 dark:text-slate-100 text-sm mt-0.5">{viewUser.username || viewUser.name || "—"}</p>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100/50 dark:border-slate-800/60 rounded-xl">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Email Address</span>
                <p className="font-extrabold text-slate-850 dark:text-slate-200 text-xs mt-0.5 select-all">{viewUser.email}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-center">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Account Role</span>
                  <p className="font-bold text-indigo-600 dark:text-indigo-400 capitalize mt-0.5">{viewUser.role || "user"}</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-center">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Account ID</span>
                  <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5 truncate select-all" title={viewUser._id || viewUser.id}>
                    {(viewUser._id || viewUser.id || "—").substring(0, 8)}...
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-center">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Status</span>
                  <p className={`font-bold mt-0.5 capitalize ${viewUser.isBlocked ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-450"}`}>
                    {viewUser.isBlocked ? "Blocked" : "Active"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
