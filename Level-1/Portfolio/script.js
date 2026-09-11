// Jab user scroll kare tab navigation bar aur scroll button ka behavior
window.addEventListener('scroll', function () {
    const topBtn = document.getElementById('scrollTopBtn');
    
    // Agar page 300px se zyada scroll ho chuka hai to button show karo
    if (window.scrollY > 300) {
        topBtn.style.display = 'block';
    } else {
        topBtn.style.display = 'none';
    }
});

// Button click hone par smoothly upar scroll karne ka function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Contact Form Submission Handling
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault(); // Page reload hone se rokta hai

        const name = document.getElementById('userName').value;

        // User feedback
        alert(`Thank you, ${name}! Your message has been sent successfully.`);

        // Form reset karna
        contactForm.reset();
    });
}