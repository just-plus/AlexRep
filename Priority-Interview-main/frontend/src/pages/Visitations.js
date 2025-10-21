import React, { useState, useEffect } from 'react';

function Visitations() {
  const [visitations, setVisitations] = useState([]);
  const [filteredVisitations, setFilteredVisitations] = useState([]);
  const [loyalCustomers, setLoyalCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCustomerDetailModal, setShowCustomerDetailModal] = useState(false);
  const [showVisitationModal, setShowVisitationModal] = useState(false);
  const [showNewVisitModal, setShowNewVisitModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [visitationData, setVisitationData] = useState({
    hotelId: '',
    visitDate: new Date().toISOString().split('T')[0]
  });
  const [visitationErrors, setVisitationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    selectedHotels: [],
    monthYear: new Date().toISOString().slice(0, 7), // YYYY-MM format
    onlyLoyalCustomers: false
  });
  const [isFiltering, setIsFiltering] = useState(false);

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [visitationsResponse, customersResponse, hotelsResponse] = await Promise.all([
        fetch('http://localhost:5000/api/visitation'),
        fetch('http://localhost:5000/api/customer'),
        fetch('http://localhost:5000/api/hotel')
      ]);

      // Check if all requests were successful
      if (!visitationsResponse.ok || !customersResponse.ok || !hotelsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      // Parse all responses
      const [visitationsData, customersData, hotelsData] = await Promise.all([
        visitationsResponse.json(),
        customersResponse.json(),
        hotelsResponse.json()
      ]);

      setVisitations(visitationsData);
      setFilteredVisitations(visitationsData);
      setCustomers(customersData);
      setHotels(hotelsData);
      setError(null);
      
      // Fetch loyalty data for current month
      await fetchLoyaltyData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoyaltyData = async () => {
    try {
      const currentDate = new Date();
      const response = await fetch(
        `http://localhost:5000/api/loyalty/monthly?month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`
      );
      
      if (response.ok) {
        const loyaltyData = await response.json();
        setLoyalCustomers(loyaltyData.loyalCustomers || []);
      }
    } catch (err) {
      console.error('Error fetching loyalty data:', err);
    }
  };

  // Helper function to get customer name by ID
  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : `Customer #${customerId}`;
  };

  // Helper function to get hotel name by ID
  const getHotelName = (hotelId) => {
    const hotel = hotels.find(h => h.id === hotelId);
    return hotel ? hotel.name : `Hotel #${hotelId}`;
  };

  // Helper function to get hotel location by ID
  const getHotelLocation = (hotelId) => {
    const hotel = hotels.find(h => h.id === hotelId);
    return hotel ? hotel.location : '';
  };

  // Handle customer name click
  const handleCustomerClick = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setShowCustomerDetailModal(true);
    }
  };

  // Handle register visit button
  const handleRegisterVisit = () => {
    if (!selectedCustomer) {
      alert('Please select a customer first');
      return;
    }
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
    
    if (!selectedCustomer) {
      setVisitationErrors({ submit: 'No customer selected' });
      return;
    }
    
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

      // Success - close modal, reset form, and refresh data
      setShowVisitationModal(false);
      setSelectedCustomer(null);
      setVisitationData({
        hotelId: '',
        visitDate: new Date().toISOString().split('T')[0]
      });
      setVisitationErrors({});
      
      // Refresh visitations data
      fetchAllData();
      
      // Show success message
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

  // Handle close new visit modal
  const handleCloseNewVisitModal = () => {
    setShowNewVisitModal(false);
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

  // Filter handling functions
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleHotelSelectionChange = (hotelId) => {
    setFilters(prev => ({
      ...prev,
      selectedHotels: prev.selectedHotels.includes(hotelId)
        ? prev.selectedHotels.filter(id => id !== hotelId)
        : [...prev.selectedHotels, hotelId]
    }));
  };

  const handleSearchClick = async () => {
    setIsFiltering(true);
    try {
      let filteredData = [...visitations];
      let currentLoyalCustomers = [...loyalCustomers];

      // 1. Filter by month/year FIRST (if specified)
      if (filters.monthYear) {
        const [year, month] = filters.monthYear.split('-');
        filteredData = filteredData.filter(v => {
          const visitDate = new Date(v.visitDate);
          return visitDate.getFullYear() === parseInt(year) && 
                 visitDate.getMonth() === parseInt(month) - 1;
        });

        // Fetch loyalty data for the selected month/year
        try {
          const loyaltyResponse = await fetch(
            `http://localhost:5000/api/loyalty/monthly?month=${month}&year=${year}`
          );
          
          if (loyaltyResponse.ok) {
            const loyaltyData = await loyaltyResponse.json();
            currentLoyalCustomers = loyaltyData.loyalCustomers || [];
            setLoyalCustomers(currentLoyalCustomers);
          }
        } catch (loyaltyErr) {
          console.error('Error fetching loyalty data:', loyaltyErr);
          currentLoyalCustomers = [];
        }
      } else {
        // If no month/year filter, use current month's loyalty data
        currentLoyalCustomers = loyalCustomers;
      }

      // 2. Filter by selected hotels (if any selected)
      if (filters.selectedHotels.length > 0) {
        filteredData = filteredData.filter(v => 
          filters.selectedHotels.includes(v.hotelId)
        );
      }

      // 3. Filter by loyal customers only (if checkbox is checked)
      if (filters.onlyLoyalCustomers && currentLoyalCustomers.length > 0) {
        const loyalCustomerIds = currentLoyalCustomers.map(lc => lc.customerId);
        filteredData = filteredData.filter(v => 
          loyalCustomerIds.includes(v.customerId)
        );
      }

      console.log('Applied filters:', {
        monthYear: filters.monthYear,
        selectedHotels: filters.selectedHotels,
        onlyLoyalCustomers: filters.onlyLoyalCustomers,
        originalCount: visitations.length,
        filteredCount: filteredData.length,
        loyalCustomersCount: currentLoyalCustomers.length
      });

      setFilteredVisitations(filteredData);
    } catch (err) {
      console.error('Error filtering data:', err);
      setError('Failed to apply filters. Please try again.');
    } finally {
      setIsFiltering(false);
    }
  };

  const handleClearFilters = async () => {
    setIsFiltering(true);
    try {
      // Reset filters to default values
      setFilters({
        selectedHotels: [],
        monthYear: '', // Clear month/year selection
        onlyLoyalCustomers: false
      });
      
      // Reset to show all visitations
      setFilteredVisitations(visitations);
      
      // Fetch loyalty data for current month (default state)
      await fetchLoyaltyData();
      
      console.log('Filters cleared, showing all visitations');
    } catch (err) {
      console.error('Error clearing filters:', err);
    } finally {
      setIsFiltering(false);
    }
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
            <div>
              <h2>Loyalty Analytics</h2>
              <button className="btn btn-primary" onClick={() => setShowNewVisitModal(true)}>Add new visit</button>
              {(filters.selectedHotels.length > 0 || filters.monthYear !== new Date().toISOString().slice(0, 7) || filters.onlyLoyalCustomers) && (
                <small className="text-muted">
                  <i className="bi bi-funnel me-1"></i>
                  Filters applied - showing {filteredVisitations.length} of {visitations.length} visits
                </small>
              )}
            </div>
            <div className="text-muted">
              <i className="bi bi-calendar-check me-2"></i>
              Showing: <span className="badge bg-primary">{filteredVisitations.length}</span>
              <span className="ms-2">
                Total: <span className="badge bg-secondary">{visitations.length}</span>
              </span>
              {loyalCustomers.length > 0 && (
                <span className="ms-3">
                  <i className="bi bi-star me-1 text-warning"></i>
                  Loyal: <span className="badge bg-warning text-dark">{loyalCustomers.length}</span>
                </span>
              )}
            </div>
          </div>

          {/* Filter Section */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-funnel me-2"></i>
                Search & Filter Options
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {/* Hotel Multi-Select */}
                <div className="col-md-4">
                  <label className="form-label">Hotels</label>
                  <div className="dropdown">
                    <button 
                      className="btn btn-outline-secondary dropdown-toggle w-100 text-start" 
                      type="button" 
                      data-bs-toggle="dropdown"
                    >
                      {filters.selectedHotels.length === 0 
                        ? 'Select Hotels...' 
                        : `${filters.selectedHotels.length} hotel(s) selected`
                      }
                    </button>
                    <ul className="dropdown-menu w-100" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {hotels.map(hotel => (
                        <li key={hotel.id}>
                          <div className="dropdown-item">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`hotel-${hotel.id}`}
                                checked={filters.selectedHotels.includes(hotel.id)}
                                onChange={() => handleHotelSelectionChange(hotel.id)}
                              />
                              <label className="form-check-label" htmlFor={`hotel-${hotel.id}`}>
                                {hotel.name} - {hotel.location}
                              </label>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Month/Year Picker */}
                <div className="col-md-3">
                  <label className="form-label">Month/Year</label>
                  <div className="row g-1">
                    <div className="col-6">
                      <select 
                        className="form-select form-select-sm"
                        value={filters.monthYear ? filters.monthYear.split('-')[1] : ''}
                        onChange={(e) => {
                          const currentYear = filters.monthYear ? filters.monthYear.split('-')[0] : '2024';
                          const newValue = e.target.value ? `${currentYear}-${e.target.value}` : '';
                          handleFilterChange('monthYear', newValue);
                        }}
                      >
                        <option value="">Month</option>
                        <option value="01">January</option>
                        <option value="02">February</option>
                        <option value="03">March</option>
                        <option value="04">April</option>
                        <option value="05">May</option>
                        <option value="06">June</option>
                        <option value="07">July</option>
                        <option value="08">August</option>
                        <option value="09">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <select 
                        className="form-select form-select-sm"
                        value={filters.monthYear ? filters.monthYear.split('-')[0] : ''}
                        onChange={(e) => {
                          const currentMonth = filters.monthYear ? filters.monthYear.split('-')[1] : '01';
                          const newValue = e.target.value ? `${e.target.value}-${currentMonth}` : '';
                          handleFilterChange('monthYear', newValue);
                        }}
                      >
                        <option value="">Year</option>
                        {Array.from({length: 11}, (_, i) => 2020 + i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <small className="form-text text-muted">Select month and year (2020-2030)</small>
                </div>

                {/* Only Loyal Customers Checkbox */}
                <div className="col-md-3">
                  <label className="form-label">Display Options</label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="onlyLoyalCustomers"
                      checked={filters.onlyLoyalCustomers}
                      onChange={(e) => handleFilterChange('onlyLoyalCustomers', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="onlyLoyalCustomers">
                      <i className="bi bi-star me-1 text-warning"></i>
                      Only Loyal Customers
                    </label>
                  </div>
                  <small className="form-text text-muted">
                    Show only customers with consistent visit patterns
                  </small>
                </div>

                {/* Search Buttons */}
                <div className="col-md-2">
                  <label className="form-label">&nbsp;</label>
                  <div className="d-grid gap-2">
                    <button 
                      className="btn btn-primary"
                      onClick={handleSearchClick}
                      disabled={isFiltering}
                    >
                      {isFiltering ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Searching...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-search me-2"></i>
                          Search
                        </>
                      )}
                    </button>
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={handleClearFilters}
                      disabled={isFiltering}
                    >
                      {isFiltering ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                          Clearing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-x-circle me-1"></i>
                          Clear
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {filteredVisitations.length === 0 ? (
            <div className="alert alert-info">
              <h5>No visitations found</h5>
              {visitations.length === 0 ? (
                <p>No hotel visits have been recorded yet. Visit the Customer Profile page to register new visits.</p>
              ) : (
                <div>
                  <p>No visitations match the current filter criteria.</p>
                  <p><strong>Active filters:</strong></p>
                  <ul className="mb-2">
                    {filters.selectedHotels.length > 0 && (
                      <li>Hotels: {filters.selectedHotels.length} selected</li>
                    )}
                    {filters.monthYear && (
                      <li>Month/Year: {new Date(filters.monthYear + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</li>
                    )}
                    {filters.onlyLoyalCustomers && (
                      <li>Only loyal customers: {loyalCustomers.length} loyal customers found</li>
                    )}
                  </ul>
                  <button className="btn btn-outline-primary btn-sm" onClick={handleClearFilters}>
                    <i className="bi bi-x-circle me-1"></i>
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Customer</th>
                    <th scope="col">Hotel</th>
                    <th scope="col">Location</th>
                    <th scope="col">Visit Date</th>
                    <th scope="col">Visit Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVisitations
                    .sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate)) // Sort by date descending
                    .map((visitation, index) => {
                      const visitDate = new Date(visitation.visitDate);
                      const isLoyalCustomer = loyalCustomers.some(lc => lc.customerId === visitation.customerId);
                      return (
                        <tr key={visitation.id}>
                          <th scope="row">{index + 1}</th>
                          <td>
                            <button 
                              className="btn btn-link p-0 text-primary text-decoration-none fw-bold"
                              onClick={() => handleCustomerClick(visitation.customerId)}
                              style={{ fontSize: 'inherit', textAlign: 'left' }}
                            >
                              {getCustomerName(visitation.customerId)}
                              {isLoyalCustomer && (
                                <i className="bi bi-star-fill text-warning ms-2" title="Loyal Customer"></i>
                              )}
                            </button>
                          </td>
                          <td>
                            <strong>{getHotelName(visitation.hotelId)}</strong>
                          </td>
                          <td>
                            <span className="text-muted">
                              <i className="bi bi-geo-alt me-1"></i>
                              {getHotelLocation(visitation.hotelId)}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark">
                              {visitDate.toLocaleDateString()}
                            </span>
                          </td>
                          <td>
                            <small className="text-muted">
                              {visitDate.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </small>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary Statistics */}
          {filteredVisitations.length > 0 && (
            <div className="row mt-4">
              <div className="col-md-3">
                <div className="card bg-light">
                  <div className="card-body text-center">
                    <h5 className="card-title">Total Customers</h5>
                    <h3 className="text-primary">
                      {new Set(filteredVisitations.map(v => v.customerId)).size}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-light">
                  <div className="card-body text-center">
                    <h5 className="card-title">Hotels Visited</h5>
                    <h3 className="text-success">
                      {new Set(filteredVisitations.map(v => v.hotelId)).size}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-light">
                  <div className="card-body text-center">
                    <h5 className="card-title">Total Visits</h5>
                    <h3 className="text-info">{filteredVisitations.length}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-warning">
                  <div className="card-body text-center">
                    <h5 className="card-title">
                      <i className="bi bi-star me-1"></i>
                      Loyal Customers
                    </h5>
                    <h3 className="text-dark">{loyalCustomers.length}</h3>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Detail Modal (Read-only) */}
      {((showCustomerDetailModal && selectedCustomer) || showNewVisitModal) && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {showNewVisitModal ? 'Register New Visit' : 'Customer Details'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={showNewVisitModal ? handleCloseNewVisitModal : handleCloseCustomerDetailModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Customer</label>
                  <select
                    className="form-select"
                    value={selectedCustomer?.id ?? ""}
                    onChange={(e) => {
                      const customerId = parseInt(e.target.value);
                      const customer = customers.find(c => c.id === customerId);
                      setSelectedCustomer(customer || null);
                    }}
                  >
                    <option value="">Select a customer...</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} ({customer.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={selectedCustomer?.email ?? ""}
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Registration Date</label>
                  <input
                    type="text"
                    className="form-control"
                    value={new Date(selectedCustomer?.registrationDate ?? "").toLocaleDateString()}
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Total Purchases</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedCustomer?.totalPurchases ?? 0}
                    readOnly
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={showNewVisitModal ? handleCloseNewVisitModal : handleCloseCustomerDetailModal}
                >
                  Close
                </button>
                {showCustomerDetailModal && (
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={handleRegisterVisit}
                  >
                    <i className="bi bi-calendar-plus me-2"></i>
                    Register Visit
                  </button>
                )}
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

export default Visitations;