// static/js/index.js
document.addEventListener('DOMContentLoaded', function() {
    // Any dashboard-specific functionality can go here
    console.log('Dashboard loaded');
    
    // Example: Add hover effect to dashboard cards
    const dashboardCards = document.querySelectorAll('.card');
    dashboardCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.transition = 'transform 0.3s ease';
            this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.05)';
        });
    });
});