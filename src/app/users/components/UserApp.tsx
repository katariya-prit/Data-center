import { useState } from "react";
import { createUserByAdminRequest } from "../../../service/admin_service";
import { VscAdd, VscLoading, VscCheck, VscError, VscAccount } from "react-icons/vsc";

interface CreatedUser {
  id: number;
  enrollment: string;
  diskId: string;
}

interface UserAppProps {
  currentUser: { id: string; enrollment: string; role: "admin" | "user"; diskId: string };
}

export default function UserApp({ currentUser }: UserAppProps) {
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

  return (
    <div className="p-6 text-slate-800 h-full overflow-auto bg-[#f5f5f7]">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800">
        <VscAccount className="text-[#0096fd]" />
        User Profile
      </h2>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-md max-w-md">
        <div className="w-16 h-16 rounded-full bg-[#0096fd] flex items-center justify-center text-xl font-bold text-white shadow-inner">
          {currentUser.enrollment.slice(-2)}
        </div>
        <div>
          <h3 className="font-semibold text-base text-slate-800">{currentUser.enrollment}</h3>
          <p className="text-sm text-slate-500 capitalize">{currentUser.role}</p>
          <p className="text-xs text-slate-400 mt-1">Disk: {currentUser.diskId.slice(0, 8)}...</p>
        </div>
      </div>

      {currentUser.role === "admin" && (
        <div className="mt-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-md max-w-md flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-slate-700">Create New User</h3>

            <input
              type="text"
              value={enrollment}
              onChange={(e) => setEnrollment(e.target.value)}
              placeholder="Enrollment number"
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0096fd] focus:ring-1 focus:ring-[#0096fd]/30 transition"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0096fd] focus:ring-1 focus:ring-[#0096fd]/30 transition"
            />

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs">
                <VscError size={14} />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#0096fd] hover:bg-[#0086e0] text-white shadow-md shadow-blue-500/20 transition text-sm font-medium disabled:opacity-50"
            >
              {creating ? <VscLoading className="animate-spin" size={14} /> : <VscAdd size={14} />}
              <span>{creating ? "Creating..." : "Create User"}</span>
            </button>
          </div>

          {createdUsers.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Created This Session</h3>
              <div className="flex flex-col gap-2 max-w-md">
                {createdUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <VscCheck className="text-emerald-500" size={14} />
                      <span className="text-slate-700">{u.enrollment}</span>
                    </div>
                    <span className="text-slate-400">Disk: {u.diskId.slice(0, 8)}...</span>
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