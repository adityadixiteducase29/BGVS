import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import './index.css';
import { Eye, EyeOff, Lock, Mail, Loader } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setCredentials, clearError } from '../../store/slices/authSlice';
import AuthStorage from '../../utils/storage';
import apiService from '../../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, error } = useAppSelector(state => state.auth);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectBasedOnRole(user.user_type);
    }
  }, [isAuthenticated, user]);

  // Clear error when component unmounts or user changes
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Redirect user based on their role
  const redirectBasedOnRole = (userType) => {
    switch (userType) {
      case 'admin':
        navigate('/dashboard');
        break;
      case 'verifier':
        navigate('/verifier-dashboard');
        break;
      case 'company':
        navigate('/company-dashboard'); // Future route
        break;
      default:
        navigate('/dashboard');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      dispatch(clearError()); // Clear any previous errors
      
      // Make API call directly in component
      const response = await apiService.login(formData.email, formData.password);
      
      if (response.success) {
        // Save to simple localStorage
        AuthStorage.saveAuth(response.data.token, response.data);
        
        // Update Redux state with credentials
        dispatch(setCredentials(response.data));
        
        // Login successful, redirect will happen in useEffect
        console.log('Login successful:', response.data);
        
        // Show storage info for debugging
        console.log('📊 Storage Info:', AuthStorage.getStorageInfo());
      } else {
        // Handle API error response
        console.error('Login failed:', response.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      // Error is already set in Redux state via API service
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Test credentials for development
  const fillTestCredentials = (type) => {
    if (type === 'admin') {
      setFormData({
        email: 'admin@test.com',
        password: 'Admin@123',
        rememberMe: false
      });
    } else if (type === 'verifier') {
      setFormData({
        email: 'verifier@test.com',
        password: 'Verifier@123',
        rememberMe: false
      });
    }
  };

  // Debug function to show current storage state
  const showStorageDebug = () => {
    console.log('🔍 Current Storage State:');
    console.log('AuthStorage.getAuth():', AuthStorage.getAuth());
    console.log('AuthStorage.isAuthenticated():', AuthStorage.isAuthenticated());
    console.log('AuthStorage.getStorageInfo():', AuthStorage.getStorageInfo());
  };

  return (
    <div className="login-page">
      <Container fluid className="h-100">
        <Row className="h-100">
          {/* Left side - Illustration */}
          <Col lg="7" className="illustration-section d-none d-lg-flex p-6">
            <img src={"./Login.png"} alt="Login Illustration" className="img-fluid" />
          </Col>

          {/* Right side - Login Form */}
          <Col lg="5" className="form-section">
            <div className="form-container">
              <div className="form-header">
                <h1 className="signin-title">Sign in</h1>
                <p className="text-muted">Welcome to Background Verification System</p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert color="danger" className="mb-3">
                  {error}
                </Alert>
              )}

              {/* Development Test Buttons */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-3">
                  <small className="text-muted">Test Credentials:</small>
                  <div className="mt-2">
                    <Button 
                      size="sm" 
                      color="outline-primary" 
                      className="me-2"
                      onClick={() => fillTestCredentials('admin')}
                    >
                      Admin Login
                    </Button>
                    <Button 
                      size="sm" 
                      color="outline-secondary"
                      onClick={() => fillTestCredentials('verifier')}
                    >
                      Verifier Login
                    </Button>
                    {/* <Button 
                      size="sm" 
                      color="outline-info"
                      onClick={showStorageDebug}
                    >
                      Debug Storage
                    </Button> */}
                  </div>
                </div>
              )}

              <Form onSubmit={handleSubmit} className="login-form">
                <FormGroup className="form-field">
                  <Label for="email" className="field-label">Email</Label>
                  <div className="input-container">
                    <Mail />
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                      disabled={isSubmitting}
                    />
                    <div className="input-underline"></div>
                  </div>
                </FormGroup>

                <FormGroup className="form-field">
                  <Label for="password" className="field-label">Password</Label>
                  <div className="input-container">
                    <Lock />
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder="Enter your Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                      disabled={isSubmitting}
                    />
                    <div className="input-underline"></div>
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={togglePasswordVisibility}
                      disabled={isSubmitting}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </FormGroup>

                <div className="form-options">
                  <div className="remember-me">
                    <Input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="form-check-input"
                      disabled={isSubmitting}
                    />
                    <Label for="rememberMe" className="check-label mb-0">Remember me</Label>
                  </div>
                  <a href="#" className="forgot-password">Forgot Password?</a>
                </div>

                <Button 
                  type="submit" 
                  className="login-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="me-2" size={16} />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>

                {/* Loading State */}
                {isSubmitting && (
                  <div className="text-center mt-3">
                    <small className="text-muted">Authenticating...</small>
                  </div>
                )}
              </Form>

              {/* Additional Info */}
              <div className="mt-4 text-center">
                <small className="text-muted">
                  Don't have an account? Contact your administrator
                </small>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
