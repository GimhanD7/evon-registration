import React, { useState, useMemo } from "react";
import { X, UserPlus, CheckCircle2, AlertCircle, Phone, Lock, School, User, GraduationCap } from "lucide-react";
import { LMSUser } from "@/data/lmsData";
import { useLmsBatches } from "@/lib/lmsStore";
import {
  validateFullName,
  validateWhatsAppPhone,
  validatePassword,
  validateSchool,
} from "@/lib/validation";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (userData: {
    fullName: string;
    phone: string;
    password?: string;
    role: "student";
    batch?: string;
    school?: string;
    indexNo?: string;
    parentPhone?: string;
    status: "active";
  }) => LMSUser;
  onSuccess: () => void;
}

export default function AddStudentModal({
  isOpen,
  onClose,
  onAddUser,
  onSuccess,
}: AddStudentModalProps) {
  const { batches: dbBatches } = useLmsBatches();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [school, setSchool] = useState("");
  const [indexNo, setIndexNo] = useState("");
  const [batch, setBatch] = useState(dbBatches[0] || "2026/2027 O/L Commerce");
  const [password, setPassword] = useState("pass123");
  const [errorMsg, setErrorMsg] = useState("");
  const [touched, setTouched] = useState<{
    name?: boolean;
    phone?: boolean;
    password?: boolean;
    school?: boolean;
  }>({});

  const nameValidation = useMemo(() => validateFullName(name), [name]);
  const phoneValidation = useMemo(() => validateWhatsAppPhone(phone), [phone]);
  const passwordValidation = useMemo(() => validatePassword(password), [password]);
  const schoolValidation = useMemo(() => validateSchool(school, false), [school]);

  if (!isOpen) return null;

  const handleBlur = (field: "name" | "phone" | "password" | "school") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setTouched({ name: true, phone: true, password: true, school: true });

    if (!nameValidation.valid) {
      setErrorMsg(nameValidation.error || "Please enter student's full name.");
      return;
    }
    if (!phoneValidation.valid) {
      setErrorMsg(phoneValidation.error || "Please enter a valid WhatsApp mobile number.");
      return;
    }
    if (!passwordValidation.valid) {
      setErrorMsg(passwordValidation.error || "Password must be at least 4 characters long.");
      return;
    }
    if (!schoolValidation.valid) {
      setErrorMsg(schoolValidation.error || "Please enter a valid school name.");
      return;
    }

    const cleanName = name.trim();
    const cleanPhone = phoneValidation.normalized || phone.trim();

    onAddUser({
      fullName: cleanName,
      phone: cleanPhone,
      school: school.trim() || undefined,
      indexNo: indexNo.trim() || undefined,
      batch: batch.trim(),
      password: password.trim() || "pass123",
      role: "student",
      status: "active",
    });

    setName("");
    setPhone("");
    setSchool("");
    setIndexNo("");
    setPassword("pass123");
    setErrorMsg("");
    setTouched({});
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="w-full max-w-md rounded-3xl border border-[#cddce5] bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#cddce5]/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#e0f7fa] text-[#008dc4]">
              <UserPlus size={16} />
            </span>
            <h3 className="text-base font-black text-[#102c45]">Add New Student Account</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1 text-[#94a3b8] hover:bg-[#edf2f3] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle size={15} className="text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Full Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-[#102c45] flex items-center gap-1">
                <User size={12} className="text-[#007fb8]" /> Student Full Name *
              </label>
              {touched.name && (
                nameValidation.valid ? (
                  <span className="text-[10.5px] font-bold text-[#159366] flex items-center gap-1">
                    <CheckCircle2 size={11} /> Valid
                  </span>
                ) : (
                  <span className="text-[10.5px] font-bold text-red-600 flex items-center gap-1">
                    <AlertCircle size={11} /> Required (min 3 chars)
                  </span>
                )
              )}
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!touched.name) setTouched((prev) => ({ ...prev, name: true }));
              }}
              onBlur={() => handleBlur("name")}
              placeholder="e.g. Nethmi Rajapaksha"
              className={`w-full rounded-2xl border py-2.5 px-3 font-bold text-[#102c45] outline-none transition-colors ${
                touched.name
                  ? nameValidation.valid
                    ? "border-[#38d995] bg-[#edf9f3]/40 focus:border-[#159366]"
                    : "border-red-400 bg-red-50/40 focus:border-red-500"
                  : "border-[#cddce5] bg-[#edf2f3]/50 focus:bg-white focus:border-[#007fb8]"
              }`}
            />
          </div>

          {/* WhatsApp Mobile Phone */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-[#102c45] flex items-center gap-1">
                <Phone size={12} className="text-[#007fb8]" /> WhatsApp Mobile Phone *
              </label>
              {touched.phone && (
                phoneValidation.valid ? (
                  <span className="text-[10.5px] font-bold text-[#159366] flex items-center gap-1">
                    <CheckCircle2 size={11} /> Valid WhatsApp
                  </span>
                ) : (
                  <span className="text-[10.5px] font-bold text-red-600 flex items-center gap-1">
                    <AlertCircle size={11} /> Invalid (07X XXX XXXX)
                  </span>
                )
              )}
            </div>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (!touched.phone) setTouched((prev) => ({ ...prev, phone: true }));
              }}
              onBlur={() => handleBlur("phone")}
              placeholder="e.g. 0771234567"
              className={`w-full rounded-2xl border py-2.5 px-3 font-bold text-[#102c45] outline-none transition-colors ${
                touched.phone
                  ? phoneValidation.valid
                    ? "border-[#38d995] bg-[#edf9f3]/40 focus:border-[#159366]"
                    : "border-red-400 bg-red-50/40 focus:border-red-500"
                  : "border-[#cddce5] bg-[#edf2f3]/50 focus:bg-white focus:border-[#007fb8]"
              }`}
            />
            {touched.phone && !phoneValidation.valid && (
              <p className="text-[10.5px] font-semibold text-red-600 mt-1">
                {phoneValidation.error}
              </p>
            )}
          </div>

          {/* School & Index */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#102c45] mb-1">School</label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="e.g. Anula Vidyalaya"
                className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3 font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-[#102c45] mb-1">
                Index Number <span className="text-[10px] text-[#007fb8] font-normal">(Auto if empty)</span>
              </label>
              <input
                type="text"
                value={indexNo}
                onChange={(e) => setIndexNo(e.target.value)}
                placeholder="Leave blank to auto-generate"
                className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3 font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none"
              />
            </div>
          </div>

          {/* Batch */}
          <div>
            <label className="block font-bold text-[#102c45] mb-1">Commerce Batch Enrolled</label>
            <select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3 font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none cursor-pointer"
            >
              {dbBatches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-[#102c45] flex items-center gap-1">
                <Lock size={12} className="text-[#007fb8]" /> Initial LMS Password *
              </label>
              {touched.password && (
                passwordValidation.valid ? (
                  <span className="text-[10.5px] font-bold text-[#159366] flex items-center gap-1">
                    <CheckCircle2 size={11} /> Valid
                  </span>
                ) : (
                  <span className="text-[10.5px] font-bold text-red-600 flex items-center gap-1">
                    <AlertCircle size={11} /> Min. 4 characters
                  </span>
                )
              )}
            </div>
            <input
              type="text"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (!touched.password) setTouched((prev) => ({ ...prev, password: true }));
              }}
              onBlur={() => handleBlur("password")}
              className={`w-full rounded-2xl border py-2.5 px-3 font-bold text-[#102c45] outline-none transition-colors ${
                touched.password
                  ? passwordValidation.valid
                    ? "border-[#38d995] bg-[#edf9f3]/40 focus:border-[#159366]"
                    : "border-red-400 bg-red-50/40 focus:border-red-500"
                  : "border-[#cddce5] bg-[#edf2f3]/50 focus:bg-white focus:border-[#007fb8]"
              }`}
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#cddce5] px-4 py-2 font-bold text-[#60768a] hover:bg-[#edf2f3] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-5 py-2 font-black text-white hover:opacity-90 active:scale-95 transition-transform cursor-pointer"
            >
              Create Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
