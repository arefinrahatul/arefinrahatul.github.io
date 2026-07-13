document.addEventListener('DOMContentLoaded', () => {
  // --- Navigation & Scroll Effects ---
  const header = document.querySelector('header');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section');
  const scrollProgress = document.querySelector('.scroll-progress');
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinksContainer = document.querySelector('.nav-links');

  // Update scroll progress bar
  const updateScrollProgress = () => {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (totalScroll > 0) {
      const scrollPercent = (window.pageYOffset / totalScroll) * 100;
      scrollProgress.style.width = `${scrollPercent}%`;
    }
  };

  // Sticky header and link highlighters
  const handleScroll = () => {
    updateScrollProgress();

    // Sticky header
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Active link highlighting
    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Initial check

  // Mobile menu toggle
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinksContainer.classList.toggle('active');
      const icon = mobileMenuBtn.querySelector('i');
      if (navLinksContainer.classList.contains('active')) {
        icon.className = 'fas fa-times';
      } else {
        icon.className = 'fas fa-bars';
      }
    });

    // Close menu when clicking links
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navLinksContainer.classList.remove('active');
        mobileMenuBtn.querySelector('i').className = 'fas fa-bars';
      });
    });
  }

  // --- Theme Controller (Light/Dark Mode) ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  
  const getPreferredTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  // Initialize theme
  const currentTheme = getPreferredTheme();
  setTheme(currentTheme);

  themeToggleBtn.addEventListener('click', () => {
    const activeTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });

  // --- Reveal Animations (Intersection Observer) ---
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // --- Skill Bars Animation ---
  const skillBars = document.querySelectorAll('.skill-bar');
  const skillObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const width = bar.getAttribute('data-width') || '0%';
        bar.style.width = width;
        observer.unobserve(bar);
      }
    });
  }, {
    threshold: 0.5
  });

  skillBars.forEach(bar => skillObserver.observe(bar));

  // --- Accordion Setup (About Section Details) ---
  const accordions = document.querySelectorAll('.accordion-header');
  accordions.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');
      
      // Close all accordions in the wrapper
      item.parentElement.querySelectorAll('.accordion-item').forEach(accItem => {
        accItem.classList.remove('active');
        accItem.querySelector('.accordion-content').style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('active');
        const content = item.querySelector('.accordion-content');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

  // --- VAT & VDS/TDS Calculator ---
  const baseAmountInput = document.getElementById('calc-amount');
  const vatRateSelect = document.getElementById('calc-vat-rate');
  const tdsRateSelect = document.getElementById('calc-tds-rate');
  const isVdsCheckbox = document.getElementById('calc-vds');
  
  // Elements showing results
  const resBaseAmount = document.getElementById('res-base');
  const resVatAmount = document.getElementById('res-vat');
  const resTotalInvoice = document.getElementById('res-total');
  const resVdsDeducted = document.getElementById('res-vds');
  const resTdsDeducted = document.getElementById('res-tds');
  const resNetPayable = document.getElementById('res-payable');
  const resTreasuryVat = document.getElementById('res-treasury');

  // Stylistic check for visual styling on the checkbox card parent
  if (isVdsCheckbox) {
    isVdsCheckbox.addEventListener('change', () => {
      const label = isVdsCheckbox.closest('.checkbox-label');
      if (isVdsCheckbox.checked) {
        label.classList.add('checked');
      } else {
        label.classList.remove('checked');
      }
      calculateNbrValues();
    });
  }

  const formatCurrency = (val) => {
    return '৳ ' + val.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  };

  const calculateNbrValues = () => {
    const base = parseFloat(baseAmountInput.value) || 0;
    const vatRate = parseFloat(vatRateSelect.value) / 100 || 0;
    const tdsRate = parseFloat(tdsRateSelect.value) / 100 || 0;
    const applyVds = isVdsCheckbox ? isVdsCheckbox.checked : false;

    // Standard Bangladesh NBR Calculations
    const vatAmount = base * vatRate;
    const totalInvoice = base + vatAmount;
    
    // TDS is calculated on Base Amount (excluding VAT)
    const tdsDeducted = base * tdsRate;
    
    // VDS is the VAT amount deducted at source (usually 100% of VAT for specified transactions)
    const vdsDeducted = applyVds ? vatAmount : 0;
    
    // Net payable to supplier
    const netPayable = totalInvoice - vdsDeducted - tdsDeducted;
    
    // VAT deposited to Treasury
    // If VDS applies, the buyer deposits it. If not, the supplier deposits it.
    const treasuryVat = applyVds ? vatAmount : vatAmount;

    // Update UI
    resBaseAmount.textContent = formatCurrency(base);
    resVatAmount.textContent = formatCurrency(vatAmount);
    resTotalInvoice.textContent = formatCurrency(totalInvoice);
    resVdsDeducted.textContent = formatCurrency(vdsDeducted);
    resTdsDeducted.textContent = formatCurrency(tdsDeducted);
    resNetPayable.textContent = formatCurrency(netPayable);
    resTreasuryVat.textContent = formatCurrency(treasuryVat);
  };

  if (baseAmountInput) {
    baseAmountInput.addEventListener('input', calculateNbrValues);
    vatRateSelect.addEventListener('change', calculateNbrValues);
    tdsRateSelect.addEventListener('change', calculateNbrValues);
    
    // Run initial calculation
    calculateNbrValues();
  }

  // --- Contact Form Handling ---
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('form-name').value;
      const email = document.getElementById('form-email').value;
      const subject = document.getElementById('form-subject').value;
      const message = document.getElementById('form-message').value;

      if (!name || !email || !message) {
        alert('Please fill out all required fields.');
        return;
      }

      // Mock Form Submission Success
      formStatus.textContent = `Thank you, ${name}! Your message has been sent successfully. Rahatul will get back to you shortly.`;
      formStatus.className = 'form-status success';
      formStatus.style.display = 'block';

      // Clear the form
      contactForm.reset();
      
      // Auto-hide the message after 6 seconds
      setTimeout(() => {
        formStatus.style.display = 'none';
      }, 6000);
    });
  }
});
