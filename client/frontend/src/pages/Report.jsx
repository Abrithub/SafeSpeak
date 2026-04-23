import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaRobot, FaLock, FaUser } from 'react-icons/fa';
import { FiMessageCircle } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { openChatBot } from '../components/ChatBot';
import { submitReport } from '../services/api';

const initialForm = {
  reportingFor: 'Myself', relationship: '', reporterName: '',
  phone: '', email: '', contactMethod: 'Do not contact me',
  ageRange: 'Prefer not to say', gender: 'Prefer not to say',
  locationTypeOfIncident: 'Prefer not to say',
  whenDidItHappen: 'Today', isVictimSafe: 'Yes',
  description: '', evidence: null,
  stayAnonymous: true, consentToShare: false,
};

export default function Report() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState('');

  // Check if user is logged in
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isLoggedIn = !!token && user.role === 'reporter';

  // Block admins from reporting
  if (token && user.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaShieldAlt className="text-red-500 text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Not Available for Admins</h2>
          <p className="text-gray-500 text-sm mb-6">
            Admin accounts cannot submit reports. Please use a reporter account to submit an incident report.
          </p>
          <Link to="/dashboard"
            className="inline-block bg-[#1a2340] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#243060] transition">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // If not logged in, show gate screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaLock className="text-teal-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Required</h2>
          <p className="text-gray-500 text-sm mb-6">
            To submit a report, you need an account. This ensures you can track your case,
            receive updates, and communicate with the support team.
          </p>

          <div className="space-y-3">
            <Link to="/signup"
              className="flex items-center justify-center gap-2 w-full bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700 transition">
              <FaUser className="text-sm" /> Create Free Account
            </Link>
            <Link to="/login"
              className="flex items-center justify-center gap-2 w-full border border-teal-600 text-teal-600 py-3 rounded-xl font-medium hover:bg-teal-50 transition">
              Already have an account? Sign In
            </Link>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl text-left">
            <p className="text-xs font-semibold text-gray-600 mb-2">Why do I need an account?</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>✓ Track your case status in real time</li>
              <li>✓ Receive messages from the support team</li>
              <li>✓ Get notified about appointments</li>
              <li>✓ Your identity remains protected</li>
            </ul>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Your account is private and secure. We never share your information.
          </p>
        </div>
      </div>
    );
  }

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) { setError('Please describe what happened so our AI can classify and prioritize your case.'); return; }
    if (!form.consentToShare) { setError('Please agree to share this report with authorized organizations.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "evidence") return;
        fd.append(k, v);
      });
      if (form.evidence) Array.from(form.evidence).forEach(f => fd.append("evidence", f));
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
          <p className="text-gray-500 mb-4">Your report has been received and our AI has analyzed it.</p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
            <p className="text-xs text-gray-500 mb-1">Your Case ID</p>
            <p className="text-2xl font-mono font-bold text-teal-600">{submitted.caseId}</p>
            <p className="text-xs text-gray-400 mt-2">Save this ID to track your case status anonymously.</p>
          </div>
          <button onClick={() => setSubmitted(null)} className="text-sm text-teal-600 hover:underline">
            Submit another report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-10">

        <div className="flex items-center gap-3 mb-8">
          <FaShieldAlt className="text-teal-600 text-3xl" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Report an Incident Safely</h1>
            <p className="text-sm text-gray-500">Confidential. You can stay anonymous. Our AI will automatically identify the type of abuse from your description.</p>
          </div>
        </div>

        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-8 flex items-start gap-3">
          <FaRobot className="text-teal-600 text-xl mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-teal-800">AI-Powered Classification</p>
            <p className="text-xs text-teal-600 mt-0.5">You don't need to select an abuse type. Just describe what happened in your own words — our AI will automatically identify the type of incident, assess urgency, and route your case to the right team.</p>
          </div>
        </div>

        {/* Mentor help banner */}
        <button
          type="button"
          onClick={openChatBot}
          className="w-full mb-8 flex items-center gap-3 bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 hover:bg-sky-100 transition text-left"
        >
          <FiMessageCircle className="text-sky-500 text-xl shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-sky-800">Not sure how to fill this out?</p>
            <p className="text-xs text-sky-600 mt-0.5">Chat with our AI Mentor — it will guide you step by step through the whole process.</p>
          </div>
          <span className="text-xs text-sky-500 font-medium shrink-0">Get help →</span>
        </button>

        <form onSubmit={handleSubmit} className="space-y-10">

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Your Information <span className="font-normal text-gray-400">(Optional)</span></h2>
            <p className="text-sm text-gray-500 mb-5">Leave this section empty to stay completely anonymous.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Are you reporting for:</label>
                <select value={form.reportingFor} onChange={e => set('reportingFor', e.target.value)} className={inputCls}>
                  {['Myself','Someone else','A child','An organization'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Relationship to victim (optional)</label>
                <select value={form.relationship} onChange={e => set('relationship', e.target.value)} className={inputCls}>
                  <option value="">-- Select --</option>
                  {['Parent','Sibling','Friend','Teacher','Neighbor','Other'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Your name (optional)</label>
                <input type="text" value={form.reporterName} onChange={e => set('reporterName', e.target.value)} className={inputCls} placeholder="Your name" />
              </div>
              <div>
                <label className={labelCls}>Email (optional — for case updates)</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputCls} placeholder="your@email.com" />
              </div>
              <div>
                <label className={labelCls}>Phone (optional)</label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className={inputCls} placeholder="+251 9xx xxx xxx" />
              </div>
              <div>
                <label className={labelCls}>Preferred contact method</label>
                <select value={form.contactMethod} onChange={e => set('contactMethod', e.target.value)} className={inputCls}>
                  {['Do not contact me','Phone call','SMS','WhatsApp','Email'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-1">About the Victim <span className="font-normal text-gray-400">(Optional)</span></h2>
            <p className="text-sm text-gray-500 mb-5">Helps responders prioritize support.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Age range</label>
                <select value={form.ageRange} onChange={e => set('ageRange', e.target.value)} className={inputCls}>
                  {['Prefer not to say','Under 5','5–12','13–17','18–24','25–34','35–44','45–54','55+'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Gender</label>
                <select value={form.gender} onChange={e => set('gender', e.target.value)} className={inputCls}>
                  {['Prefer not to say','Female','Male','Non-binary','Other'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>When did it happen?</label>
                <select value={form.whenDidItHappen} onChange={e => set('whenDidItHappen', e.target.value)} className={inputCls}>
                  {['Today','Yesterday','This week','This month','More than a month ago',"I don't know"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Is the victim currently safe?</label>
                <select value={form.isVictimSafe} onChange={e => set('isVictimSafe', e.target.value)} className={inputCls}>
                  {['Yes','No',"I don't know"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Location type of incident</label>
                <select value={form.locationTypeOfIncident} onChange={e => set('locationTypeOfIncident', e.target.value)} className={inputCls}>
                  {['Prefer not to say','Home','School','Workplace','Public place','Online','Other'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Describe What Happened <span className="text-red-500 text-sm font-normal">*</span></h2>
            <p className="text-sm text-gray-500 mb-5">Write what happened in your own words. Our AI will automatically identify the type of abuse, urgency level, and route your case to the right team.</p>
            <div className="space-y-4">
              <div>
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  rows={6} className={inputCls}
                  placeholder="Example: My neighbor has been hitting his child every night. The child is around 8 years old and I can hear crying through the wall. This has been happening for 3 months..." />
                <p className="text-xs text-gray-400 mt-1">The more detail you provide, the better our AI can assess and prioritize your case.</p>
              </div>
              <div>
                <label className={labelCls}>Upload evidence (optional)</label>
                <input type="file" multiple accept="image/*,video/*,.pdf" onChange={e => set('evidence', e.target.files)}
                  className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-4 file:rounded file:border file:border-gray-300 file:text-sm file:bg-white file:text-gray-700 hover:file:bg-gray-50" />
                <p className="text-xs text-gray-400 mt-1">Visible only to authorized support organizations.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Privacy</h2>
            <p className="text-sm text-gray-500 mb-5">Choose whether you want to remain anonymous.</p>
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
                <input type="checkbox" checked={form.consentToShare} onChange={e => set('consentToShare', e.target.checked)} className="mt-0.5 accent-teal-500 w-4 h-4" />
                <span className="text-sm text-gray-700">
                  <span className="font-semibold">I agree to share this report securely with authorized support organizations.</span>
                  <br />
                  <span className="text-xs text-gray-500">Your identity will remain protected.</span>
                </span>
              </label>
            </div>
          </section>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400">In immediate danger? Call <strong>+251965485715</strong></p>
            <button type="submit" disabled={submitting}
              className="px-6 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition disabled:opacity-60">
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
   