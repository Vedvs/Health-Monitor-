// Smart Health Monitoring System - JavaScript

// Application state
let currentRole = null;
let currentView = 'dashboard';
let charts = {};
let isOfflineMode = false;

// Application data
const appData = {
  northeast_states: [
    {"name": "Assam", "population": 31200000, "villages": 26247, "active_cases": 1250, "water_quality_issues": 450},
    {"name": "Meghalaya", "population": 3000000, "villages": 6026, "active_cases": 340, "water_quality_issues": 180},
    {"name": "Manipur", "population": 2900000, "villages": 2391, "active_cases": 180, "water_quality_issues": 95},
    {"name": "Mizoram", "population": 1100000, "villages": 830, "active_cases": 75, "water_quality_issues": 40},
    {"name": "Nagaland", "population": 2000000, "villages": 1428, "active_cases": 120, "water_quality_issues": 60},
    {"name": "Tripura", "population": 3700000, "villages": 875, "active_cases": 290, "water_quality_issues": 110},
    {"name": "Arunachal Pradesh", "population": 1400000, "villages": 5093, "active_cases": 85, "water_quality_issues": 55},
    {"name": "Sikkim", "population": 610000, "villages": 451, "active_cases": 25, "water_quality_issues": 15}
  ],
  diseases: [
    {"name": "Diarrhea", "cases": 1580, "trend": "increasing", "severity": "high"},
    {"name": "Cholera", "cases": 245, "trend": "stable", "severity": "critical"},
    {"name": "Typhoid", "cases": 420, "trend": "decreasing", "severity": "medium"},
    {"name": "Hepatitis A", "cases": 120, "trend": "stable", "severity": "medium"}
  ],
  water_quality_parameters: [
    {"parameter": "pH", "safe_range": "6.5-8.5", "current_avg": 7.2},
    {"parameter": "Turbidity", "safe_range": "<1 NTU", "current_avg": 1.8},
    {"parameter": "Chlorine", "safe_range": "0.2-1.0 mg/L", "current_avg": 0.4},
    {"parameter": "E.coli", "safe_range": "0 CFU/100ml", "current_avg": 12}
  ],
  alerts: [
    {"id": 1, "type": "Disease Outbreak", "location": "Dibrugarh, Assam", "severity": "Critical", "status": "Active", "time": "2 hours ago"},
    {"id": 2, "type": "Water Contamination", "location": "Shillong, Meghalaya", "severity": "High", "status": "Under Investigation", "time": "5 hours ago"},
    {"id": 3, "type": "Resource Shortage", "location": "Imphal, Manipur", "severity": "Medium", "status": "Resolved", "time": "1 day ago"}
  ]
};

// Translation data
const translations = {
  en: {
    dashboard: 'Dashboard',
    alerts: 'Alerts',
    water_quality: 'Water Quality',
    education: 'Education',
    predictions: 'Predictions',
    symptom_reporting: 'Symptom Reporting',
    patient_name: 'Patient Name',
    age: 'Age',
    symptoms: 'Symptoms',
    submit_report: 'Submit Report',
    cancel: 'Cancel'
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    alerts: 'अलर्ट',
    water_quality: 'पानी की गुणवत्ता',
    education: 'शिक्षा',
    predictions: 'भविष्यवाणी',
    symptom_reporting: 'लक्षण रिपोर्टिंग',
    patient_name: 'मरीज़ का नाम',
    age: 'उम्र',
    symptoms: 'लक्षण',
    submit_report: 'रिपोर्ट जमा करें',
    cancel: 'रद्द करें'
  },
  as: {
    dashboard: 'ডেশ্চবৰ্ড',
    alerts: 'সতৰ্কবাণী',
    water_quality: 'পানীৰ গুণগত মান',
    education: 'শিক্ষা',
    predictions: 'পূৰ্বাভাস',
    symptom_reporting: 'লক্ষণ প্ৰতিবেদন',
    patient_name: 'ৰোগীৰ নাম',
    age: 'বয়স',
    symptoms: 'লক্ষণ',
    submit_report: 'প্ৰতিবেদন দাখিল কৰক',
    cancel: 'বাতিল'
  },
  bn: {
    dashboard: 'ড্যাশবোর্ড',
    alerts: 'সতর্কতা',
    water_quality: 'পানির গুণমান',
    education: 'শিক্ষা',
    predictions: 'পূর্বাভাস',
    symptom_reporting: 'উপসর্গ রিপোর্টিং',
    patient_name: 'রোগীর নাম',
    age: 'বয়স',
    symptoms: 'উপসর্গ',
    submit_report: 'রিপোর্ট জমা দিন',
    cancel: 'বাতিল'
  }
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  setupEventListeners();
  setupThemeToggle();
  simulateRealTimeUpdates();
});

