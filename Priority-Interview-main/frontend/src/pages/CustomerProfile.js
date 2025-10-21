import React, { useState, useEffect } from 'react';

function CustomerProfile() {
  const [customers, setCustomers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCustomerDetailModal, setShowCustomerDetailModal] = useState(false);
  const [showVisitationModal, setShowVisitationModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [visitationData, setVisitationData] = useState({
    hotelId: '',
    visitDate: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
  });
  const [formErrors, setFormErrors] = useState({});
  const [visitationErrors, setVisitationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch customers and hotels from API
  useEffect(() => {
    fetchCustomers();
    fetchHotels();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/customer');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      setCustomers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHotels = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/hotel');
      if (!response.ok) {
        throw new Error('Failed to fetch hotels');
      }
      const data = await response.json();
      setHotels(data);
    } catch (err) {
      console.error('Error fetching hotels:', err);
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create customer');
      }

      // Success - refresh customers list and close modal
      await fetchCustomers();
      setShowModal(false);
      setFormData({ name: '', email: '' });
      setFormErrors({});
    } catch (err) {
      setFormErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ name: '', email: '' });
    setFormErrors({});
  };

  // Handle customer name click
  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetailModal(true);
  };

  // Handle register visit button
  const handleRegisterVisit = () => {
    setShowCustomerDetailModal(false);
    setShowVisitationModal(true);
    setVisitationData({
      hotelId: '',
      visitDate: new Date().toISOString().split('T')[0]
    });
    setVisitationErrors({});
  };

  // Handle visitation form changes
  const handleVisitationChange = (e) => {
    const { name, value } = e.target;
    setVisitationData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (visitationErrors[name]) {
      setVisitationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate visitation form
  const validateVisitationForm = () => {
    const errors = {};
    
    if (!visitationData.hotelId) {
      errors.hotelId = 'Please select a hotel';
    }
    
    if (!visitationData.visitDate) {
      errors.visitDate = 'Please select a visit date';
    }

    setVisitationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle visitation submission
  const handleVisitationSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateVisitationForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const visitationPayload = {
        customerId: selectedCustomer.id,
        hotelId: parseInt(visitationData.hotelId),
        visitDate: new Date(visitationData.visitDate).toISOString()
      };

      const response = await fetch('http://localhost:5000/api/visitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitationPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to register visitation');
      }

      // Success - close modal and reset form
      setShowVisitationModal(false);
      setSelectedCustomer(null);
      setVisitationData({
        hotelId: '',
        visitDate: new Date().toISOString().split('T')[0]
      });
      setVisitationErrors({});
      
      // Show success message (you could add a toast or alert here)
      alert('Visitation registered successfully!');
    } catch (err) {
      setVisitationErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close customer detail modal
  const handleCloseCustomerDetailModal = () => {
    setShowCustomerDetailModal(false);
    setSelectedCustomer(null);
  };

  // Handle close visitation modal
  const handleCloseVisitationModal = () => {
    setShowVisitationModal(false);
    setSelectedCustomer(null);
    setVisitationData({
      hotelId: '',
      visitDate: new Date().toISOString().split('T')[0]
    });
    setVisitationErrors({});
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <p className="mb-0">Make sure the backend server is running on http://localhost:5000</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Customer Profiles</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Add Customer
            </button>
          </div>

          {customers.length === 0 ? (
            <div className="alert alert-info">
              <h5>No customers found</h5>
              <p>Click "Add Customer" to create your first customer profile.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Registration Date</th>
                    <th scope="col">Total Purchases</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, index) => (
                    <tr key={customer.id}>
                      <th scope="row">{index + 1}</th>
                      <td>
                        <button 
                          className="btn btn-link p-0 text-primary text-decoration-none"
                          onClick={() => handleCustomerClick(customer)}
                          style={{ fontSize: 'inherit', textAlign: 'left' }}
                        >
                          {customer.name}
                        </button>
                      </td>
                      <td>{customer.email}</td>
                      <td>{new Date(customer.registrationDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${customer.totalPurchases > 10 ? 'bg-success' : 'bg-secondary'}`}>
                          {customer.totalPurchases}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Customer</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseModal}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {formErrors.submit && (
                    <div className="alert alert-danger">
                      {formErrors.submit}
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <label htmlFor="customerName" className="form-label">
                      Customer Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                      id="customerName"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter customer name"
                    />
                    {formErrors.name && (
                      <div className="invalid-feedback">
                        {formErrors.name}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="customerEmail" className="form-label">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                      id="customerEmail"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                    />
                    {formErrors.email && (
                      <div className="invalid-feedback">
                        {formErrors.email}
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Creating...
                      </>
                    ) : (
                      'Create Customer'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal backdrop */}
      {showModal && <div className="modal-backdrop fade show"></div>}

      {/* Customer Detail Modal (Read-only) */}
      {showCustomerDetailModal && selectedCustomer && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Customer Details</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseCustomerDetailModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Customer Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedCustomer.name}
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={selectedCustomer.email}
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Registration Date</label>
                  <input
                    type="text"
                    className="form-control"
                    value={new Date(selectedCustomer.registrationDate).toLocaleDateString()}
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Total Purchases</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedCustomer.totalPurchases}
                    readOnly
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseCustomerDetailModal}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={handleRegisterVisit}
                >
                  <i className="bi bi-calendar-plus me-2"></i>
                  Register Visit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Customer Detail Modal backdrop */}
      {showCustomerDetailModal && <div className="modal-backdrop fade show"></div>}

      {/* Visitation Registration Modal */}
      {showVisitationModal && selectedCustomer && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Register Hotel Visit</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseVisitationModal}
                ></button>
              </div>
              <form onSubmit={handleVisitationSubmit}>
                <div className="modal-body">
                  {visitationErrors.submit && (
                    <div className="alert alert-danger">
                      {visitationErrors.submit}
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <label className="form-label">Customer</label>
                    <select className="form-select" disabled>
                      <option>{selectedCustomer.name}</option>
                    </select>
                    <small className="form-text text-muted">Selected customer (read-only)</small>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="hotelSelect" className="form-label">
                      Hotel <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${visitationErrors.hotelId ? 'is-invalid' : ''}`}
                      id="hotelSelect"
                      name="hotelId"
                      value={visitationData.hotelId}
                      onChange={handleVisitationChange}
                    >
                      <option value="">Select a hotel...</option>
                      {hotels.map(hotel => (
                        <option key={hotel.id} value={hotel.id}>
                          {hotel.name} - {hotel.location}
                        </option>
                      ))}
                    </select>
                    {visitationErrors.hotelId && (
                      <div className="invalid-feedback">
                        {visitationErrors.hotelId}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="visitDate" className="form-label">
                      Visit Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className={`form-control ${visitationErrors.visitDate ? 'is-invalid' : ''}`}
                      id="visitDate"
                      name="visitDate"
                      value={visitationData.visitDate}
                      onChange={handleVisitationChange}
                    />
                    {visitationErrors.visitDate && (
                      <div className="invalid-feedback">
                        {visitationErrors.visitDate}
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleCloseVisitationModal}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Registering...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Register Visit
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Visitation Modal backdrop */}
      {showVisitationModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
}

export default CustomerProfile;