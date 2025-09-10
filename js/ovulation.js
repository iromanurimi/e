
        // Initialize AOS
        AOS.init({
            duration: 800,
            offset: 100,
            once: true
        });

        // Set current year in footer
        document.getElementById('year').textContent = new Date().getFullYear();

        // Mobile Menu Toggle
        const hamburger = document.getElementById('hamburger');
        const closeMenu = document.getElementById('close-menu');
        const mobileMenuContainer = document.getElementById('mobile-menu-container');
        const overlay = document.getElementById('overlay');

        hamburger.addEventListener('click', function() {
            mobileMenuContainer.classList.add('open');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        closeMenu.addEventListener('click', function() {
            mobileMenuContainer.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        overlay.addEventListener('click', function() {
            mobileMenuContainer.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.mobile-menu a').forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuContainer.classList.remove('open');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });



        // Close error message when button is clicked
        document.querySelector('.error-close-btn').addEventListener('click', function() {
            document.getElementById('error-message').style.display = 'none';
        });

        // Tooltip functionality
        const tooltips = document.querySelectorAll('.tooltip');
        tooltips.forEach(tooltip => {
            // For touch devices
            tooltip.addEventListener('touchstart', function(e) {
                e.preventDefault();
                tooltip.classList.add('active');
                setTimeout(() => tooltip.classList.remove('active'), 3000);
            });
            
            // For keyboard navigation
            tooltip.addEventListener('focus', function() {
                tooltip.classList.add('active');
            });
            
            tooltip.addEventListener('blur', function() {
                tooltip.classList.remove('active');
            });
        });

        // Ovulation Calculator Logic with Validation
        const calculateBtn = document.getElementById('calculate-btn');
        const resetBtn = document.getElementById('reset-btn');
        const resultsContainer = document.getElementById('results-container');
        const lastPeriodInput = document.getElementById('last-period');
        const cycleLengthSelect = document.getElementById('cycle-length');

        // Calendar Navigation Variables
        let currentMonth = new Date().getMonth();
        let currentYear = new Date().getFullYear();
        let ovulationDates = [];
        let fertileWindows = [];
        let cycleLength = 28;

        // Set default date to today
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize time
        const formattedDate = today.toISOString().split('T')[0];
        lastPeriodInput.value = formattedDate;

        // Validation functions
        function validateLastPeriod(date) {
            const lastPeriod = new Date(date);
            
            // Check if date is valid
            if (isNaN(lastPeriod.getTime())) {
                return {
                    isValid: false,
                    message: "Don Allah shigar da ranar haila ta ƙarshe da ta dace"
                };
            }
            
            // Check if date is in the future
            if (lastPeriod > today) {
                return {
                    isValid: false,
                    message: "Ranar haila ta ƙarshe ba za ta iya zama a nan gaba ba"
                };
            }
            
            // Check if date is too old (more than 1 year)
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            if (lastPeriod < oneYearAgo) {
                return {
                    isValid: false,
                    message: "Ranar haila ta ƙarshe ba ta wuce shekara 1 ba"
                };
            }
            
            return { isValid: true };
        }

        function validateCycleLength(length) {
            const cycleLength = parseInt(length);
            
            // Check if cycle length is within reasonable range
            if (cycleLength < 21 || cycleLength > 35) {
                return {
                    isValid: false,
                    message: "Zagayen al'ada dole ya kasance tsakanin kwanaki 21 zuwa 35"
                };
            }
            
            return { isValid: true };
        }

        function showError(message) {
            const errorElement = document.getElementById('error-message');
            const errorText = errorElement.querySelector('.error-text');
            errorText.textContent = message;
            errorElement.style.display = 'block';
            
            // Auto-hide error after 5 seconds
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }

        function clearErrors() {
            document.getElementById('error-message').style.display = 'none';
            document.getElementById('last-period-error').textContent = '';
            document.getElementById('cycle-length-error').textContent = '';
            lastPeriodInput.classList.remove('input-error');
            cycleLengthSelect.classList.remove('input-error');
        }

        function showLoading() {
            document.getElementById('loading-indicator').style.display = 'block';
        }

        function hideLoading() {
            document.getElementById('loading-indicator').style.display = 'none';
        }

        // Calculate ovulation and fertile window
        calculateBtn.addEventListener('click', function() {
            // Clear previous errors
            clearErrors();
            
            // Validate inputs
            const lastPeriodValidation = validateLastPeriod(lastPeriodInput.value);
            if (!lastPeriodValidation.isValid) {
                showError(lastPeriodValidation.message);
                lastPeriodInput.classList.add('input-error');
                document.getElementById('last-period-error').textContent = lastPeriodValidation.message;
                return;
            }
            
            const cycleLengthValidation = validateCycleLength(cycleLengthSelect.value);
            if (!cycleLengthValidation.isValid) {
                showError(cycleLengthValidation.message);
                cycleLengthSelect.classList.add('input-error');
                document.getElementById('cycle-length-error').textContent = cycleLengthValidation.message;
                return;
            }
            
            // Show loading state
            showLoading();
            const originalBtnText = calculateBtn.innerHTML;
            calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ana Lissafawa...';
            calculateBtn.disabled = true;
            
            // Allow UI to update before heavy calculations
            setTimeout(() => {
                const lastPeriod = new Date(lastPeriodInput.value);
                lastPeriod.setHours(0, 0, 0, 0); // Normalize time
                
                cycleLength = parseInt(cycleLengthSelect.value);
                
                // Calculate all future ovulation dates and fertile windows (6 months ahead)
                ovulationDates = [];
                fertileWindows = [];
                
                // Calculate for current cycle
                calculateCycleDates(lastPeriod, cycleLength);
                
                // Calculate for next 6 cycles
                let nextPeriod = new Date(lastPeriod);
                for (let i = 0; i < 6; i++) {
                    nextPeriod.setDate(nextPeriod.getDate() + cycleLength);
                    calculateCycleDates(nextPeriod, cycleLength);
                }
                
                // Update results display with current cycle dates
                const currentOvulation = ovulationDates[0];
                const currentFertileWindow = fertileWindows[0];
                const nextPeriodDate = new Date(lastPeriod.getTime() + cycleLength * 86400000);
                
                document.getElementById('next-period').textContent = formatDate(nextPeriodDate);
                document.getElementById('ovulation-day').textContent = formatDate(currentOvulation.date);
                document.getElementById('fertile-window').textContent = 
                    `${formatDate(currentFertileWindow.start)} - ${formatDate(currentFertileWindow.end)}`;
                document.getElementById('peak-fertility').textContent = formatDate(currentOvulation.date);
                
                // Calculate high fertility days (3 days before ovulation)
                const highFertilityStart = new Date(currentOvulation.date);
                highFertilityStart.setDate(highFertilityStart.getDate() - 3);
                document.getElementById('high-fertility').textContent = 
                    `${formatDate(highFertilityStart)} - ${formatDate(currentOvulation.date)}`;
                
                // Update pregnancy test information
                const testDate = new Date(nextPeriodDate);
                testDate.setDate(testDate.getDate() + 2); // Day after expected period
                document.getElementById('test-date-info').textContent = 
                    ` ${formatDate(testDate)}`;
                
                // Calculate cycle progress
                const daysPassed = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24));
                const percentComplete = Math.min(100, Math.round((daysPassed / cycleLength) * 100));
                
                // Update progress elements
                document.getElementById('cycle-progress-text').textContent = `${percentComplete}%`;
                
                // Update countdown to next period
                const daysRemaining = cycleLength - daysPassed;
                document.getElementById('period-countdown').textContent = 
                    `Akalla kwanaki ${daysRemaining} suka rage mi ki don sake ganin wani sabon jinin al'adar daga yau.`;
                
                // Update timeline marker
                document.querySelector('.timeline-marker').style.left = `${percentComplete}%`;
                document.querySelector('.marker-label').textContent = `Mako ${Math.floor(daysPassed/7)}`;
                
                // Show results
                resultsContainer.style.display = 'block';
                
                // Generate calendar for current month
                currentMonth = today.getMonth();
                currentYear = today.getFullYear();
                generateCalendar();
                
                // Restore button state
                calculateBtn.innerHTML = originalBtnText;
                calculateBtn.disabled = false;
                hideLoading();
                
                // Smooth scroll to results
                setTimeout(() => {
                    resultsContainer.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Add focus for better accessibility
                    resultsContainer.setAttribute('tabindex', '-1');
                    resultsContainer.focus();
                }, 100);
            }, 50);
        });

        // Calculate dates for one cycle
        function calculateCycleDates(periodStart, cycleDays) {
            const nextPeriod = new Date(periodStart);
            nextPeriod.setDate(nextPeriod.getDate() + cycleDays);
            
            // Calculate ovulation date (14 days before next period)
            const ovulationDate = new Date(nextPeriod);
            ovulationDate.setDate(ovulationDate.getDate() - 14);
            
            // Calculate fertile window (5 days before ovulation to 1 day after)
            const fertileStart = new Date(ovulationDate);
            fertileStart.setDate(fertileStart.getDate() - 5);
            
            const fertileEnd = new Date(ovulationDate);
            fertileEnd.setDate(fertileEnd.getDate() + 1);
            
            ovulationDates.push({
                date: ovulationDate,
                cycleStart: new Date(periodStart)
            });
            
            fertileWindows.push({
                start: fertileStart,
                end: fertileEnd,
                cycleStart: new Date(periodStart)
            });
        }

        // Reset calculator
        resetBtn.addEventListener('click', function() {
            lastPeriodInput.value = formattedDate;
            cycleLengthSelect.value = '28';
            resultsContainer.style.display = 'none';
            ovulationDates = [];
            fertileWindows = [];
            clearErrors();
            generateCalendar(); // Regenerate calendar without fertility markers
        });

        // Calendar Navigation
        document.getElementById('prev-month').addEventListener('click', function() {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            generateCalendar();
        });

        document.getElementById('next-month').addEventListener('click', function() {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            generateCalendar();
        });

        function updateCalendarHeader() {
            const monthNames = ["January", "February", "March", "April", "May", "June",
                              "July", "August", "September", "October", "November", "December"];
            document.getElementById('current-month').textContent = 
                `${monthNames[currentMonth]} ${currentYear}`;
        }

        function generateCalendar() {
            const calendarBody = document.getElementById('calendar-body');
            calendarBody.innerHTML = '';
            
            const firstDay = new Date(currentYear, currentMonth, 1);
            const lastDay = new Date(currentYear, currentMonth + 1, 0);
            const daysInMonth = lastDay.getDate();
            const startingDay = firstDay.getDay();
            
            let date = 1;
            
            // Create calendar rows
            for (let i = 0; i < 6; i++) {
                // Stop if we've gone through all days
                if (date > daysInMonth) break;
                
                const row = document.createElement('tr');
                
                // Create cells for each day of the week
                for (let j = 0; j < 7; j++) {
                    const cell = document.createElement('td');
                    
                    if (i === 0 && j < startingDay) {
                        // Empty cells before the first day of the month
                        cell.textContent = '';
                    } else if (date > daysInMonth) {
                        // Empty cells after the last day of the month
                        cell.textContent = '';
                    } else {
                        // Cells with dates
                        const daySpan = document.createElement('span');
                        daySpan.textContent = date;
                        cell.appendChild(daySpan);
                        
                        // Create date object for comparison
                        const currentDate = new Date(currentYear, currentMonth, date);
                        currentDate.setHours(0, 0, 0, 0);
                        
                        // Mark current day
                        if (currentDate.getTime() === today.getTime()) {
                            cell.classList.add('today');
                        }
                        
                        // Check if we have calculated fertility data
                        if (ovulationDates.length > 0) {
                            // Mark current cycle's fertile days
                            const currentFertileWindow = fertileWindows[0];
                            if (currentDate >= currentFertileWindow.start && currentDate <= currentFertileWindow.end) {
                                if (currentDate.getMonth() === currentMonth && currentDate.getFullYear() === currentYear) {
                                    // Check if this is the ovulation day
                                    const currentOvulation = ovulationDates[0];
                                    if (currentDate.getTime() === currentOvulation.date.getTime()) {
                                        cell.classList.add('ovulation-day');
                                    } else {
                                        cell.classList.add('fertile-day');
                                    }
                                }
                            }
                            
                            // Mark future cycles
                            for (let i = 1; i < ovulationDates.length; i++) {
                                const futureOvulation = ovulationDates[i];
                                const futureWindow = fertileWindows[i];
                                
                                // Mark future fertile days
                                if (currentDate >= futureWindow.start && currentDate <= futureWindow.end) {
                                    if (currentDate.getMonth() === currentMonth && currentDate.getFullYear() === currentYear) {
                                        // Check if this is the ovulation day
                                        if (currentDate.getTime() === futureOvulation.date.getTime()) {
                                            cell.classList.add('ovulation-day');
                                        } else {
                                            cell.classList.add('fertile-day');
                                        }
                                    }
                                }
                            }
                        }
                        
                        date++;
                    }
                    
                    row.appendChild(cell);
                }
                
                calendarBody.appendChild(row);
            }
            
            updateCalendarHeader();
        }

        // Format date as "dd Month, yyyy" (e.g., "16 July, 2025")
        function formatDate(date) {
            const monthNames = ["January", "February", "March", "April", "May", "June",
                              "July", "August", "September", "October", "November", "December"];
            const day = date.getDate();
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();
            return `${day} ${month}, ${year}`;
        }

        // Initialize calendar
        generateCalendar();

        // Add smooth scrolling to HTML element
        document.documentElement.style.scrollBehavior = 'smooth';
    
    