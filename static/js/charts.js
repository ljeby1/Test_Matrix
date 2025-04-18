// static/js/charts.js
document.addEventListener('DOMContentLoaded', function() {
    // Test Results Chart
    const testResultsCtx = document.getElementById('testResultsChart');
    if (testResultsCtx) {
        const testResultsChart = new Chart(testResultsCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(testData.types),
                datasets: [{
                    label: 'Passed',
                    backgroundColor: '#28a745',
                    data: Object.keys(testData.types).map(() => testData.passed * (1/Object.keys(testData.types).length))
                }, {
                    label: 'Failed',
                    backgroundColor: '#dc3545',
                    data: Object.keys(testData.types).map(() => testData.failed * (1/Object.keys(testData.types).length))
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
    
    // Test Breakdown Chart
    const testBreakdownCtx = document.getElementById('testBreakdownChart');
    if (testBreakdownCtx) {
        const testBreakdownChart = new Chart(testBreakdownCtx, {
            type: 'pie',
            data: {
                labels: ['Passed', 'Failed', 'Not Run'],
                datasets: [{
                    data: [
                        testData.passed, 
                        testData.failed, 
                        testData.total - testData.passed - testData.failed
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
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Priority Chart
    const priorityChartCtx = document.getElementById('priorityChart');
    if (priorityChartCtx) {
        const priorityChart = new Chart(priorityChartCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(testData.priorities),
                datasets: [{
                    data: Object.values(testData.priorities),
                    backgroundColor: ['#dc3545', '#ffc107', '#17a2b8'],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Type Chart
    const typeChartCtx = document.getElementById('typeChart');
    if (typeChartCtx) {
        const typeColors = {
            'Functional': '#3b7ddd',
            'Performance': '#28a745',
            'Security': '#dc3545',
            'Usability': '#ffc107',
            'Compatibility': '#17a2b8'
        };
        
        const typeChart = new Chart(typeChartCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(testData.types),
                datasets: [{
                    data: Object.values(testData.types),
                    backgroundColor: Object.keys(testData.types).map(type => 
                        typeColors[type] || '#6c757d'),
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Filter test cases
    const filterButtons = document.querySelectorAll('.filter-results');
    filterButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const filter = this.getAttribute('data-filter');
            const rows = document.querySelectorAll('#testCasesTable tbody tr');
            
            rows.forEach(row => {
                if (filter === 'all') {
                    row.style.display = '';
                } else if (filter === 'failed') {
                    row.style.display = row.getAttribute('data-status') === 'fail' || 
                                      row.getAttribute('data-status') === 'failed' ? '' : 'none';
                } else if (filter === 'automated') {
                    row.style.display = row.getAttribute('data-automated') === 'yes' ? '' : 'none';
                }
            });
        });
    });
    
    // Search test cases
    const searchInput = document.getElementById('testCaseSearch');
    if (searchInput) {
        searchInput.addEventListener('keyup', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#testCasesTable tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
    
    // View test case details
    const viewButtons = document.querySelectorAll('.view-case');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const testId = row.cells[0].textContent;
            const testName = row.cells[1].textContent;
            
            document.getElementById('modalTestName').textContent = testId + ': ' + testName;
            
            const modalBody = document.getElementById('modalTestBody');
            modalBody.innerHTML = `
                <div class="mb-3">
                    <strong>Priority:</strong> ${row.cells[2].textContent}
                </div>
                <div class="mb-3">
                    <strong>Type:</strong> ${row.cells[3].textContent}
                </div>
                <div class="mb-3">
                    <strong>Status:</strong> ${row.cells[4].textContent}
                </div>
                <div class="mb-3">
                    <strong>Automated:</strong> ${row.cells[5].querySelector('i').classList.contains('fa-check') ? 'Yes' : 'No'}
                </div>
            `;
            
            const modal = new bootstrap.Modal(document.getElementById('testCaseModal'));
            modal.show();
        });
    });
    
    // Export report
    document.getElementById('exportReport')?.addEventListener('click', function() {
        alert('Export functionality would be implemented here');
    });
});