import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { createUserByAdminRequest } from "../../service/admin_service";
import { VscAdd, VscLoading, VscCheck, VscError, VscAccount } from "react-icons/vsc";

interface CreatedUser {
  id: number;
  enrollment: string;
  diskId: string;
}

export default function UsersApp() {
  const { user: currentUser } = useAuth();

  const [enrollment, setEnrollment] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUsers, setCreatedUsers] = useState<CreatedUser[]>([]);

  const handleCreate = async () => {
    if (!enrollment.trim() || !password.trim()) {
      setError("Enrollment ane password banne jaruri chhe.");
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const res = await createUserByAdminRequest(enrollment.trim(), password);
      setCreatedUsers((prev) => [res.user, ...prev]);
      setEnrollment("");
      setPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to create user.");
    } finally {
      setCreating(false);
    }
  };

  if (!currentUser) {
    return <div className="p-6 text-white/60 text-sm">Unable to load profile.</div>;
  }

  return (
    <div className="p-6 text-white h-full overflow-auto bg-[#11131e]">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <VscAccount className="text-blue-400" />
        User Profile
      </h2>

      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 max-w-md">
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold">
          {currentUser.enrollment.slice(-2)}
        </div>
        <div>
          <h3 className="font-semibold text-lg">{currentUser.enrollment}</h3>
          <p className="text-sm text-white/50 capitalize">{currentUser.role}</p>
          <p className="text-xs text-white/30 mt-1">Disk: {currentUser.diskId.slice(0, 8)}...</p>
        </div>
      </div>

      {currentUser.role === "admin" && (
        <div className="mt-6">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 max-w-md flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-white/80">Create New User</h3>

            <input
              type="text"
              value={enrollment}
              onChange={(e) => setEnrollment(e.target.value)}
              placeholder="Enrollment number"
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
            />

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs">
                <VscError size={14} />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 transition text-sm font-medium disabled:opacity-50"
            >
              {creating ? <VscLoading className="animate-spin" size={14} /> : <VscAdd size={14} />}
              <span>{creating ? "Creating..." : "Create User"}</span>
            </button>
          </div>

          {createdUsers.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-white/80 mb-2">Created This Session</h3>
              <div className="flex flex-col gap-2 max-w-md">
                {createdUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <VscCheck className="text-emerald-400" size={14} />
                      <span>{u.enrollment}</span>
                    </div>
                    <span className="text-white/30">Disk: {u.diskId.slice(0, 8)}...</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}