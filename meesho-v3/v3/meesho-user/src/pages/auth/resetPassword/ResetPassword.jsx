import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { resetPassword, clearMessages } from "../../../redux/slices/authSlice";

export default function ResetPassword() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const resetToken = useAppSelector((s) => s.auth.resetToken);
  const { isLoading, error, successMessage } = useAppSelector((s) => s.auth);

  const [form, setForm] = useState({
    token: resetToken || "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const validateField = (name, value, currentForm = form) => {
    let error = "";
    if (name === "token" && !value.trim()) error = "Reset Token is required.";
    else if (name === "password") {
      if (!value) error = "New Password is required.";
      else if (value.length < 6) error = "Password must be at least 6 characters.";
    } else if (name === "confirmPassword") {
      if (!value) error = "Confirm Password is required.";
      else if (value !== currentForm.password) error = "Passwords do not match.";
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const newForm = { ...prev, [name]: value };
      const fieldError = validateField(name, value, newForm);
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        if (fieldError) newErrors[name] = fieldError;
        else delete newErrors[name];
        
        // Re-validate confirmPassword if password changes
        if (name === "password" && newForm.confirmPassword) {
            const confirmError = validateField("confirmPassword", newForm.confirmPassword, newForm);
            if (confirmError) newErrors.confirmPassword = confirmError;
            else delete newErrors.confirmPassword;
        }
        
        return newErrors;
      });
      return newForm;
    });
  };

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => navigate("/login"), 1500);
      return () => clearTimeout(t);
    }
  }, [successMessage, navigate]);

  useEffect(() => {
    return () => dispatch(clearMessages());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const error = validateField(key, form[key], form);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const result = await dispatch(
      resetPassword({
        token: form.token,
        password: form.password,
      }),
    );

    // Navigation handled by useEffect after successMessage shows
  };

  const inputStyle = {
    width: "100%",
    padding: "0.5rem 0.75rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
    boxSizing: "border-box",
  };
  const labelStyle = {
    display: "block",
    marginBottom: "4px",
    fontSize: "14px",
    fontWeight: 500,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Reset Password</h2>
        <p style={{ fontSize: "14px", color: "#666", marginBottom: "1.5rem" }}>
          Enter the OTP sent to your email and set a new password.
        </p>

        {error && (
          <div
            style={{
              background: "#fdecea",
              border: "1px solid #f5c6cb",
              color: "#721c24",
              padding: "0.75rem",
              borderRadius: "4px",
              marginBottom: "1rem",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}
        {successMessage && (
          <div
            style={{
              background: "#d4edda",
              border: "1px solid #c3e6cb",
              color: "#155724",
              padding: "0.75rem",
              borderRadius: "4px",
              marginBottom: "1rem",
              fontSize: "14px",
            }}
          >
            {successMessage} Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Reset Token</label>
            <input
              type="text"
              name="token"
              value={form.token}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="Enter reset token"
            />
            {errors.token && <p style={{ color: '#e3342f', fontSize: '12px', marginTop: '4px', fontWeight: 'bold' }}>{errors.token}</p>}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>New Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="••••••••"
            />
            {errors.password && <p style={{ color: '#e3342f', fontSize: '12px', marginTop: '4px', fontWeight: 'bold' }}>{errors.password}</p>}
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p style={{ color: '#e3342f', fontSize: '12px', marginTop: '4px', fontWeight: 'bold' }}>{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "0.6rem",
              background: "#1a1a1a",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "14px",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p style={{ marginTop: "1rem", fontSize: "14px", textAlign: "center" }}>
          <Link to="/login" style={{ color: "#1a1a1a", fontWeight: 500 }}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
