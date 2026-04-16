import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const VerifyEmailPage: React.FC = () => {
  const hasRequested = React.useRef(false);
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (hasRequested.current) return;
      hasRequested.current = true;

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
        toast.success('Email verified! You can now log in.');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
        toast.error('Verification failed.');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2rem] shadow-xl p-10 text-center"
      >
        <div className="mb-8 flex justify-center">
          {status === 'loading' && (
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600">
              <Loader2 size={40} className="animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={40} />
            </div>
          )}
          {status === 'error' && (
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-600">
              <XCircle size={40} />
            </div>
          )}
        </div>

        <h1 className="text-3xl font-black text-[#0F172A] mb-4">
          {status === 'loading' && 'Verifying Email...'}
          {status === 'success' && 'Account Verified'}
          {status === 'error' && 'Verification Failed'}
        </h1>

        <p className="text-[#64748B] text-lg font-medium mb-10 leading-relaxed">
          {status === 'loading' && 'Please wait while we validate your institutional credentials.'}
          {status === 'success' && 'Your identity has been established. You can now access the full SLIIT Nexar ecosystem.'}
          {status === 'error' && message}
        </p>

        {status !== 'loading' && (
          <Link 
            to="/login"
            className="w-full h-[56px] bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]"
          >
            {status === 'success' ? 'Proceed to Login' : 'Back to Login'}
            <ArrowRight size={20} />
          </Link>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
