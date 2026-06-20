import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { verifyEmail, clearMessages } from '../../../redux/slices/authSlice';

export default function VerifyEmail() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, successMessage, pendingEmail } = useAppSelector((s) => s.auth);

  const [form, setForm] = useState({ email: pendingEmail || '', verificationCode: '' });
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let error = "";
    if (name === "email") {
      if (!value.trim()) error = "Email Address is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) error = "Enter a valid email address.";
    } else if (name === "verificationCode") {
      if (!value.trim()) error = "Verification Code is required.";
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const newForm = { ...prev, [name]: value };
      const fieldError = validateField(name, value);
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        if (fieldError) newErrors[name] = fieldError;
        else delete newErrors[name];
        return newErrors;
      });
      return newForm;
    });
  };

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => navigate('/login'), 1500);
    }
  }, [successMessage, navigate]);

  useEffect(() => { return () => dispatch(clearMessages()); }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    dispatch(verifyEmail({ email: form.email, verificationCode: form.verificationCode }));
  };

  const inputStyle = { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', border: '1px solid #e0e0e0', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Verify Email</h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '1.5rem' }}>
          Enter the verification code sent to your email
        </p>

        {error && (
          <div style={{ background: '#fdecea', border: '1px solid #f5c6cb', color: '#721c24', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '14px' }}>
            {error}
          </div>
        )}
        {successMessage && (
          <div style={{ background: '#d4edda', border: '1px solid #c3e6cb', color: '#155724', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '14px' }}>
            {successMessage} Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required style={inputStyle} placeholder="you@example.com" />
            {errors.email && <p style={{ color: '#e3342f', fontSize: '12px', marginTop: '4px', fontWeight: 'bold' }}>{errors.email}</p>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Verification Code</label>
            <input
              type="text"
              name="verificationCode"
              value={form.verificationCode}
              onChange={handleChange}
              required
              style={{ ...inputStyle, letterSpacing: '0.2em', fontSize: '16px', textAlign: 'center' }}
              placeholder="Enter code"
            />
            {errors.verificationCode && <p style={{ color: '#e3342f', fontSize: '12px', marginTop: '4px', fontWeight: 'bold' }}>{errors.verificationCode}</p>}
          </div>

          <button type="submit" disabled={isLoading}
            style={{ width: '100%', padding: '0.6rem', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '14px', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
      </div>
    </div>
  );
}