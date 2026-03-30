import { useState } from "react";
import { Building2, MapPin, Phone, Mail, Users, Shield, Bell, RefreshCw, Database, Download, Trash2, Pencil, UserMinus, Lock, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { Badge, Btn, Modal, SmartSelect } from "../../components/ui";
import { useAppStore } from "../../stores/useAppStore";

interface TeamMember {
  name: string;
  email: string;
  role: string;
  roleColor: string;
  status: "active" | "inactive";
  permissions: Record<string, boolean>;
}

/* ── All platform sections that can be toggled ── */
const platformSections = [
  { group: "CRM", items: [{ id: "projects", label: "Projects" }, { id: "leads", label: "Leads Pipeline" }] },
  { group: "INSPECTIONS", items: [{ id: "inspections", label: "Drone Inspections" }, { id: "drone-flight", label: "Drone Flight Mgmt" }, { id: "ai-analysis", label: "AI Damage Analysis" }] },
  { group: "STORM INTEL", items: [{ id: "storm", label: "Storm Center" }, { id: "storm-history", label: "Storm History" }] },
  { group: "AI TOOLS", items: [{ id: "ai-tools", label: "AI Tools" }] },
  { group: "ESTIMATES", items: [{ id: "estimates", label: "Estimates" }, { id: "pricelist", label: "Price List" }, { id: "supplements", label: "Supplements" }] },
  { group: "SCHEDULING", items: [{ id: "calendar", label: "Calendar" }, { id: "crews", label: "Crews" }] },
  { group: "FINANCIAL", items: [{ id: "invoices", label: "Invoices" }, { id: "reports", label: "Reports" }, { id: "expenses", label: "Job Expenses" }] },
  { group: "CONTRACTS", items: [{ id: "contracts", label: "Contracts" }, { id: "templates", label: "Templates" }, { id: "legal", label: "AI Legal Monitor" }] },
  { group: "QUICKBOOKS", items: [{ id: "qb-sync", label: "QB Sync" }, { id: "qb-1099", label: "1099 Tracking" }, { id: "qb-tax", label: "Tax Reports" }, { id: "qb-mileage", label: "Mileage" }] },
  { group: "REGISTRATION", items: [{ id: "registrations", label: "Registrations" }, { id: "positions", label: "Positions" }] },
  { group: "CLIENT PORTAL", items: [{ id: "portal", label: "Client Portal" }] },
  { group: "SALES", items: [{ id: "roofle", label: "Instant Estimates" }, { id: "storm-check", label: "Storm Risk Tool" }] },
  { group: "HIRING", items: [{ id: "hiring", label: "AI Hiring" }] },
  { group: "TRAINING", items: [{ id: "training", label: "Training Center" }, { id: "guide", label: "Platform Guide" }] },
  { group: "SUB PORTAL", items: [{ id: "subportal", label: "Sub Portal" }, { id: "compliance", label: "AI Compliance" }] },
  { group: "SAFETY", items: [{ id: "safety-checklist", label: "Safety Checklists" }, { id: "ratings", label: "Crew Ratings" }, { id: "incidents", label: "Incident Reports" }] },
  { group: "SETTINGS", items: [{ id: "integration", label: "Integrations" }, { id: "admin", label: "Admin" }, { id: "backup", label: "Backup & Data" }] },
];

const allSectionIds = platformSections.flatMap((g) => g.items.map((i) => i.id));

/* Default permissions by role */
function defaultPermissions(role: string): Record<string, boolean> {
  const all: Record<string, boolean> = {};
  allSectionIds.forEach((id) => {
    all[id] = false;
  });

  if (role === "Owner / Admin" || role === "Office Manager") {
    allSectionIds.forEach((id) => { all[id] = true; });
  } else if (role === "Project Manager") {
    ["projects", "leads", "inspections", "drone-flight", "ai-analysis", "storm", "storm-history", "estimates", "pricelist", "supplements", "calendar", "crews", "invoices", "reports", "expenses", "contracts", "templates", "portal", "training", "guide", "safety-checklist", "ratings", "incidents", "ai-tools"].forEach((id) => { all[id] = true; });
  } else if (role === "Estimator") {
    ["estimates", "pricelist", "supplements", "projects", "inspections", "ai-analysis", "storm", "calendar", "portal", "ai-tools", "training", "guide"].forEach((id) => { all[id] = true; });
  } else if (role === "Crew Lead") {
    ["projects", "calendar", "crews", "safety-checklist", "ratings", "incidents", "training", "guide", "inspections"].forEach((id) => { all[id] = true; });
  } else if (role === "Field Tech") {
    ["calendar", "crews", "safety-checklist", "training", "guide"].forEach((id) => { all[id] = true; });
  }
  // Dashboard always accessible
  return all;
}

const initialTeamMembers: TeamMember[] = [
  { name: "Alex Martinez", email: "alex@smartconstruction.com", role: "Owner / Admin", roleColor: "#ef4444", status: "active", permissions: defaultPermissions("Owner / Admin") },
  { name: "Mike Rodriguez", email: "mike@smartconstruction.com", role: "Project Manager", roleColor: "#3b82f6", status: "active", permissions: defaultPermissions("Project Manager") },
  { name: "Sarah Kim", email: "sarah@smartconstruction.com", role: "Estimator", roleColor: "#8b5cf6", status: "active", permissions: defaultPermissions("Estimator") },
  { name: "James Wilson", email: "james@smartconstruction.com", role: "Crew Lead", roleColor: "#f59e0b", status: "active", permissions: defaultPermissions("Crew Lead") },
  { name: "Lisa Chen", email: "lisa@smartconstruction.com", role: "Office Manager", roleColor: "#10b981", status: "inactive", permissions: defaultPermissions("Office Manager") },
];

interface Preference {
  label: string;
  description: string;
  enabled: boolean;
  icon: React.ElementType;
}

const initialPreferences: Preference[] = [
  { label: "Email Notifications", description: "Receive email alerts for new estimates, approvals, and payments", enabled: true, icon: Bell },
  { label: "Push Notifications", description: "Browser push notifications for real-time updates", enabled: true, icon: Bell },
  { label: "Auto-Sync Estimates", description: "Automatically sync AI estimates on import", enabled: true, icon: RefreshCw },
  { label: "Auto-Generate Invoices", description: "Create invoices automatically when estimates are approved", enabled: false, icon: Database },
  { label: "Two-Factor Authentication", description: "Require 2FA for all team member logins", enabled: true, icon: Shield },
];

const roleOptions = [
  { value: "Project Manager", color: "#3b82f6" },
  { value: "Estimator", color: "#8b5cf6" },
  { value: "Crew Lead", color: "#f59e0b" },
  { value: "Office Manager", color: "#10b981" },
  { value: "Field Tech", color: "#06b6d4" },
];

/* Can this role manage permissions? */
function canManagePermissions(role: string) {
  return role === "Owner / Admin" || role === "Office Manager";
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      className={`w-9 h-5 rounded-full flex items-center cursor-pointer transition-colors ${
        enabled ? "bg-blue-500 justify-end" : "bg-gray-300 justify-start"
      }`}
      style={{ padding: "2px" }}
    >
      <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
    </div>
  );
}

