// static/js/main.js
document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle functionality
    const sidebarToggle = document.querySelector('.fa-bars');
    
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
 
    // Dropdown initialization
    const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
    dropdownElementList.forEach(element => {
        new bootstrap.Dropdown(element);
    });
 });