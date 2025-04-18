// scripts.js - updated to match Flask functionality
document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle functionality
    const sidebarToggle = document.querySelector('.topbar .fa-bars');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            const content = document.querySelector('.content-wrapper');
            const topbar = document.querySelector('.topbar');
            
            sidebar.classList.toggle('collapsed');
            
            if (sidebar.classList.contains('collapsed')) {
                sidebar.style.marginLeft = '-250px';
                content.style.marginLeft = '0';
                topbar.style.left = '0';
            } else {
                sidebar.style.marginLeft = '0';
                content.style.marginLeft = 'var(--sidebar-width)';
                topbar.style.left = 'var(--sidebar-width)';
            }
        });
    }
    
    // Initialize dropdowns
    const dropdownToggleList = document.querySelectorAll('.dropdown-toggle');
    dropdownToggleList.forEach(function(dropdown) {
        new bootstrap.Dropdown(dropdown);
    });
    
    // File upload handling for upload.html
    if (window.location.pathname.includes('upload')) {
        const dropzone = document.getElementById('fileDropzone');
        const fileInput = document.getElementById('fileInput');
        const fileDetails = document.getElementById('fileDetails');
        const fileName = document.getElementById('fileName');
        const removeFile = document.getElementById('removeFile');
        const uploadForm = document.getElementById('uploadForm');
        
        if (dropzone) {
            dropzone.addEventListener('click', function() {
                fileInput.click();
            });
            
            dropzone.addEventListener('dragover', function(e) {
                e.preventDefault();
                dropzone.classList.add('border-primary');
            });
            
            dropzone.addEventListener('dragleave', function() {
                dropzone.classList.remove('border-primary');
            });
            
            dropzone.addEventListener('drop', function(e) {
                e.preventDefault();
                dropzone.classList.remove('border-primary');
                
                if (e.dataTransfer.files.length) {
                    handleFile(e.dataTransfer.files[0]);
                }
            });
        }
        
        if (fileInput) {
            fileInput.addEventListener('change', function() {
                if (fileInput.files.length) {
                    handleFile(fileInput.files[0]);
                }
            });
        }
        
        if (removeFile) {
            removeFile.addEventListener('click', function() {
                fileInput.value = '';
                fileDetails.classList.add('d-none');
                dropzone.classList.remove('d-none');
            });
        }
        
        if (uploadForm) {
            uploadForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const title = document.getElementById('documentTitle').value;
                if (!title || !fileInput.files.length) {
                    alert('Please enter a title and select a file');
                    return;
                }
                
                window.location.href = 'analytics.html';
            });
        }
        
        function handleFile(file) {
            if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                alert('Please upload an Excel file (.xlsx)');
                return;
            }
            
            fileName.textContent = file.name;
            fileDetails.classList.remove('d-none');
            dropzone.classList.add('d-none');
        }
    }
});