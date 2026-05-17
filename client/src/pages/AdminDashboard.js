import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyUserIds, setBusyUserIds] = useState(new Set());

  const canAccess = useMemo(() => {
    return user?.role === 'admin';
  }, [user?.role]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.listUsers();
      setUsers(res.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setBusy = (id, val) => {
    setBusyUserIds((prev) => {
      const next = new Set(prev);
      if (val) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const blockUser = async (id) => {
    setBusy(id, true);
    try {
      const res = await adminService.blockUser(id);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, isBlocked: res.data.isBlocked } : u)));
      toast.success('User blocked');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to block user');
    } finally {
      setBusy(id, false);
    }
  };

  const unblockUser = async (id) => {
    setBusy(id, true);
    try {
      const res = await adminService.unblockUser(id);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, isBlocked: res.data.isBlocked } : u)));
      toast.success('User unblocked');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to unblock user');
    } finally {
      setBusy(id, false);
    }
  };

  const removeUser = async (id) => {
    const ok = window.confirm('This will permanently delete the user. Continue?');
    if (!ok) return;

    setBusy(id, true);
    try {
      await adminService.removeUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success('User removed');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to remove user');
    } finally {
      setBusy(id, false);
    }
  };

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
        <div className="max-w-lg text-center">
          <h1 className="text-2xl font-bold mb-3">Admin only</h1>
          <p className="text-gray-300 mb-6">
            Your account does not have admin permissions.
          </p>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-lg font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-300 mt-1">Block/unblock or remove users</p>
        </div>
        <div className="text-right text-gray-200">
          <div className="font-semibold">Signed in as</div>
          <div className="text-sm break-all">{user?.email}</div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-white">Loading...</div>
      ) : (
        <div className="bg-gray-900/60 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-800/60 text-gray-200">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Blocked</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((u) => {
                  const busy = busyUserIds.has(u._id);
                  return (
                    <tr key={u._id} className="text-gray-100">
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-gray-200 break-all">{u.email}</td>
                      <td className="px-4 py-3">{u.role}</td>
                      <td className="px-4 py-3">
                        {u.isBlocked ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-500/20 text-red-200 border border-red-400/30">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-500/20 text-green-200 border border-green-400/30">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {!u.isBlocked ? (
                            <button
                              disabled={busy}
                              onClick={() => blockUser(u._id)}
                              className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold"
                            >
                              {busy ? 'Working...' : 'Block'}
                            </button>
                          ) : (
                            <button
                              disabled={busy}
                              onClick={() => unblockUser(u._id)}
                              className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold"
                            >
                              {busy ? 'Working...' : 'Unblock'}
                            </button>
                          )}

                          <button
                            disabled={busy}
                            onClick={() => removeUser(u._id)}
                            className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-800 disabled:opacity-60 text-white font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="p-6 text-gray-300">No users found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

