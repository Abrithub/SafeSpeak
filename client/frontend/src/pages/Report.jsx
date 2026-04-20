import React, { useState } from 'react';
import { FaShieldAlt } from 'react-icons/fa';
import { submitReport } from '../services/api';

const ABUSE_TYPES = [
  "Physical", "Sexual", "Emotional / Psychological",
  "Harassment / Threats", "Child labor", "Neglect",
  "Human trafficking concerns", "Other", "Online / Digital abuse",
];

const initialForm = {
  // Your Information
  reportingFor: 'Myself',
  relationship: '',
  reporterName: '',
  phone: '',
  email: '',
  contactMethod: 'Do not contact me',

  // About the Victim
  ageRange: 'Prefer not to say',
  gender: 'Prefer not to say',
  locationTypeOfIncident: 'Prefer not to say',

  // Incident Details
  abuseTypes: [],
  whenDidItHappen: 'Today',
  isVictimSafe: 'Yes',

  // Tell Us More
  description: '',
  evidence: null,

  // Privacy
  stayAnonymous: true,
  consentToShare: false,
};

export default function Report() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState('');

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const toggleAbuse = (type) => {
    setForm((f) => ({
      ...f,
      abuseTypes: f.abuseTypes.includes(type)
        ? f.abuseTypes.filter((t) => t !== type)
        : [...f.abuseTypes, type],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.abuseTypes.length === 0) { setError('Please select at least one type of abuse.'); return; }
    if (!form.consentToShare) { setError('Please agree to share this report with authorized organizations.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const fd = new FormData();
      // Append all scalar fields
      Object.entries(form).forEach(([k, v]) => {
        if (k === "evidence" || k === "abuseTypes") return;
        fd.append(k, v);
      });
      // Append abuse types as repeated field
      (form.abuseTypes || []).forEach((t) => fd.append("abuseTypes", t));
      // Append files
      if (form.evidence) {
        Array.from(form.evidence).forEach((f) => fd.append("evidence", f));
      }
      fd.append("classification", form.abuseTypes[0] || "Unclassified");
      fd.append("location", form.locationTypeOfIncident);
      if (form.email) fd.append("reporterEmail", form.email);

      const res = await submitReport(fd);
      if (res.caseId) setSubmitted(res);
      else setError(res.message || 'Submission failed. Please try again.');
    } catch { setError('Server unreachable. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const inputCls = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white";
  const labelCls = "block text-xs text-gray-500 mb-1";

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaShieldAlt className="text-teal-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Submitted</h2>
          <p className="text-gray-500 mb-4">Your report has been received securely.</p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
            <p className="text-xs text-gray-500 mb-1">Your Case ID</p>
            <p className="text-2xl font-mono font-bold text-teal-600">{submitted.caseId}</p>
            <p className="text-xs text-gray-400 mt-2">Save this ID to track your case status anonymously.</p>
          </div>
          <button onClick={() => setSubmitted(null)}
            className="text-sm text-teal-600 hover:underline">Submit another report</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="text-teal-600">
            <FaShieldAlt className="text-3xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Report an Incident Safely</h1>
            <p className="text-sm text-gray-500">This form is confidential. You can stay anonymous. Provide only what you are comfortable sharing.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* ── YOUR INFORMATION ── */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              Your Information <span className="font-normal text-gray-400">(Optional)</span>
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              You can leave this section empty to stay anonymous. Providing a phone number allows support organizations to follow up.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Are you reporting for:</label>
                <select value={form.reportingFor} onChange={(e) => set('reportingFor', e.target.value)} className={inputCls}>
                  {['Myself', 'Someone else', 'A child', 'An organization'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Relationship to the victim (optional)</label>
                <select value={form.relationship} onChange={(e) => set('relationship', e.target.value)} className={inputCls}>
                  <option value="">-- Select --</option>
                  {['Parent', 'Sibling', 'Friend', 'Teacher', 'Neighbor', 'Other'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Your name (optional)</label>
                <input type="text" value={form.reporterName} onChange={(e) => set('reporterName', e.target.value)}
                  className={inputCls} placeholder="Your name (optional)" />
              </div>
              <div>
                <label className={labelCls}>Email address (optional — for case updates)</label>
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                  className={inputCls} placeholder="your@email.com (optional)" />
              </div>
              <div>
                <label className={labelCls}>Phone number (optional)</label>
                <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)}
                  className={inputCls} placeholder="+251 9xx xxx xxx" />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Preferred contact method (optional)</label>
                <select value={form.contactMethod} onChange={(e) => set('contactMethod', e.target.value)} className={inputCls}>
                  {['Do not contact me', 'Phone call', 'SMS', 'WhatsApp', 'Email'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* ── ABOUT THE VICTIM ── */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              About the Victim <span className="font-normal text-gray-400">(Optional)</span>
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              These details help responders prioritize support. Do not provide exact addresses or IDs.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Age range</label>
                <select value={form.ageRange} onChange={(e) => set('ageRange', e.target.value)} className={inputCls}>
                  {['Prefer not to say', 'Under 5', '5–12', '13–17', '18–24', '25–34', '35–44', '45–54', '55+'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Gender</label>
                <select value={form.gender} onChange={(e) => set('gender', e.target.value)} className={inputCls}>
                  {['Prefer not to say', 'Female', 'Male', 'Non-binary', 'Other'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Location type of incident</label>
                <select value={form.locationTypeOfIncident} onChange={(e) => set('locationTypeOfIncident', e.target.value)} className={inputCls}>
                  {['Prefer not to say', 'Home', 'School', 'Workplace', 'Public place', 'Online', 'Other'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* ── INCIDENT DETAILS ── */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              Incident details <span className="font-normal text-gray-400">(Required)</span>
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Select the options that best describe the incident. If possible, add a short description below.
            </p>

            {/* Abuse type checkboxes */}
            <div className="mb-4">
              <label className="text-xs text-gray-600 mb-2 block">
                Type of abuse (select one or more) <span className="text-red-500">Required</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ABUSE_TYPES.map((type) => (
                  <label key={type}
                    className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer text-sm transition ${
                      form.abuseTypes.includes(type)
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}>
                    <input type="checkbox" checked={form.abuseTypes.includes(type)}
                      onChange={() => toggleAbuse(type)} className="accent-teal-500" />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>When did it happen?</label>
                <select value={form.whenDidItHappen} onChange={(e) => set('whenDidItHappen', e.target.value)} className={inputCls}>
                  {['Today', 'Yesterday', 'This week', 'This month', 'More than a month ago', "I don't know"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            <div className="col-span-2">
                <label className={labelCls}>Is the victim currently safe?</label>
                <select value={form.isVictimSafe} onChange={(e) => set('isVictimSafe', e.target.value)} className={inputCls}>
                  {['Yes', 'No', "I don't know"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* ── TELL US MORE ── */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              Tell Us More <span className="font-normal text-gray-400">(Optional)</span>
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Share any extra details you think are important. This is optional — Write only what you are comfortable with.
            </p>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Short description</label>
                <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
                  rows={4} className={inputCls}
                  placeholder="Describe what happened (optional)" />
              </div>
              <div>
                <label className={labelCls}>Upload evidence (optional)</label>
                <input type="file" multiple accept="image/*,video/*,.pdf"
                  onChange={(e) => set('evidence', e.target.files)}
                  className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-4 file:rounded file:border file:border-gray-300 file:text-sm file:bg-white file:text-gray-700 hover:file:bg-gray-50" />
                <p className="text-xs text-gray-400 mt-1">
                  Files are visible only to authorized support organizations. Do not upload images that could put someone at risk.
                </p>
              </div>
            </div>
          </section>

          {/* ── PRIVACY ── */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Privacy and Follow</h2>
            <p className="text-sm text-gray-500 mb-5">
              Choose whether you want to remain anonymous and how you prefer to be contacted.
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-2">Do you want to stay anonymous?</p>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                  <input type="radio" checked={form.stayAnonymous} onChange={() => set('stayAnonymous', true)} className="accent-teal-500" />
                  Yes - stay anonymous
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer mt-1">
                  <input type="radio" checked={!form.stayAnonymous} onChange={() => set('stayAnonymous', false)} className="accent-teal-500" />
                  No - I'm okay being contacted
                </label>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.consentToShare}
                  onChange={(e) => set('consentToShare', e.target.checked)}
                  className="mt-0.5 accent-teal-500 w-4 h-4" />
                <span className="text-sm text-gray-700">
                  <span className="font-semibold">I agree to share this report securely with authorized support organizations.</span>
                  <br />
                  <span className="text-xs text-gray-500">
                    Your identity will remain protected. Personal contact info is optional and will only be used for follow-up if you consent.
                  </span>
                </span>
              </label>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              If you are in immediate danger, call local emergency services or the listed hotlines.
            </p>
            <div className="flex items-center gap-3">
              <button type="button"
                onClick={() => setForm(initialForm)}
                className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 border border-gray-300 rounded-lg">
                Save Draft
              </button>
              <button type="submit" disabled={submitting}
                className="px-6 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition disabled:opacity-60">
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
