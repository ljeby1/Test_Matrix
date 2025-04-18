// static/js/upload.js
document.addEventListener('DOMContentLoaded', function() {
    const dropzone = document.getElementById('fileDropzone');
    const fileInput = document.getElementById('fileInput');
    const fileDetails = document.getElementById('fileDetails');
    const fileName = document.getElementById('fileName');
    const removeFile = document.getElementById('removeFile');
    const uploadForm = document.getElementById('uploadForm');
    
    // Make dropzone clickable
    if (dropzone) {
        dropzone.addEventListener('click', function() {
            fileInput.click();
        });
        
        // Handle drag and drop events
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
    
    // Handle file selection
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (fileInput.files.length) {
                handleFile(fileInput.files[0]);
            }
        });
    }
    
    // Handle file removal
    if (removeFile) {
        removeFile.addEventListener('click', function() {
            fileInput.value = '';
            fileDetails.classList.add('d-none');
            dropzone.classList.remove('d-none');
        });
    }
    
    // Handle form submission
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('documentTitle').value;
            
            if (!title || !fileInput.files.length) {
                alert('Please enter a title and select a file');
                return;
            }
            
            const formData = new FormData();
            formData.append('title', title);
            formData.append('file', fileInput.files[0]);
            
            // Show loading indicator
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Uploading...';
            submitBtn.disabled = true;
            
            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                if (data.success) {
                    // Show success modal
                    const successModal = new bootstrap.Modal(document.getElementById('uploadSuccessModal'));
                    document.getElementById('viewAnalyticsBtn').href = '/analytics/' + data.file_id;
                    successModal.show();
                    
                    // Reset form
                    uploadForm.reset();
                    fileDetails.classList.add('d-none');
                    dropzone.classList.remove('d-none');
                    
                    // Reload page after 1 second to show updated list
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    alert('Upload failed: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                alert('An error occurred during upload');
            });
        });
    }
    
    // Handle file deletion
    const deleteButtons = document.querySelectorAll('.delete-file');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const fileId = this.getAttribute('data-id');
            const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
            
            // Set the file ID on the confirm button
            document.getElementById('confirmDeleteBtn').setAttribute('data-id', fileId);
            deleteModal.show();
        });
    });
    
    // Confirm deletion
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            const fileId = this.getAttribute('data-id');
            
            fetch('/api/delete_file/' + fileId, {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.reload();
                } else {
                    alert('Delete failed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred');
            });
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
});