function initializeApp() {
  // Check for saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-color-scheme', savedTheme);
    updateThemeToggle(savedTheme);
  }

  // Always show login screen by default and reset state
  resetAppState();
  showScreen('login-screen');
}

function resetAppState() {
  currentRole = null;
  currentView = 'dashboard';
  
  // Hide navigation
  document.getElementById('main-nav').classList.add('hidden');
  
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Reset navigation items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    item.style.display = '';
  });
  document.querySelector('[data-view="dashboard"]')?.classList.add('active');
  
  // Clear any forms
  document.querySelectorAll('form').forEach(form => form.reset());
  
  // Hide any open forms or modals
  document.querySelectorAll('.hidden').forEach(el => {
    if (el.id !== 'main-nav' && el.id !== 'loading-modal') {
      el.classList.add('hidden');
    }
  });
  
  // Destroy existing charts
  Object.values(charts).forEach(chart => {
    if (chart && chart.destroy) {
      chart.destroy();
    }
  });
  charts = {};
}

function setupEventListeners() {
  // Role selection
  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const role = this.getAttribute('data-role');
      selectRole(role);
    });
  });

  // Navigation items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
      const view = this.getAttribute('data-view');
      navigateToView(view);
    });
  });

  // Language selection
  const languageSelect = document.getElementById('language-select');
  if (languageSelect) {
    languageSelect.addEventListener('change', function() {
      changeLanguage(this.value);
    });
  }

  // Forms
  const symptomForm = document.getElementById('symptom-report-form');
  if (symptomForm) {
    symptomForm.addEventListener('submit', handleSymptomReport);
  }

  // State items click
  document.querySelectorAll('.state-item').forEach(item => {
    item.addEventListener('click', function() {
      const state = this.getAttribute('data-state');
      showStateDetails(state);
    });
  });

  // Brand click to go back to login
  document.querySelector('.nav-brand')?.addEventListener('click', function() {
    logout();
  });
}

function setupThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-color-scheme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-color-scheme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeToggle(newTheme);
}

function updateThemeToggle(theme) {
  const themeToggle = document.getElementById('theme-toggle');
  const icon = themeToggle.querySelector('i');
  icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function selectRole(role) {
  currentRole = role;
  showLoadingModal();
  
  setTimeout(() => {
    hideLoadingModal();
    showMainApp(role);
  }, 1500);
}

function showMainApp(role) {
  // Hide login screen
  hideScreen('login-screen');
  
  // Show navigation
  document.getElementById('main-nav').classList.remove('hidden');
  
  // Show appropriate dashboard
  showRoleDashboard(role);
  
  // Initialize charts
  setTimeout(() => {
    initializeCharts();
  }, 100);
}

function showRoleDashboard(role) {
  // Hide all dashboards
  document.querySelectorAll('.dashboard-screen').forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Show selected dashboard
  const dashboardId = role + '-dashboard';
  const dashboard = document.getElementById(dashboardId);
  if (dashboard) {
    dashboard.classList.add('active');
    showScreen(dashboardId);
  }
  
  // Update navigation visibility based on role
  updateNavigationForRole(role);
}

function updateNavigationForRole(role) {
  const navItems = document.querySelectorAll('.nav-item');
  
  if (role === 'asha-worker') {
    // Hide some nav items for ASHA workers
    navItems.forEach(item => {
      const view = item.getAttribute('data-view');
      if (view === 'predictions') {
        item.style.display = 'none';
      }
    });
  } else if (role === 'community-volunteer') {
    // Hide some nav items for volunteers
    navItems.forEach(item => {
      const view = item.getAttribute('data-view');
      if (view === 'predictions' || view === 'alerts') {
        item.style.display = 'none';
      }
    });
  }
}

function navigateToView(view) {
  currentView = view;
  
  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  const activeNav = document.querySelector(`[data-view="${view}"]`);
  if (activeNav) {
    activeNav.classList.add('active');
  }
  
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Show selected view
  let screenId;
  if (view === 'dashboard') {
    screenId = currentRole + '-dashboard';
  } else {
    screenId = view + '-view';
  }
  
  showScreen(screenId);
  
  // Initialize view-specific content
  if (view === 'water-quality' && !charts['water-quality-chart']) {
    setTimeout(() => initializeWaterQualityChart(), 100);
  }
  if (view === 'predictions' && !charts['prediction-chart']) {
    setTimeout(() => initializePredictionChart(), 100);
  }
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.add('active');
  }
}

function hideScreen(screenId) {
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.remove('active');
  }
}

function initializeCharts() {
  initializeDiseaseChart();
}

