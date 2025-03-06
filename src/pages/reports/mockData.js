// src/pages/reports/mockData.js

// Performance Metrics Data
export const performanceData = {
    totalInspections: {
      current: 2847,
      previous: 2156,
      trend: 32.1,
      breakdown: {
        beach: 1245,
        marina: 892,
        facilities: 710
      }
    },
    completionRate: {
      current: 87.4,
      previous: 82.1,
      trend: 5.3,
      breakdown: {
        onTime: 78.2,
        delayed: 15.3,
        incomplete: 6.5
      }
    },
    avgCompletionTime: {
      current: 4.2,
      previous: 5.8,
      trend: -27.6,
      breakdown: {
        preparation: 0.8,
        inspection: 2.5,
        reporting: 0.9
      }
    },
    complianceScore: {
      current: 92.8,
      previous: 88.5,
      trend: 4.3,
      breakdown: {
        safety: 94.2,
        equipment: 91.7,
        documentation: 89.8
      }
    },
    criticalIssues: {
      current: 23,
      previous: 42,
      trend: -45.2,
      breakdown: {
        high: 8,
        medium: 12,
        low: 3
      }
    },
    activeInspectors: {
      current: 68,
      previous: 52,
      trend: 30.8,
      breakdown: {
        field: 42,
        office: 26
      }
    }
  };
  
  // Monthly Trend Data
  export const monthlyTrendData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2024, i, 1);
    return {
      month: month.toLocaleString('default', { month: 'short' }),
      total: Math.floor(Math.random() * (350 - 200) + 200),
      completed: Math.floor(Math.random() * (300 - 150) + 150),
      pending: Math.floor(Math.random() * (100 - 20) + 20),
      compliance: Math.floor(Math.random() * (100 - 75) + 75)
    };
  });
  
  // Regional Distribution Data
  export const regionalData = [
    { region: 'North Beach', count: 587, compliance: 94.2, issues: 12 },
    { region: 'South Marina', count: 423, compliance: 88.7, issues: 18 },
    { region: 'East Coast', count: 689, compliance: 91.5, issues: 15 },
    { region: 'West Harbor', count: 512, compliance: 93.8, issues: 9 },
    { region: 'Central Bay', count: 636, compliance: 90.2, issues: 21 }
  ];
  
  // Inspector Performance Data
  export const inspectorPerformance = [
    {
      id: 1,
      name: 'John Doe',
      tasksCompleted: 187,
      avgCompletionTime: 3.8,
      complianceRate: 95.2,
      rating: 4.8,
      recentActivity: [
        { date: '2024-01-15', count: 8, type: 'Beach' },
        { date: '2024-01-14', count: 6, type: 'Marina' },
        { date: '2024-01-13', count: 7, type: 'Facility' }
      ]
    },
    {
      id: 2,
      name: 'Jane Smith',
      tasksCompleted: 162,
      avgCompletionTime: 4.1,
      complianceRate: 93.7,
      rating: 4.6,
      recentActivity: [
        { date: '2024-01-15', count: 7, type: 'Marina' },
        { date: '2024-01-14', count: 5, type: 'Beach' },
        { date: '2024-01-13', count: 8, type: 'Facility' }
      ]
    },
    // ... Add more inspectors
  ];
  
  // Compliance Breakdown Data
  export const complianceData = {
    categories: [
      { name: 'Safety Equipment', score: 94.2, weight: 25 },
      { name: 'Emergency Procedures', score: 88.7, weight: 20 },
      { name: 'Staff Training', score: 91.5, weight: 15 },
      { name: 'Documentation', score: 93.8, weight: 15 },
      { name: 'Facility Maintenance', score: 90.2, weight: 15 },
      { name: 'Environmental Standards', score: 89.5, weight: 10 }
    ],
    trends: Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i, 1).toLocaleString('default', { month: 'short' }),
      overall: Math.floor(Math.random() * (95 - 85) + 85),
      safety: Math.floor(Math.random() * (98 - 90) + 90),
      procedures: Math.floor(Math.random() * (95 - 85) + 85)
    }))
  };
  
  // Issue Tracking Data
  export const issueData = {
    severity: [
      { level: 'Critical', count: 12, change: -5 },
      { level: 'High', count: 28, change: -3 },
      { level: 'Medium', count: 45, change: 8 },
      { level: 'Low', count: 64, change: -2 }
    ],
    timeline: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
      critical: Math.floor(Math.random() * 5),
      high: Math.floor(Math.random() * 8),
      medium: Math.floor(Math.random() * 12),
      low: Math.floor(Math.random() * 15)
    }))
  };
  
  // Task Type Distribution Data
  export const taskTypeData = [
    { type: 'Safety Inspection', count: 876, compliance: 94.5 },
    { type: 'Equipment Check', count: 654, compliance: 91.2 },
    { type: 'Training Verification', count: 432, compliance: 88.7 },
    { type: 'Documentation Review', count: 567, compliance: 93.1 },
    { type: 'Environmental Audit', count: 345, compliance: 90.8 }
  ].map(item => ({
    ...item,
    monthly: Array.from({ length: 6 }, () => Math.floor(Math.random() * (150 - 50) + 50))
  }));
  
  // Time-based Analytics
  export const timeAnalytics = {
    hourly: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      inspections: Math.floor(Math.random() * (50 - 10) + 10),
      completion: Math.floor(Math.random() * (100 - 70) + 70)
    })),
    weekly: Array.from({ length: 7 }, (_, day) => ({
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day],
      inspections: Math.floor(Math.random() * (200 - 100) + 100),
      completion: Math.floor(Math.random() * (100 - 70) + 70)
    })),
    monthly: Array.from({ length: 12 }, (_, month) => ({
      month: new Date(2024, month).toLocaleString('default', { month: 'short' }),
      inspections: Math.floor(Math.random() * (800 - 400) + 400),
      completion: Math.floor(Math.random() * (100 - 70) + 70)
    }))
  };
  
  // Weather Impact Data
  export const weatherImpact = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
    temperature: Math.floor(Math.random() * (35 - 20) + 20),
    precipitation: Math.random() * 100,
    windSpeed: Math.floor(Math.random() * (50 - 10) + 10),
    inspectionsCompleted: Math.floor(Math.random() * (50 - 20) + 20),
    weatherDelay: Math.random() > 0.7
  }));
  
  // Resource Utilization Data
  export const resourceUtilization = {
    equipment: [
      { name: 'Safety Gear', utilization: 78.5, maintenance: 95.2 },
      { name: 'Testing Equipment', utilization: 84.2, maintenance: 91.8 },
      { name: 'Vehicles', utilization: 92.1, maintenance: 88.5 },
      { name: 'Mobile Devices', utilization: 95.7, maintenance: 93.4 }
    ],
    personnel: Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i).toLocaleString('default', { month: 'short' }),
      fieldStaff: Math.floor(Math.random() * (100 - 70) + 70),
      officeStaff: Math.floor(Math.random() * (100 - 70) + 70),
      management: Math.floor(Math.random() * (100 - 80) + 80)
    }))
  };