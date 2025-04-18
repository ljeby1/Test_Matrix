// static/js/analytics_dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    // Form submission handling
    document.getElementById('analyticsFilterForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get selected file IDs
        const fileSelector = document.getElementById('fileSelector');
        const selectedFiles = Array.from(fileSelector.selectedOptions).map(option => option.value);
        
        // Get date range
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        // Build query string
        let queryString = '';
        selectedFiles.forEach(fileId => {
            queryString += `file_ids=${fileId}&`;
        });
        
        if (startDate) queryString += `start_date=${startDate}&`;
        if (endDate) queryString += `end_date=${endDate}&`;
        
        // Redirect to analytics dashboard with filters
        window.location.href = `/analytics_dashboard?${queryString}`;
    });
    
    // Search functionality
    document.getElementById('searchResults').addEventListener('keyup', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#resultsTable tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
    
    // File Results Chart
    const fileResultsCtx = document.getElementById('fileResultsChart');
    if (fileResultsCtx && analyticsData.fileResults.length > 0) {
        new Chart(fileResultsCtx, {
            type: 'bar',
            data: {
                labels: analyticsData.fileResults.map(file => file.name),
                datasets: [{
                    label: 'Passed',
                    backgroundColor: '#28a745',
                    data: analyticsData.fileResults.map(file => file.passed)
                }, {
                    label: 'Failed',
                    backgroundColor: '#dc3545',
                    data: analyticsData.fileResults.map(file => file.failed)
                }, {
                    label: 'Not Run',
                    backgroundColor: '#6c757d',
                    data: analyticsData.fileResults.map(file => file.not_run)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Results Summary Chart
    const resultsSummaryCtx = document.getElementById('resultsSummaryChart');
    if (resultsSummaryCtx) {
        new Chart(resultsSummaryCtx, {
            type: 'pie',
            data: {
                labels: ['Passed', 'Failed', 'Not Run'],
                datasets: [{
                    data: [
                        analyticsData.resultsSummary.passed,
                        analyticsData.resultsSummary.failed,
                        analyticsData.resultsSummary.notRun
                    ],
                    backgroundColor: ['#28a745', '#dc3545', '#6c757d'],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }
    
    // Type Distribution Chart
    const typeDistributionCtx = document.getElementById('typeDistributionChart');
    if (typeDistributionCtx && Object.keys(analyticsData.typeDistribution).length > 0) {
        const typeColors = {
            'Functional': '#3b7ddd',
            'Performance': '#28a745',
            'Security': '#dc3545',
            'Usability': '#ffc107',
            'Compatibility': '#17a2b8'
        };
        
        new Chart(typeDistributionCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(analyticsData.typeDistribution),
                datasets: [{
                    data: Object.values(analyticsData.typeDistribution),
                    backgroundColor: Object.keys(analyticsData.typeDistribution).map(type => 
                        typeColors[type] || '#6c757d'),
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }
    
    // Priority Distribution Chart
    const priorityDistributionCtx = document.getElementById('priorityDistributionChart');
    if (priorityDistributionCtx) {
        new Chart(priorityDistributionCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(analyticsData.priorityDistribution),
                datasets: [{
                    data: Object.values(analyticsData.priorityDistribution),
                    backgroundColor: ['#dc3545', '#ffc107', '#17a2b8'],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }
    
    // Export report functionality
    document.getElementById('exportReport').addEventListener('click', function() {
        alert('Export functionality would generate a PDF/Excel report of the current analytics view.');
    });
    
    // View test case details
    document.querySelectorAll('.view-case').forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const testId = row.cells[0].textContent;
            const testName = row.cells[1].textContent;
            
            const modal = new bootstrap.Modal(document.getElementById('testCaseModal'));
            document.getElementById('modalTestName').textContent = testId + ': ' + testName;
            
            const modalBody = document.getElementById('modalTestBody');
            modalBody.innerHTML = `
                <div class="mb-3">
                    <strong>File:</strong> ${row.cells[2].textContent}
                </div>
                <div class="mb-3">
                    <strong>Priority:</strong> ${row.cells[3].textContent}
                </div>
                <div class="mb-3">
                    <strong>Type:</strong> ${row.cells[4].textContent}
                </div>
                <div class="mb-3">
                    <strong>Status:</strong> ${row.cells[5].textContent}
                </div>
                <div class="mb-3">
                    <strong>Automated:</strong> ${row.cells[6].querySelector('i').classList.contains('fa-check') ? 'Yes' : 'No'}
                </div>
                <div class="mb-3">
                    <strong>Date:</strong> ${row.cells[7].textContent}
                </div>
            `;
            
            modal.show();
        });
    });
});