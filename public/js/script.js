// Client-side form validation and enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Add date validation to ensure events are not in the past
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    
    dateInputs.forEach(input => {
        input.min = today;
    });
    
    // Confirm before deleting
    const deleteButtons = document.querySelectorAll('form button[type="submit"]');
    deleteButtons.forEach(button => {
        if (button.textContent.toLowerCase().includes('delete')) {
            button.addEventListener('click', function(e) {
                if (!confirm('Are you sure you want to delete this item?')) {
                    e.preventDefault();
                }
            });
        }
    });
});