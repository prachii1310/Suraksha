document.addEventListener("DOMContentLoaded", () => {

   
    let users = JSON.parse(localStorage.getItem('surakshaUsers')) || {};
    let reports = JSON.parse(localStorage.getItem('surakshaReports')) || {};
    let counselors = JSON.parse(localStorage.getItem('surakshaCounselors')) || [
        { id: 1, name: 'Priya Sharma' },
        { id: 2, name: 'Rohan Verma' },
        { id: 3, name: 'Anjali Mehta' }
    ];
    localStorage.setItem('surakshaCounselors', JSON.stringify(counselors));

    if (!users['admin@suraksha.com']) {
        users['admin@suraksha.com'] = {
            name: 'Admin',
            password: 'adminpassword',
            role: 'admin'
        };
        localStorage.setItem('surakshaUsers', JSON.stringify(users));
    }


    if (Object.keys(reports).length === 0) {
        reports['#83451'] = {
            id: '#83451',
            date: 'Aug 02, 2025',
            description: 'This is a sample report detailing an incident of online harassment.',
            status: 'Pending',
            counselor: 'N/A'
        };
        localStorage.setItem('surakshaReports', JSON.stringify(reports));
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorElement = document.getElementById('login-error');
            const user = users[email];

            if (user && user.password === password) {
                sessionStorage.setItem('loggedInUserName', user.name);
                if (user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            } else {
                errorElement.textContent = 'Incorrect email or password.';
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const role = document.getElementById('register-role').value;
            const errorElement = document.getElementById('register-error');

            if (password !== confirmPassword) {
                errorElement.textContent = 'Passwords do not match.'; return;
            }
            if (password.length < 8) {
                errorElement.textContent = 'Password must be at least 8 characters long.'; return;
            }
            if (users[email]) {
                errorElement.textContent = 'An account with this email already exists.'; return;
            }

            users[email] = { name, password, role };
            localStorage.setItem('surakshaUsers', JSON.stringify(users));
            alert('Registration successful! Redirecting to login page.');
            window.location.href = 'login.html';
        });
    }

    // --- 3. REPORT SUBMISSION LOGIC ---
    const handleReportSubmission = (formElement) => {
        if (!formElement) return;
        formElement.addEventListener('submit', (e) => {
            e.preventDefault();
            const description = formElement.querySelector('textarea').value;
            if (!description) {
                alert('Please provide a description of the incident.');
                return;
            }
            const newId = `#${Math.floor(10000 + Math.random() * 90000)}`;
            reports[newId] = {
                id: newId,
                date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                description: description,
                status: 'Pending',
                counselor: 'N/A'
            };
            localStorage.setItem('surakshaReports', JSON.stringify(reports));
            alert("Report submitted successfully! Your Report ID is " + newId);
            formElement.reset();
            const modal = document.getElementById('report-modal');
            if (modal) modal.style.display = 'none';
        });
    };
    handleReportSubmission(document.getElementById("reportForm"));
    handleReportSubmission(document.getElementById("reportFormModal"));
    
    // --- 4. ADMIN DASHBOARD LOGIC ---
    const adminTableBody = document.querySelector('#admin-reports-table tbody');
    if (adminTableBody) {
        const loadReports = () => {
            adminTableBody.innerHTML = '';
            const sortedReports = Object.values(reports).reverse();
            if (sortedReports.length === 0) {
                adminTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No reports found.</td></tr>`;
                return;
            }
            sortedReports.forEach(report => {
                const row = document.createElement('tr');
                const actionText = report.status === 'Pending' ? 'Review' : 'View Details';
                row.innerHTML = `
                    <td>${report.id}</td>
                    <td>${report.date}</td>
                    <td><span class="status ${report.status.toLowerCase()}">${report.status}</span></td>
                    <td>${report.counselor}</td>
                    <td><a href="admin-report-view.html?id=${encodeURIComponent(report.id)}" class="btn-tertiary">${actionText}</a></td>
                `;
                adminTableBody.appendChild(row);
            });
        };
        loadReports();
    }

    const assignCounselorForm = document.getElementById('assign-counselor-form');
    if (assignCounselorForm) {
        const urlParams = new URLSearchParams(window.location.search);
        const reportId = urlParams.get('id');
        const report = reports[reportId];
        const counselorSelect = document.getElementById('counselor-select');

        if (report) {
            // Populate report details
            document.getElementById('report-title').textContent = `Details for Report ${report.id}`;
            document.getElementById('detail-report-id').textContent = report.id;
            document.getElementById('detail-report-date').textContent = report.date;
            const statusEl = document.getElementById('detail-report-status');
            statusEl.textContent = report.status;
            statusEl.className = `status ${report.status.toLowerCase()}`;
            document.getElementById('detail-report-counselor').textContent = report.counselor;
            document.getElementById('detail-report-description').textContent = report.description;
            
            // Populate counselor dropdown
            counselorSelect.innerHTML = '<option value="">-- Select a Counselor to Assign --</option>';
            counselors.forEach(c => {
                const isSelected = c.name === report.counselor ? 'selected' : '';
                counselorSelect.innerHTML += `<option value="${c.name}" ${isSelected}>${c.name}</option>`;
            });

            // Handle form submission
            assignCounselorForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const selectedCounselor = counselorSelect.value;
                if (selectedCounselor) {
                    reports[reportId].counselor = selectedCounselor;
                    reports[reportId].status = 'Assigned';
                    localStorage.setItem('surakshaReports', JSON.stringify(reports));
                    alert(`Report ${reportId} has been assigned to ${selectedCounselor}.`);
                    location.reload(); // Reload to show updated details
                } else {
                    alert('Please select a counselor to assign.');
                }
            });
        }
    }

    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage) {
        const loggedInUserName = sessionStorage.getItem('loggedInUserName');
        if (loggedInUserName) {
            welcomeMessage.textContent = `Welcome back, ${loggedInUserName}!`;
        }
    }
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('loggedInUserName');
            window.location.href = 'index.html';
        });
    }
 const teamData = {
        prachi: {
            name: 'Prachi',
            role: 'Founder & Lead Developer',
            bio: 'With a background in software engineering and a passion for social justice, Prachi built the Suraksha platform to provide a secure, technological solution to the problem of underreported abuse.',
            photo: 'https://picsum.photos/seed/prachi-new-photo/200'
        },
        prabhrehmat: {
            name: 'Prabhrehmat',
            role: 'Community Outreach Lead (Punjab)',
            bio: 'Prabhrehmat builds and maintains our network of trusted local NGOs and support groups in Punjab, ensuring that every report is directed to professionals who can provide real-world help.',
            photo: 'https://picsum.photos/seed/rehmat/200'
        },
        palak: {
            name: 'Palak',
            role: 'Survivor Support & Counselor Coordinator',
            bio: 'As the primary liaison for our users, Palak ensures that survivors are compassionately and efficiently connected with the right counselors, guiding them through the first steps of the support process.',
            photo: 'https://picsum.photos/seed/palak/200'
        }
    };
    const thumbnails = document.querySelectorAll('.thumbnail');
    if (thumbnails.length > 0) {
        const memberPhoto = document.getElementById('team-member-photo');
        const memberName = document.getElementById('team-member-name');
        const memberRole = document.getElementById('team-member-role');
        const memberBio = document.getElementById('team-member-bio');
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', () => {
                thumbnails.forEach(t => t.classList.remove('active'));
                thumbnail.classList.add('active');
                const member = teamData[thumbnail.dataset.member];
                if (member) {
                    memberPhoto.src = member.photo;
                    memberName.textContent = member.name;
                    memberRole.textContent = member.role;
                    memberBio.textContent = member.bio;
                }
            });
        });
    }

    // --- 7. HOMEPAGE ANIMATIONS & MODAL ---
    const typedElement = document.getElementById('typed-strings');
    if (typedElement) {
        new Typed('#typed-strings', {
            strings: ['Confidential.', 'Secure.', 'Supportive.'],
            typeSpeed: 70,
            backSpeed: 50,
            backDelay: 2000,
            loop: true,
            smartBackspace: true,
        });
    }
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el));
    const impactSection = document.getElementById('impact-section');
    if (impactSection) {
        const counters = document.querySelectorAll('.counter');
        let hasCounterAnimated = false;
        const countUp = () => {
            if (hasCounterAnimated) return;
            counters.forEach(counter => {
                counter.innerText = '0';
                const target = +counter.getAttribute('data-target');
                const duration = 2000;
                const increment = target / (duration / 10);
                const updateCount = () => {
                    const current = +counter.innerText;
                    if (current < target) {
                        counter.innerText = `${Math.ceil(current + increment)}`;
                        setTimeout(updateCount, 10);
                    } else {
                        counter.innerText = target;
                    }
                };
                updateCount();
            });
            hasCounterAnimated = true;
        };
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    countUp();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        counterObserver.observe(impactSection);
    }

const reportModal = document.getElementById('report-modal');
const openModalBtn = document.getElementById('open-report-modal-btn');
if (reportModal && openModalBtn) {
    const closeModalBtn = document.querySelector('#report-modal .modal-close-btn');

    const openModal = () => { reportModal.style.display = 'flex'; };
    const closeModal = () => { reportModal.style.display = 'none'; };

    openModalBtn.addEventListener('click', () => {
       
        const loggedInUserName = sessionStorage.getItem('loggedInUserName');

        if (loggedInUserName) {
           
            openModal();
        } else {
            window.location.href = 'login.html';
        }
    });

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    window.addEventListener('click', (event) => {
        if (event.target === reportModal) {
            closeModal();
        }
    });
}
});