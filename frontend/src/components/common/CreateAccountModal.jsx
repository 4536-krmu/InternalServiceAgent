import React, { useState } from 'react';
import Modal from './Modal';
import { UserPlus, Sparkles, Shield, Laptop, CheckCircle2, Info } from 'lucide-react';
import { api } from '../../api';

export default function CreateAccountModal({ isOpen, onClose, onAccountCreated, addToast }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Cloud Infrastructure');
  const [role, setRole] = useState('Full-Time Employee');
  const [tenureYears, setTenureYears] = useState(2.0);
  const [workMode, setWorkMode] = useState('Hybrid');
  const [remoteDays, setRemoteDays] = useState(2);
  const [accountLocked, setAccountLocked] = useState(false);
  const [deviceModel, setDeviceModel] = useState('ThinkPad T14 Gen 4');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = [
    'Cloud Infrastructure',
    'Quality Engineering',
    'Brand Marketing',
    'Financial Planning & Analysis',
    'Information Security',
    'Product Engineering',
    'Human Resources',
    'Sales & Solutions'
  ];

  const handleModeChange = (mode) => {
    setWorkMode(mode);
    if (mode === 'Remote') setRemoteDays(4);
    else if (mode === 'Hybrid') setRemoteDays(2);
    else setRemoteDays(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast({ type: 'warning', title: 'Name Required', message: 'Please enter an employee or contractor name.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim() || undefined,
        department,
        role,
        tenure_years: parseFloat(tenureYears),
        work_mode: workMode,
        remote_days_per_week: parseInt(remoteDays, 10),
        account_locked: accountLocked,
        device_model: deviceModel
      };

      const newAccount = await api.createAccount(payload);
      addToast({
        type: 'success',
        title: 'Account Created',
        message: `Welcome ${newAccount.name} (${newAccount.id})! Switched to this persona.`
      });
      if (onAccountCreated) onAccountCreated(newAccount);
      onClose();
      // Reset form
      setName('');
      setEmail('');
      setTenureYears(2.0);
      setAccountLocked(false);
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to Create Account', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Employee / Contractor Persona"
      subtitle="Create a custom persona to test policy workflows, tenure rules, and access permissions"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jordan Lee"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Work Email (Optional, auto-generated if left blank)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jordan.lee@veridian-corp.example"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Role: FTE vs Contractor */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Employment Classification (Affects VPN Policy KB-02)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('Full-Time Employee')}
              className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                role === 'Full-Time Employee'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="block font-bold">Full-Time Employee</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Automatic VPN access approval</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('Contractor')}
              className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                role === 'Contractor'
                  ? 'border-amber-600 bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="block font-bold">Contractor / Vendor</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Requires manager sign-off</span>
            </button>
          </div>
        </div>

        {/* Tenure & Device Model */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Device Tenure in Years: {tenureYears} yrs
            </label>
            <input
              type="range"
              min="0.2"
              max="6.0"
              step="0.1"
              value={tenureYears}
              onChange={(e) => setTenureYears(e.target.value)}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>New (0.2y)</span>
              <span className="text-emerald-600 font-bold">&ge;3.0y (Refresh Eligible)</span>
              <span>6.0y</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assigned Laptop Model
            </label>
            <input
              type="text"
              value={deviceModel}
              onChange={(e) => setDeviceModel(e.target.value)}
              placeholder="e.g. ThinkPad X1 Carbon"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Work Mode & Remote Days */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Work Location Mode
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {['In-Office', 'Hybrid', 'Remote'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleModeChange(m)}
                  className={`py-1.5 rounded-lg border text-center font-medium transition-colors ${
                    workMode === m
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Remote Days/Week: {remoteDays}
            </label>
            <input
              type="range"
              min="0"
              max="5"
              value={remoteDays}
              onChange={(e) => setRemoteDays(e.target.value)}
              className="w-full accent-blue-600"
            />
            <p className="text-[10px] text-slate-500">
              {remoteDays > 3 ? '✓ Eligible for $750 WFH Allowance (KB-10)' : 'Standard in-office equipment only'}
            </p>
          </div>
        </div>

        {/* Lockout Checkbox */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg">
          <label className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={accountLocked}
              onChange={(e) => setAccountLocked(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
            />
            <span>
              <strong>Simulate Account Lockout:</strong> 5 failed password attempts (Tests KB-01 auto Active Directory unlock)
            </span>
          </label>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Creating...</span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create & Switch Persona</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
