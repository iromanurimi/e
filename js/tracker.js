
    // Complete Pregnancy Tracker Script (Optimized)
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize AOS animations
        AOS.init({
            duration: 800,
            offset: 100,
        });

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

        // Set current year in footer
        document.getElementById('year').textContent = new Date().getFullYear();

        // 1. SETUP DEFAULT DATES
        const today = new Date();
        const lastPeriodDefault = new Date(today);
        lastPeriodDefault.setDate(today.getDate() - 14); // Default to 2 weeks ago
        
        document.getElementById('last-period').valueAsDate = lastPeriodDefault;
        document.getElementById('due-date').valueAsDate = calculateDueDate(lastPeriodDefault);

        // 2. TOGGLE BETWEEN LMP AND EDD INPUTS
        document.getElementById('calculation-method').addEventListener('change', function() {
            if (this.value === 'lmp') {
                document.getElementById('lmp-input').style.display = 'block';
                document.getElementById('ed-input').style.display = 'none';
            } else {
                document.getElementById('lmp-input').style.display = 'none';
                document.getElementById('ed-input').style.display = 'block';
            }
        });

        // 3. CALCULATE BUTTON - MAIN FUNCTION
        document.getElementById('calculate-btn').addEventListener('click', function() {
            // Clear previous errors
            clearErrors();
            
            // Show loading spinner
            showLoading();
            this.disabled = true;
            
            // Small delay to show loading (better UX)
            setTimeout(() => {
                try {
                    const method = document.getElementById('calculation-method').value;
                    let dueDate;
                    let isPast38Weeks = false;
                    
                    // Validate input
                    if (method === 'lmp') {
                        const lmp = new Date(document.getElementById('last-period').value);
                        const error = validateLMP(lmp);
                        if (error) {
                            showError(error);
                            highlightInputError('last-period', error);
                            return;
                        }
                        dueDate = calculateDueDate(lmp);
                    } else {
                        dueDate = new Date(document.getElementById('due-date').value);
                        const error = validateEDD(dueDate);
                        if (error) {
                            showError(error);
                            highlightInputError('due-date', error);
                            return;
                        }
                        
                        // Check if EDD is past 38 weeks
                        const thirtyEightWeeksAgo = new Date();
                        thirtyEightWeeksAgo.setDate(thirtyEightWeeksAgo.getDate() - (38 * 7));
                        isPast38Weeks = dueDate < thirtyEightWeeksAgo;
                    }
                    
                    // Check if EDD has already passed
                    if (isEDDCompleted(dueDate)) {
                        showEDDCompletedMessage();
                    } else {
                        // Calculate and show results
                        updatePregnancyInfo(dueDate, isPast38Weeks);
                        document.getElementById('pregnancy-info').style.display = 'block';
                        document.getElementById('edd-completed-container').style.display = 'none';
                        
                        // Smooth scroll to results
                        document.getElementById('pregnancy-info').scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                    
                } catch (error) {
                    showError("An sami matsala a lokacin lissafin. Don Allah a sake gwadawa.");
                } finally {
                    // Hide loading spinner
                    hideLoading();
                    document.getElementById('calculate-btn').disabled = false;
                }
            }, 500);
        });

        // 4. RESET BUTTON
        document.getElementById('reset-btn').addEventListener('click', function() {
            document.getElementById('last-period').valueAsDate = lastPeriodDefault;
            document.getElementById('due-date').valueAsDate = calculateDueDate(lastPeriodDefault);
            document.getElementById('pregnancy-info').style.display = 'none';
            document.getElementById('error-message').style.display = 'none';
            document.getElementById('edd-completed-container').style.display = 'none';
            clearErrors();
        });

        // Contact doctor button
        document.getElementById('contact-doctor-btn').addEventListener('click', function() {
            alert("Don Allah a tuntuɓi likita ko asibiti mafi kusa domin karin bayani.");
        });

        // Close error message when button is clicked
        document.querySelector('.error-close-btn').addEventListener('click', function() {
            document.getElementById('error-message').style.display = 'none';
        });

        // Tab switching functionality
        document.querySelectorAll('.week-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                document.querySelectorAll('.week-tab').forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Hide all tab content
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                // Show the corresponding tab content
                const tabId = this.getAttribute('data-tab');
                document.getElementById(`${tabId}-content`).classList.add('active');
            });
        });

        // HELPER FUNCTIONS

        function calculateDueDate(lmpDate) {
            const dueDate = new Date(lmpDate);
            dueDate.setDate(dueDate.getDate() + 280); // 40 weeks
            return dueDate;
        }

        function validateLMP(lmpDate) {
            if (isNaN(lmpDate.getTime())) {
                return "Don Allah a shigar da ranar haila ta ƙarshe daidai";
            }
            if (lmpDate > new Date()) {
                return "Ranar haila ta ƙarshe ba zai yu ta zamo a nan gaba ba";
            }
            
            // Check if LMP is too old (>1 year)
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            if (lmpDate < oneYearAgo) {
                return "Ranar haila ta ƙarshe ba ta wuce shekara 1 ba";
            }
            
            return null;
        }

        function validateEDD(dueDate) {
            if (isNaN(dueDate.getTime())) {
                return "Don Allah shigar da ranar haihuwa daidai";
            }
            return null;
        }

        function isEDDCompleted(dueDate) {
            const today = new Date();
            // Set both dates to midnight for accurate comparison
            today.setHours(0, 0, 0, 0);
            dueDate.setHours(0, 0, 0, 0);
            
            // Check if due date is in the past
            return dueDate < today;
        }

        function showEDDCompletedMessage() {
            document.getElementById('pregnancy-info').style.display = 'none';
            document.getElementById('edd-completed-container').style.display = 'block';
            
            // Smooth scroll to message
            document.getElementById('edd-completed-container').scrollIntoView({
                behavior: 'smooth'
            });
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

        function highlightInputError(inputId, message) {
            const inputElement = document.getElementById(inputId);
            const errorElement = document.getElementById(inputId + '-error');
            
            inputElement.classList.add('input-error');
            errorElement.textContent = message;
        }

        function clearErrors() {
            document.getElementById('error-message').style.display = 'none';
            document.getElementById('last-period-error').textContent = '';
            document.getElementById('due-date-error').textContent = '';
            document.getElementById('last-period').classList.remove('input-error');
            document.getElementById('due-date').classList.remove('input-error');
        }

        function showLoading() {
            document.getElementById('loading-indicator').style.display = 'block';
        }

        function hideLoading() {
            document.getElementById('loading-indicator').style.display = 'none';
        }

        function updatePregnancyInfo(dueDate, isPast38Weeks = false) {
            const progress = calculatePregnancyProgress(dueDate);
            const weekData = babyDevelopmentData[progress.weeks] || {
                size: getFruitSize(progress.weeks),
                milestones: ["Babu bayanan ci gaban ciki a wannan mako"],
                healthTips: ["Ci gaba da kula da ciki na yau da kullun"],
                reminder: "Tuntuɓi mai kula da lafiyar ku",
                changes: ["Babu bayanan canje-canjen jiki a wannan mako"],
                problems: ["Babu bayanan matsaloli a wannan mako"]
            };

            // Calculate current month (1-9)
            const currentMonth = Math.min(9, Math.floor(progress.weeks / 4.345) + 1);
            
            // Update Due Date Card
            document.getElementById('due-date-display').textContent = formatHausaDate(dueDate);
            document.getElementById('days-remaining').textContent = 
                `Kwanki ${progress.daysRemaining} suka rage a cika EDD. Za a iya samun ragi ko karin makonni 2 akan EDD.`;
            
            // Update Progress Card
            document.getElementById('current-week').textContent = 
                `${progress.weekDisplay}, Kwana ${progress.days}`;
                
            document.getElementById('current-month').textContent = 
                `Wata na ${currentMonth}`;

            // Animate progress bar
            const progressFill = document.getElementById('progress-fill');
            progressFill.style.width = `0%`;
            setTimeout(() => {
                progressFill.style.width = `${progress.percentComplete}%`;
            }, 100);
            
            document.getElementById('progress-percent').textContent = `An ci kashi ${progress.percentComplete}% na goyon ciki`;
            document.getElementById('trimester-info').textContent = progress.trimester;
            
            // Update Circular Progress with animation
            const circumference = 2 * Math.PI * 52;
            const offset = circumference - (progress.percentComplete / 100) * circumference;
            const progressRing = document.querySelector('.progress-ring-fill');
            progressRing.style.strokeDashoffset = circumference;
            
            setTimeout(() => {
                progressRing.style.strokeDashoffset = offset;
            }, 100);
            
            document.getElementById('circular-progress-text').textContent = `${progress.percentComplete}%`;

            // Animate timeline marker
            const timelineMarker = document.querySelector('.timeline-marker');
            timelineMarker.style.transition = 'left 1s cubic-bezier(0.22, 0.61, 0.36, 1)';
            setTimeout(() => {
                timelineMarker.style.left = `${progress.percentComplete}%`;
            }, 100);

            // Hide baby tracker container if past 38 weeks with EDD method
            const babyTrackerContainer = document.querySelector('.baby-tracker-container');
            if (isPast38Weeks) {
                babyTrackerContainer.style.display = 'none';
                showError("Kun wuce makonni 38, babu ci gaban jariri da aza a iya nunawa");
            } else {
                babyTrackerContainer.style.display = 'block';
                
                // Update Baby Development Card
                const sizeComparison = document.querySelector('.size-comparison');
                if (sizeComparison) {
                    sizeComparison.textContent = `Girman ${weekData.size}`;
                }
                
                if (weekData.sizeImage) {
                    document.getElementById('baby-size-image').src = weekData.sizeImage;
                    document.getElementById('baby-size-image').alt = `Kwatancen girman jariri: ${weekData.size}`;
                }
                
                const milestonesList = document.getElementById('baby-milestones').querySelector('ul');
                milestonesList.innerHTML = '';
                weekData.milestones.forEach(milestone => {
                    const li = document.createElement('li');
                    li.textContent = milestone;
                    milestonesList.appendChild(li);
                });
            }

            // Update Health Tips Card
            const healthTipElement = document.getElementById('health-tip');
            if (weekData.healthTips) {
                healthTipElement.querySelector('p').textContent = Array.isArray(weekData.healthTips) ? 
                    weekData.healthTips.join(' ') : weekData.healthTips;
                healthTipElement.style.display = 'block';
            } else {
                healthTipElement.style.display = 'none';
            }
            
            const reminderElement = document.getElementById('reminder');
            if (weekData.reminder) {
                reminderElement.innerHTML = `<i class="fas fa-bell"></i> ${weekData.reminder}`;
                reminderElement.style.display = 'flex';
            } else {
                reminderElement.style.display = 'none';
            }
            
            // Update the new week details section
            updateWeekDetails(weekData, progress.weeks);
        }

        function updateWeekDetails(weekData, weekNumber) {
            // Update week number in the new section
            document.getElementById('current-week-number').textContent = weekNumber;
            
            // Update changes list
            const changesList = document.getElementById('changes-list');
            changesList.innerHTML = '';
            
            if (weekData.changes && weekData.changes.length > 0) {
                weekData.changes.forEach(change => {
                    const li = document.createElement('li');
                    li.textContent = change;
                    changesList.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = "Babu bayanan canje-canjen jiki a wannan mako";
                changesList.appendChild(li);
            }
            
            // Update problems list
            const problemsList = document.getElementById('problems-list');
            problemsList.innerHTML = '';
            
            if (weekData.problems && weekData.problems.length > 0) {
                weekData.problems.forEach(problem => {
                    const li = document.createElement('li');
                    li.textContent = problem;
                    problemsList.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = "Babu bayanan matsaloli a wannan mako";
                problemsList.appendChild(li);
            }
        }

        function calculatePregnancyProgress(dueDate) {
            const totalDays = 280; // 40 weeks
            const conceptionDate = new Date(dueDate);
            conceptionDate.setDate(conceptionDate.getDate() - totalDays);
            
            const today = new Date();
            let daysPassed = Math.floor((today - conceptionDate) / (1000 * 60 * 60 * 24));
            daysPassed = Math.max(0, daysPassed); // Ensure not negative
            
            // IMPROVED WEEK DISPLAY
            let weeks, weekDisplay;
            if (daysPassed < 7) {
                weeks = 0;
                weekDisplay = "Mako 0";
            } else {
                weeks = Math.min(40, Math.floor(daysPassed / 7));
                weekDisplay = weeks === 1 ? "Mako 1" : `Mako ${weeks}`;
            }
            
            const days = daysPassed % 7;
            const daysRemaining = Math.max(0, Math.floor((dueDate - today) / (1000 * 60 * 60 * 24)));
            const percentComplete = Math.min(100, Math.round((daysPassed / totalDays) * 100));
            
            // Determine trimester in Hausa
            let trimester;
            if (weeks < 13) trimester = "Zango na 1 (Makonni 1-12)";
            else if (weeks < 28) trimester = "Zango na 2 (Makonni 13-27)";
            else trimester = "Zango na 3 (Makonni 28-40)";
            
            return {
                weeks,
                days,
                weekDisplay,
                percentComplete,
                daysRemaining,
                trimester
            };
        }

        function formatHausaDate(date) {
            const monthNames = [
                "January", "February", "March", "April", "May", "June",
                              "July", "August", "September", "October", "November", "December"
                            ];
            return `${date.getDate()} ${monthNames[date.getMonth()]}, ${date.getFullYear()}`;
        }

        function getFruitSize(week) {
            const sizes = {
                4: 'irin Poppy', 5: 'irin Sesame', 6: 'irin Lentil', 7: 'irin Blueberry', 
                8: 'irin Rasberi', 9: 'irin Cherry', 10: 'irin Strawberry', 11: 'irin Lime', 
                12: 'irin Plum', 13: 'irin Peach', 14: 'irin Lemon', 15: 'irin Apple', 
                16: 'irin Avocado', 17: 'irin Pear', 18: 'irin Bell Pepper', 19: 'irin Tomato', 
                20: 'irin Ayaba', 21: 'irin Karas', 22: 'irin Spaghetti Squash', 23: 'irin Grapefruit',
                24: 'irin Masara', 25: 'irin Rutabaga', 26: 'irin Scallion', 27: 'irin Cauliflower',
                28: 'irin Gauta', 29: 'irin Butternut Squash', 30: 'irin Cabbage', 31: 'irin Coconut',
                32: 'irin Jicama', 33: 'irin Pineapple', 34: 'irin Melon', 35: 'irin Honeydew',
                36: 'irin Lettuce', 37: 'irin Swiss Chard', 38: 'irin Leek', 39: 'irin Mini Watermelon',
                40: 'irin Kabewa'
            };
            return sizes[week] || 'irin Watermelon';
        }

        // Baby Development Data (for all 40 weeks) - Expanded with changes and problems
        const babyDevelopmentData = {
           1: { 
            size: "Babu Embryo a yanzu!", 
            sizeImage: "images/1.jpg", 
            milestones: [
                "Babu maganar ciki a halin yanzu.",
                "Yanzu kina cikin jinin al'ada ne.",
                "Ovulation zai faru nan da makonni 2 ko 3 masu zuwa insha Allahu.",
                "Likitoci na fara lissafin samun ciki ne daga ranar farko ta jinin al'ada ta karshe (LMP)."
                
            ],
            healthTips: [
                "Likitoci na bada shawarar fara shan folic acid don rage hadarin lahani ga jariri,",
                "dakatar da shan barasa da sigari," ,
                "cin lafiyayyen abinci," ,
                "da gwajin lafiyar jiki domin tabbatar da lafiyar jiki da mahaifa."
            ],
            reminder: "A tabbatar an fara shan folic acid daga yau tare da rubuta wannan rana da aka fara al'ada saboda nan gaba!",
            changes: [
                "Ba a samu wani canji a jiki a wannan makon ba",
                "Jiki yana shirye-shiryen fitar da kwai (ovulation)"
            ],
            problems: [
                "Babu wata matsala ta musamman a wannan makon"
            ]
        },
        2: { 
            size: "Babu Embryo har yanzu!", 
            sizeImage: "images/2.jpg", 
            milestones: [
                "Babu ciki har yanzu!",
                "Amma jiki ya fara shirye-shiryen fitar da kwan haihuwa (Ovulation)",
                "Wannan shine makon da yawanci kwai (Ovulation) yake fita."
            ],
            healthTips: [
                "Fara shan folic acid idan ba a fara ba.",
                "A fara kula da alamomin Ovulation daga yanzu.",
                "A kula da cin lafiyayyen abinci, musamman 'ya'yan itatuwa, ganyayyaki, hatsi da sauransu.",
                "A Kumaa dakatar da shan barasa da sigari."
            ],
            reminder: 'Yi amfani da kalkuletar ovulation domin gano lokacin zuwan kwan haihuwa.',
            changes: [
                "Zafi a cikin jiki na iya zama alama ce ta ovulation",
                "Ciwon ciki ko kumburin ciki na iya faruwa"
            ],
            problems: [
                "Rashin samun ciki idan kwai bai hadu da maniyyi ba"
            ]
        },
        3: { 
            size: "Irin Poppy", 
            sizeImage: "images/3.jpg", 
            milestones: [
                "Babu wata bayananniyar alama ta daukar ciki har yanzu!",
                "A wannan makon maniyyi yake haduwa da kwai kuma su samar da zygote.",
                "Sannan zygote zai fara raba kansa zuwa sel masu yawa (cleavage stage)",
                "Zygote zai gangara daga bututun fallopian zuwa mahaifa domin dasa kansa (implanting)"
            ],
            healthTips: [
                "A ci gaba da shan folic acid a kullum.",
                "A nisanci matsanancin motsa jiki ko damuwa.",
                "A guji shan wasu magunguna ba tare da shawarar likita ba.",
                "dakatar da shan barasa da sigari"
            ],
            reminder:"Fara shan Folic Acid idan ba a fara ba, sannan ke rage yawan shan caffeine.",
            changes: [
                "Babu wani canji na zahiri a jiki",
                "Wasu mata na iya jin zafi ko kumburi a nono"
            ],
            problems: [
                "Rashin samun ciki idan dasawar bai yi nasara ba"
            ]
        },
        4: { 
            size: "Irin Poppy", 
            sizeImage: "images/4.jpg", 
            milestones: [
                "A yanzu ciki ya samu!",
                "Blastocyst ya makale a cikin jikin bangon mahaifa.",
                "Jiki ya fara samar da hormone din hCG wanda yake hana zuwan al'ada.",
                "Jakar ruwan mahaifa (amniotic sac) da mabiya (placenta) sun fara girma."
            ],
            healthTips: [
                "Yin gwajin ciki - idan baki ga al'adarki ba.",
                "Ci gaba da shan folic acid, da cin abinci mai dauke da sinadarin iron, calcium da DHA.",
                "Ki dinga yin bacci da wuri, sannan ki dinga motsa jiki mara wahala.",
                "Kada ki dinga cin nama, kifi ko kwai da bai dahu sosai ba. Haka kuma ki rage shan sinadarin caffeine."
            ],
            reminder: "Ki yi gwajin ciki dinki a gida - musamman idan  baki ga jinin al'adar ba. Idan gwaji ya nuna akwai ciki, Ki ziyarci asibiti domin tabbatar da lafiyarsa tare da yin rajistar zuwa awo (ANC). ",
            changes: [
                "Jinin al'ada na iya rasa",
                "Zafi a cikin jiki ko tashin hankali",
                "Gajiya da bacci mai yawa",
                "Amai ko tashin zuciya"
            ],
            problems: [
                "Zubar da ciki (miscarriage) - wanda zai iya faruwa a farkon makonnan ciki",
                "Ciki na ectopic - lokacin da ciki ya makale a wani wuri banda mahaifa"
            ]
        },
        5: { 
            size: "Girmansa kamar girman  irin tuffa (apple)", 
            sizeImage: "images/5.jpg", 
            milestones: [
                "Ana kiransa da dan tayi (embrayo)!",
                "Neural Tube ya fara samuwa - wanda daga bisani zai zama kwakwalwa da kashin baya.",
                "Zuciya tana fara samuwa.",
                "Sinadarin hormone na hCG na karuwa - wanda shi yake haddasa mafi yawan alamomin farko na shigar ciki."
            ],
            healthTips: [
                " A ci gaba da shan folic acid (akalla 400 zuwa 600 mcg a kowace rana)",
                " Cin abinci kadan kadan lokaci bayan lokaci don rage yawan amai da inganta narkar da abinci.",
                " A guji shan giya, shan taba, yawan shan caffeine (kada ya wuce 200 mg a kullum).",
                " Yawaita shan ruwa don ingata zagayawar jini.",
                " Ki nisanci shakar warin fenti ko maganin kwari.",
                "Kada ki dinga cin nama, kifi ko kwai da bai dahu sosai ba. Ko madarar nonon dabbobi da ba a tafasa ba"
            ],
            reminder: "Idan kin tabbatar kina da ciki, kije ki ga likita domin duba lafiyar ciki, tare da yin rajistar zuwa awo (anc).",
            changes: [
                "Amai da tashin zuciya na iya karuwa",
                "Gajiya da rashin kuzari",
                "Zafi a cikin nono",
                "Yin fitsari akai-akai"
            ],
            problems: [
                "Hyperemesis gravidarum - matsanancin amai wanda zai iya haifar da rashin lafiya",
                "Zubar da ciki a wannan makon yana da wuya amma yana iya faruwa"
            ]
        },
        24: { 
            size: "irin Masara", 
            sizeImage: "images/24.jpg", 
            milestones: [
                "Jariri yana da kusan 30 cm tsayi",
                "Fata ta fara zama mai kauri",
                "Jariri yana iya ji da amsa sauti",
                "Idanu suna buɗewa"
            ],
            healthTips: [
                "Ci abinci mai gina jiki don tallafawa girma",
                "Yi awo akai-akai don duba matsin jini da kuma sinadarin sukari",
                "Yi motsa jiki mai sauƙi kamar tafiya",
                "Sha ruwa mai yawa"
            ],
            reminder: "Lokacin yin gwajin glucose don duba ciwon sukari na ciki",
            changes: [
                "Ciki yana ƙara girma sosai",
                "Za ka iya fara jin matsi a ƙirji da ciki",
                "Zaɓi na iya farawa (Braxton Hicks contractions)",
                "Fata na iya ƙara zama mai laushi"
            ],
            problems: [
                "Ciwon baya saboda nauyin ciki",
                "Matakin ƙarfe na jini ƙasa (anemia)",
                "Matsin jini na iya tashi",
                "Ciwon kafa da ƙuraje"
            ]
        }
        };
    });

