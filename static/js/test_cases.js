// static/js/test_cases.js
document.addEventListener('DOMContentLoaded', function() {
    // Search functionality
    const searchInput = document.getElementById('searchTestCases');
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
    
    // Filter form handling
    const filterForm = document.getElementById('filterForm');
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fileId = this.elements['file_id'].value;
            const status = this.elements['status'].value;
            const automated = this.elements['automated'].value;
            const testType = this.elements['test_type'].value;
            const priority = this.elements['priority'].value;
            const testId = this.elements['test_id'].value;
            
            const rows = document.querySelectorAll('#testCasesTable tbody tr');
            
            rows.forEach(row => {
                let show = true;
                
                // Apply filters
                if (fileId && row.cells[2].textContent.trim() !== document.querySelector(`select[name="file_id"] option[value="${fileId}"]`).textContent.trim()) {
                    show = false;
                }
                
                if (status && !row.getAttribute('data-status').includes(status.toLowerCase())) {
                    show = false;
                }
                
                if (automated && row.getAttribute('data-automated') !== automated) {
                    show = false;
                }
                
                if (testType && row.getAttribute('data-type') !== testType) {
                    show = false;
                }
                
                if (priority && row.getAttribute('data-priority') !== priority) {
                    show = false;
                }
                
                if (testId && !row.cells[0].textContent.toLowerCase().includes(testId.toLowerCase())) {
                    show = false;
                }
                
                row.style.display = show ? '' : 'none';
            });
        });
    }
    
    // Reset filters
    document.getElementById('resetFilters')?.addEventListener('click', function() {
        filterForm.reset();
        const rows = document.querySelectorAll('#testCasesTable tbody tr');
        rows.forEach(row => {
            row.style.display = '';
        });
    });
    
    // Export test cases
    document.getElementById('exportTestCases')?.addEventListener('click', function() {
        alert('Export functionality would be implemented here');
    });
    
    // View test case details (reuse from analytics.js)
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
                    <strong>Test File:</strong> ${row.cells[2].textContent}
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
                    <strong>Automated:</strong> ${row.getAttribute('data-automated') === 'yes' ? 'Yes' : 'No'}
                </div>
                <div class="mb-3">
                    <strong>Last Run:</strong> ${row.cells[7].textContent}
                </div>
            `;
            
            const modal = new bootstrap.Modal(document.getElementById('testCaseModal'));
            modal.show();
        });
    });
});