export default function AdminPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [prefs, setPrefs] = useState<Preference[]>(initialPreferences);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [clearCacheOpen, setClearCacheOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "Project Manager" });
  const [roleOptionsList, setRoleOptionsList] = useState<string[]>(roleOptions.map((r) => r.value));
  const [editOpen, setEditOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "Project Manager" });
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removeIndex, setRemoveIndex] = useState<number | null>(null);

  /* Permissions modal state */
  const [permOpen, setPermOpen] = useState(false);
  const [permIndex, setPermIndex] = useState<number | null>(null);
  const [permDraft, setPermDraft] = useState<Record<string, boolean>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const addToast = useAppStore((s) => s.addToast);

  /* Current logged-in user is always the first member (Owner) */
  const currentUser = teamMembers[0];
  const hasPermAccess = canManagePermissions(currentUser.role);

  const handleInvite = () => {
    if (!inviteForm.name || !inviteForm.email) {
      addToast("Please fill in all fields", "error");
      return;
    }
    const roleOpt = roleOptions.find((r) => r.value === inviteForm.role);
    const newMember: TeamMember = {
      name: inviteForm.name,
      email: inviteForm.email,
      role: inviteForm.role,
      roleColor: roleOpt?.color ?? "#3b82f6",
      status: "active",
      permissions: defaultPermissions(inviteForm.role),
    };
    setTeamMembers((prev) => [...prev, newMember]);
    setInviteForm({ name: "", email: "", role: "Project Manager" });
    setInviteOpen(false);
    addToast(`Invitation sent to ${newMember.email}`);
  };

  const handleEdit = () => {
    if (editIndex === null || !editForm.name || !editForm.email) {
      addToast("Please fill in all fields", "error");
      return;
    }
    const roleOpt = roleOptions.find((r) => r.value === editForm.role);
    setTeamMembers((prev) =>
      prev.map((m, i) =>
        i === editIndex
          ? { ...m, name: editForm.name, email: editForm.email, role: editForm.role, roleColor: roleOpt?.color ?? m.roleColor }
          : m
      )
    );
    setEditOpen(false);
    setEditIndex(null);
    addToast(`Updated ${editForm.name}`);
  };

  const handleRemove = () => {
    if (removeIndex === null) return;
    const name = teamMembers[removeIndex].name;
    setTeamMembers((prev) => prev.filter((_, i) => i !== removeIndex));
    setRemoveOpen(false);
    setRemoveIndex(null);
    addToast(`Removed ${name} from team`);
  };

  const togglePref = (index: number) => {
    setPrefs((prev) =>
      prev.map((p, i) => (i === index ? { ...p, enabled: !p.enabled } : p))
    );
  };

  /* ── Permission handlers ── */
  const openPermissions = (index: number) => {
    if (!hasPermAccess) {
      addToast("Only Owner and Office Manager can manage permissions", "error");
      return;
    }
    setPermIndex(index);
    setPermDraft({ ...teamMembers[index].permissions });
    // Expand all groups by default
    const eg: Record<string, boolean> = {};
    platformSections.forEach((g) => { eg[g.group] = true; });
    setExpandedGroups(eg);
    setPermOpen(true);
  };

  const togglePermission = (sectionId: string) => {
    setPermDraft((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const toggleGroupAll = (group: typeof platformSections[0]) => {
    const allEnabled = group.items.every((item) => permDraft[item.id]);
    const updated = { ...permDraft };
    group.items.forEach((item) => { updated[item.id] = !allEnabled; });
    setPermDraft(updated);
  };

  const savePermissions = () => {
    if (permIndex === null) return;
    setTeamMembers((prev) =>
      prev.map((m, i) => (i === permIndex ? { ...m, permissions: { ...permDraft } } : m))
    );
    setPermOpen(false);
    setPermIndex(null);
    addToast(`Permissions updated for ${teamMembers[permIndex!].name}`);
  };

  const countEnabled = (member: TeamMember) =>
    Object.values(member.permissions).filter(Boolean).length;

  const inputCls = "w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Company information, team, permissions, and system preferences</p>
      </div>

      {/* Company Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-gray-400" /> Company Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Company Name</label>
            <div className="text-sm font-medium text-gray-900 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              Smart Construction & Remodeling Inc.
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">License #</label>
            <div className="text-sm text-gray-900 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              CBC-058741
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3" /> Address
            </label>
            <div className="text-sm text-gray-900 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              1234 Construction Blvd, Suite 200, Orlando, FL 32801
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
                <Phone className="w-3 h-3" /> Phone
              </label>
              <div className="text-sm text-gray-900 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                (407) 555-0123
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
                <Mail className="w-3 h-3" /> Email
              </label>
              <div className="text-sm text-gray-900 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                info@smartconstruction.com
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" /> Team Members
          </h3>
          <Btn color="#3b82f6" size="sm" onClick={() => setInviteOpen(true)}>Invite Member</Btn>
        </div>
        <div className="divide-y divide-gray-100">
          {teamMembers.map((member, i) => (
            <div key={i} className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                  {member.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{member.name}</div>
                  <div className="text-xs text-gray-500">{member.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge color={member.roleColor}>{member.role}</Badge>
                <Badge color={member.status === "active" ? "#10b981" : "#94a3b8"} sm>
                  {member.status}
                </Badge>
                <span className="text-xs text-gray-400 hidden sm:inline" title="Sections with access">
                  {countEnabled(member)}/{allSectionIds.length}
                </span>
                {hasPermAccess && (
                  <button
                    onClick={() => openPermissions(i)}
                    className="p-1 text-gray-400 hover:text-indigo-500 transition"
                    title="Manage permissions"
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => { setEditForm({ name: member.name, email: member.email, role: member.role }); setEditIndex(i); setEditOpen(true); }}
                  className="p-1 text-gray-400 hover:text-blue-500 transition"
                  title="Edit member"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { setRemoveIndex(i); setRemoveOpen(true); }}
                  className="p-1 text-gray-400 hover:text-red-500 transition"
                  title="Remove member"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Access Control Info Banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
        <div>
          <div className="text-sm font-semibold text-indigo-900">Role-Based Access Control</div>
          <p className="text-xs text-indigo-700 mt-1">
            Only <strong>Owner</strong> and <strong>Office Manager</strong> can manage team member permissions. 
            Click the <Lock className="w-3 h-3 inline" /> icon next to any team member to configure which platform sections they can access.
          </p>
        </div>
      </div>

      {/* System Preferences */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">System Preferences</h3>
        <div className="space-y-4">
          {prefs.map((pref, i) => {
            const Icon = pref.icon;
            return (
              <div key={i} className="flex items-center justify-between py-1">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-gray-100 rounded-lg mt-0.5">
                    <Icon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{pref.label}</div>
                    <div className="text-xs text-gray-500">{pref.description}</div>
                  </div>
                </div>
                <Toggle enabled={pref.enabled} onToggle={() => togglePref(i)} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-gray-400" /> Data Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-900">Export Data</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">Download all project data, estimates, invoices, and reports as CSV or JSON.</p>
            <Btn color="#3b82f6" variant="outline" size="sm" onClick={() => {
              const data = {
                exportDate: new Date().toISOString(),
                company: "Smart Construction & Remodeling Inc.",
                team: teamMembers.map((m) => ({ name: m.name, email: m.email, role: m.role, permissions: m.permissions })),
                preferences: prefs.map((p) => ({ label: p.label, enabled: p.enabled })),
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = "smart-construction-export.json"; a.click();
              URL.revokeObjectURL(url);
              addToast("Data exported as JSON", "success");
            }}>
              <span className="flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Export All Data</span>
            </Btn>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-gray-900">Clear Cache</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">Clear local cache and temporary data. This does not delete any project data.</p>
            <Btn color="#ef4444" variant="outline" size="sm" onClick={() => setClearCacheOpen(true)}>
              <span className="flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5" /> Clear Cache</span>
            </Btn>
          </div>
        </div>
      </div>

      {/* ════════════ MODALS ════════════ */}

      {/* Invite Member Modal */}
      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Team Member">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Full Name</label>
            <input className={inputCls} placeholder="Enter full name" value={inviteForm.name} onChange={(e) => setInviteForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Email Address</label>
            <input className={inputCls} type="email" placeholder="Enter email address" value={inviteForm.email} onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <SmartSelect
              label="Role"
              value={inviteForm.role}
              onChange={(v) => setInviteForm((f) => ({ ...f, role: v }))}
              options={roleOptionsList}
              onAddNew={(v) => setRoleOptionsList((prev) => [...prev, v])}
              placeholder="Select role..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn color="#94a3b8" variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Btn>
            <Btn color="#3b82f6" onClick={handleInvite}>Send Invite</Btn>
          </div>
        </div>
      </Modal>

      {/* Clear Cache Confirmation Modal */}
      <Modal open={clearCacheOpen} onClose={() => setClearCacheOpen(false)} title="Clear Cache">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to clear the local cache? This will remove temporary data but will not delete any project data.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Btn color="#94a3b8" variant="outline" onClick={() => setClearCacheOpen(false)}>Cancel</Btn>
            <Btn color="#ef4444" onClick={() => { setClearCacheOpen(false); addToast("Cache cleared"); }}>Clear Cache</Btn>
          </div>
        </div>
      </Modal>

      {/* Edit Member Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Team Member">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Full Name</label>
            <input className={inputCls} placeholder="Enter full name" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Email Address</label>
            <input className={inputCls} type="email" placeholder="Enter email address" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <SmartSelect
              label="Role"
              value={editForm.role}
              onChange={(v) => setEditForm((f) => ({ ...f, role: v }))}
              options={roleOptionsList}
              onAddNew={(v) => setRoleOptionsList((prev) => [...prev, v])}
              placeholder="Select role..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn color="#94a3b8" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Btn>
            <Btn color="#3b82f6" onClick={handleEdit}>Save Changes</Btn>
          </div>
        </div>
      </Modal>

      {/* Remove Member Confirmation Modal */}
      <Modal open={removeOpen} onClose={() => setRemoveOpen(false)} title="Remove Team Member">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to remove <strong>{removeIndex !== null ? teamMembers[removeIndex]?.name : ""}</strong> from the team?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Btn color="#94a3b8" variant="outline" onClick={() => setRemoveOpen(false)}>Cancel</Btn>
            <Btn color="#ef4444" onClick={handleRemove}>Remove</Btn>
          </div>
        </div>
      </Modal>

      {/* ════════════ PERMISSIONS MODAL ════════════ */}
      <Modal open={permOpen} onClose={() => setPermOpen(false)} title={`Permissions — ${permIndex !== null ? teamMembers[permIndex]?.name : ""}`}>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {/* Info banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <Shield className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800">
              Toggle which platform sections this team member can access. Dashboard is always available.
              {permIndex !== null && canManagePermissions(teamMembers[permIndex].role) && (
                <span className="block mt-1 font-semibold">⚠ This user is an {teamMembers[permIndex].role} and has full admin rights by default.</span>
              )}
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                const all: Record<string, boolean> = {};
                allSectionIds.forEach((id) => { all[id] = true; });
                setPermDraft(all);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Eye className="w-3 h-3" /> Grant All
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => {
                const none: Record<string, boolean> = {};
                allSectionIds.forEach((id) => { none[id] = false; });
                setPermDraft(none);
              }}
              className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
            >
              <EyeOff className="w-3 h-3" /> Revoke All
            </button>
          </div>

          {/* Section groups */}
          {platformSections.map((group) => {
            const expanded = expandedGroups[group.group] ?? false;
            const enabledCount = group.items.filter((item) => permDraft[item.id]).length;
            const allEnabled = enabledCount === group.items.length;
            return (
              <div key={group.group} className="border border-gray-200 rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between px-3 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => setExpandedGroups((prev) => ({ ...prev, [group.group]: !expanded }))}
                >
                  <div className="flex items-center gap-2">
                    {expanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{group.group}</span>
                    <span className="text-xs text-gray-400">{enabledCount}/{group.items.length}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleGroupAll(group); }}
                    className={`text-xs px-2 py-0.5 rounded ${allEnabled ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"} hover:opacity-80 transition`}
                  >
                    {allEnabled ? "All On" : "Toggle All"}
                  </button>
                </div>
                {expanded && (
                  <div className="divide-y divide-gray-100">
                    {group.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between px-4 py-2">
                        <span className="text-sm text-gray-700">{item.label}</span>
                        <Toggle enabled={!!permDraft[item.id]} onToggle={() => togglePermission(item.id)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-3">
          <Btn color="#94a3b8" variant="outline" onClick={() => setPermOpen(false)}>Cancel</Btn>
          <Btn color="#3b82f6" onClick={savePermissions}>
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Save Permissions</span>
          </Btn>
        </div>
      </Modal>
    </div>
  );
}
