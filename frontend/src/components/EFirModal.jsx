import React, { useState } from 'react';
import { FiFileText, FiSend, FiLock, FiUpload, FiCamera, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-toastify';

const EFirModal = ({ isOpen, onClose, userLocation }) => {
  const [eFirData, setEFirData] = useState({
    incidentType: '',
    description: '',
    location: '',
    dateTime: '',
    witnesses: '',
    contactInfo: '',
    priority: 'medium',
    attachments: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setEFirData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!eFirData.incidentType || !eFirData.description || !eFirData.contactInfo) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const submissionData = {
        ...eFirData,
        location: eFirData.location || (userLocation ? 
          `${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}` : 
          'Location not available'),
        dateTime: eFirData.dateTime || new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        submitterId: 'tourist_' + Date.now(),
        status: 'submitted'
      };

      console.log('Submitting e-FIR:', submissionData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('e-FIR submitted successfully! Reference ID: eFIR' + Date.now().toString().slice(-6));
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error submitting e-FIR:', error);
      toast.error('Failed to submit e-FIR. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEFirData({
      incidentType: '',
      description: '',
      location: '',
      dateTime: '',
      witnesses: '',
      contactInfo: '',
      priority: 'medium',
      attachments: []
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="premium-glass-enhanced backdrop-blur-xl border border-white/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 premium-glass-enhanced rounded-2xl flex items-center justify-center">
                <FiFileText className="text-blue-400 text-xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold premium-text-bold">e-FIR Filing</h3>
                <p className="text-sm premium-text-secondary">Secure Electronic First Information Report</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 premium-glass-enhanced rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all"
            >
              ✕
            </button>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-500/10 border border-blue-400/30 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <FiLock className="text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-300 mb-1">Secure & Confidential</h4>
                <p className="text-xs text-white/70">Your report is encrypted and directly transmitted to Karnataka Police. All information is protected under cybersecurity protocols.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Incident Type */}
            <div>
              <label className="block text-sm font-medium premium-text mb-2">
                Incident Type *
              </label>
              <select
                value={eFirData.incidentType}
                onChange={(e) => handleInputChange('incidentType', e.target.value)}
                className="w-full p-3 rounded-2xl bg-white/10 border border-white/20 text-white focus:border-blue-400/50 focus:bg-white/20 transition-all"
              >
                <option value="" className="bg-slate-800">Select incident type</option>
                <option value="theft" className="bg-slate-800">Theft/Robbery</option>
                <option value="harassment" className="bg-slate-800">Harassment</option>
                <option value="fraud" className="bg-slate-800">Fraud/Cheating</option>
                <option value="assault" className="bg-slate-800">Physical Assault</option>
                <option value="cybercrime" className="bg-slate-800">Cyber Crime</option>
                <option value="missing" className="bg-slate-800">Missing Person/Item</option>
                <option value="accident" className="bg-slate-800">Accident</option>
                <option value="other" className="bg-slate-800">Other</option>
              </select>
            </div>

            {/* Location & DateTime */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium premium-text mb-2">
                  Incident Location
                </label>
                <input
                  type="text"
                  value={eFirData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder={userLocation ? "Auto-detected from GPS" : "Enter location"}
                  className="w-full p-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-400/50 focus:bg-white/20 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium premium-text mb-2">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={eFirData.dateTime}
                  onChange={(e) => handleInputChange('dateTime', e.target.value)}
                  className="w-full p-3 rounded-2xl bg-white/10 border border-white/20 text-white focus:border-blue-400/50 focus:bg-white/20 transition-all"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium premium-text mb-2">
                Detailed Description *
              </label>
              <textarea
                value={eFirData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                placeholder="Provide detailed description of the incident..."
                className="w-full p-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-400/50 focus:bg-white/20 transition-all resize-none"
              />
            </div>

            {/* Contact Info & Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium premium-text mb-2">
                  Your Contact Info *
                </label>
                <input
                  type="text"
                  value={eFirData.contactInfo}
                  onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                  placeholder="Phone number or email"
                  className="w-full p-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-400/50 focus:bg-white/20 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium premium-text mb-2">
                  Priority Level
                </label>
                <select
                  value={eFirData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full p-3 rounded-2xl bg-white/10 border border-white/20 text-white focus:border-blue-400/50 focus:bg-white/20 transition-all"
                >
                  <option value="low" className="bg-slate-800">Low Priority</option>
                  <option value="medium" className="bg-slate-800">Medium Priority</option>
                  <option value="high" className="bg-slate-800">High Priority</option>
                  <option value="critical" className="bg-slate-800">Critical/Emergency</option>
                </select>
              </div>
            </div>

            {/* Witnesses */}
            <div>
              <label className="block text-sm font-medium premium-text mb-2">
                Witness Information (Optional)
              </label>
              <textarea
                value={eFirData.witnesses}
                onChange={(e) => handleInputChange('witnesses', e.target.value)}
                rows={2}
                placeholder="Names and contact details of witnesses, if any..."
                className="w-full p-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-400/50 focus:bg-white/20 transition-all resize-none"
              />
            </div>

            {/* Attachments */}
            <div className="bg-white/5 border border-white/20 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <FiUpload className="text-white/70" />
                <span className="text-sm font-medium premium-text">Evidence Attachments (Optional)</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-center">
                  <FiCamera className="mx-auto mb-1 text-white/70" />
                  <span className="text-xs text-white/70">Photos</span>
                </button>
                <button className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-center">
                  <FiUpload className="mx-auto mb-1 text-white/70" />
                  <span className="text-xs text-white/70">Documents</span>
                </button>
                <button className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-center">
                  <FiFileText className="mx-auto mb-1 text-white/70" />
                  <span className="text-xs text-white/70">Audio</span>
                </button>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting || !eFirData.incidentType || !eFirData.description || !eFirData.contactInfo}
                className="btn-premium bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <FiSend className="text-lg" />
                    <span>Submit e-FIR Securely</span>
                  </>
                )}
              </button>
              <button 
                onClick={onClose}
                className="btn-glass px-8"
              >
                Cancel
              </button>
            </div>

            {/* Legal Notice */}
            <div className="text-xs text-white/50 text-center">
              By submitting this e-FIR, you confirm that all information provided is true and accurate. 
              False reporting is a punishable offense under Indian law.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EFirModal;