function initializeDiseaseChart() {
  const ctx = document.getElementById('disease-chart');
  if (!ctx || charts['disease-chart']) return;
  
  const chartColors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5'];
  
  charts['disease-chart'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      datasets: [
        {
          label: 'Diarrhea',
          data: [1200, 1350, 1580, 1420, 1650, 1580, 1720, 1680, 1580],
          borderColor: chartColors[0],
          backgroundColor: chartColors[0] + '20',
          tension: 0.4
        },
        {
          label: 'Cholera',
          data: [180, 220, 245, 210, 280, 245, 290, 270, 245],
          borderColor: chartColors[1],
          backgroundColor: chartColors[1] + '20',
          tension: 0.4
        },
        {
          label: 'Typhoid',
          data: [520, 480, 420, 450, 380, 420, 360, 390, 420],
          borderColor: chartColors[2],
          backgroundColor: chartColors[2] + '20',
          tension: 0.4
        },
        {
          label: 'Hepatitis A',
          data: [95, 110, 120, 105, 130, 120, 125, 115, 120],
          borderColor: chartColors[3],
          backgroundColor: chartColors[3] + '20',
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        }
      }
    }
  });
}

function initializeWaterQualityChart() {
  const ctx = document.getElementById('water-quality-chart');
  if (!ctx || charts['water-quality-chart']) return;
  
  charts['water-quality-chart'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['pH', 'Turbidity', 'Chlorine', 'E.coli'],
      datasets: [{
        label: 'Current Levels',
        data: [7.2, 1.8, 0.4, 12],
        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5']
      }, {
        label: 'Safe Limits',
        data: [7.5, 1.0, 0.6, 0],
        backgroundColor: ['#1FB8CD80', '#FFC18580', '#B4413C80', '#ECEBD580']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function initializePredictionChart() {
  const ctx = document.getElementById('prediction-chart');
  if (!ctx || charts['prediction-chart']) return;
  
  charts['prediction-chart'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
      datasets: [{
        label: 'Predicted Cases',
        data: [2365, 2580, 2750, 2900, 3100, 3250],
        borderColor: '#B4413C',
        backgroundColor: '#B4413C20',
        tension: 0.4
      }, {
        label: 'Current Trend',
        data: [2365, 2420, 2480, 2540, 2600, 2660],
        borderColor: '#1FB8CD',
        backgroundColor: '#1FB8CD20',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  });
}

function changeLanguage(lang) {
  const elements = document.querySelectorAll('[data-translate]');
  elements.forEach(el => {
    const key = el.getAttribute('data-translate');
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
}

function showLoadingModal() {
  document.getElementById('loading-modal').classList.remove('hidden');
}

function hideLoadingModal() {
  document.getElementById('loading-modal').classList.add('hidden');
}

function logout() {
  // Reset the entire application state
  resetAppState();
  
  // Show login screen
  showScreen('login-screen');
  
  console.log('User logged out - returned to login screen');
}

// Make logout function globally available
window.logout = logout;

// ASHA Worker specific functions
function showReportingForm() {
  const form = document.getElementById('symptom-form');
  if (form) {
    form.classList.remove('hidden');
    form.scrollIntoView({ behavior: 'smooth' });
  }
}

function hideReportingForm() {
  const form = document.getElementById('symptom-form');
  if (form) {
    form.classList.add('hidden');
  }
}

function showWaterQualityForm() {
  alert('Water Quality Testing Form - This would open a form for recording water test results');
}

function showPatientTracking() {
  alert('Patient Tracking - This would show patient follow-up interface');
}

function showEducation() {
  navigateToView('education');
}

function handleSymptomReport(e) {
  e.preventDefault();
  showLoadingModal();
  
  setTimeout(() => {
    hideLoadingModal();
    alert('Symptom report submitted successfully!');
    hideReportingForm();
    e.target.reset();
    updateSyncStatus();
  }, 1000);
}

function updateSyncStatus() {
  const statusElement = document.getElementById('sync-status');
  const iconElement = document.getElementById('connection-status');
  
  if (statusElement && iconElement) {
    statusElement.textContent = 'Syncing...';
    iconElement.className = 'fas fa-sync-alt spinning';
    
    setTimeout(() => {
      statusElement.textContent = 'Synced';
      iconElement.className = 'fas fa-wifi';
    }, 2000);
  }
}

// Community Volunteer specific functions
function reportCommunityHealth() {
  showLoadingModal();
  setTimeout(() => {
    hideLoadingModal();
    alert('Community health report submitted!');
  }, 1000);
}

function scheduleHealthMeeting() {
  alert('Health meeting scheduled for next week');
}

function accessEducationalResources() {
  navigateToView('education');
}

function showStateDetails(state) {
  const stateData = appData.northeast_states.find(s => s.name.toLowerCase().includes(state));
  if (stateData) {
    alert(`${stateData.name} Details:\nPopulation: ${stateData.population.toLocaleString()}\nVillages: ${stateData.villages}\nActive Cases: ${stateData.active_cases}\nWater Quality Issues: ${stateData.water_quality_issues}`);
  }
}

// Simulate real-time updates
function simulateRealTimeUpdates() {
  setInterval(() => {
    if (currentRole) { // Only update if user is logged in
      updateStatistics();
      updateConnectionStatus();
    }
  }, 30000); // Update every 30 seconds
}

function updateStatistics() {
  // Simulate small changes in statistics
  const totalCasesElement = document.getElementById('total-cases');
  const waterIssuesElement = document.getElementById('water-issues');
  const activeWorkersElement = document.getElementById('active-workers');
  const activeAlertsElement = document.getElementById('active-alerts');
  
  if (totalCasesElement) {
    const currentValue = parseInt(totalCasesElement.textContent.replace(/,/g, ''));
    const newValue = currentValue + Math.floor(Math.random() * 10) - 5;
    totalCasesElement.textContent = Math.max(0, newValue).toLocaleString();
  }
  
  if (waterIssuesElement) {
    const currentValue = parseInt(waterIssuesElement.textContent.replace(/,/g, ''));
    const newValue = currentValue + Math.floor(Math.random() * 6) - 3;
    waterIssuesElement.textContent = Math.max(0, newValue).toLocaleString();
  }
  
  if (activeWorkersElement) {
    const currentValue = parseInt(activeWorkersElement.textContent.replace(/,/g, ''));
    const variance = Math.floor(Math.random() * 200) - 100;
    const newValue = Math.max(37000, currentValue + variance);
    activeWorkersElement.textContent = newValue.toLocaleString();
  }
}

function updateConnectionStatus() {
  const connectionIcon = document.getElementById('connection-status');
  if (connectionIcon && currentRole === 'asha-worker') {
    // Simulate occasional connectivity issues
    const isConnected = Math.random() > 0.1; // 90% chance of being connected
    
    if (isConnected) {
      connectionIcon.className = 'fas fa-wifi';
      connectionIcon.style.color = '';
    } else {
      connectionIcon.className = 'fas fa-wifi-slash';
      connectionIcon.style.color = '#ff4444';
    }
  }
}

// Educational module functions
function startLearningModule(moduleName) {
  showLoadingModal();
  setTimeout(() => {
    hideLoadingModal();
    alert(`Starting ${moduleName} learning module...`);
  }, 1000);
}

// Alert management functions
function deployResponseTeam(alertId) {
  showLoadingModal();
  setTimeout(() => {
    hideLoadingModal();
    alert(`Response team deployed for alert #${alertId}`);
  }, 1000);
}

function viewAlertDetails(alertId) {
  const alert = appData.alerts.find(a => a.id === alertId);
  if (alert) {
    const details = `Alert Details:
Type: ${alert.type}
Location: ${alert.location}
Severity: ${alert.severity}
Status: ${alert.status}
Time: ${alert.time}`;
    alert(details);
  }
}

// Add click handlers for dynamic elements
document.addEventListener('click', function(e) {
  // Handle education module buttons
  if (e.target.matches('.education-card .btn')) {
    const moduleTitle = e.target.closest('.education-card').querySelector('h4').textContent;
    startLearningModule(moduleTitle);
  }
  
  // Handle alert action buttons
  if (e.target.matches('.alert-actions .btn--primary')) {
    const alertId = e.target.closest('.alert-item').dataset.alertId || 1;
    deployResponseTeam(alertId);
  }
  
  if (e.target.matches('.alert-actions .btn--secondary')) {
    const alertId = e.target.closest('.alert-item').dataset.alertId || 1;
    viewAlertDetails(alertId);
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey || e.metaKey) {
    switch(e.key) {
      case '1':
        e.preventDefault();
        if (currentRole) navigateToView('dashboard');
        break;
      case '2':
        e.preventDefault();
        if (currentRole) navigateToView('alerts');
        break;
      case '3':
        e.preventDefault();
        if (currentRole) navigateToView('water-quality');
        break;
      case '4':
        e.preventDefault();
        if (currentRole) navigateToView('education');
        break;
      case '5':
        e.preventDefault();
        if (currentRole === 'health-official') {
          navigateToView('predictions');
        }
        break;
      case 'l':
        e.preventDefault();
        if (currentRole) logout();
        break;
    }
  }
});

// Handle window resize for responsive charts
window.addEventListener('resize', function() {
  Object.values(charts).forEach(chart => {
    if (chart && chart.resize) {
      chart.resize();
    }
  });
});

// Global functions for HTML onclick handlers
window.showReportingForm = showReportingForm;
window.hideReportingForm = hideReportingForm;
window.showWaterQualityForm = showWaterQualityForm;
window.showPatientTracking = showPatientTracking;
window.showEducation = showEducation;
window.reportCommunityHealth = reportCommunityHealth;
window.scheduleHealthMeeting = scheduleHealthMeeting;
window.accessEducationalResources = accessEducationalResources;