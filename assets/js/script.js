  document.addEventListener('DOMContentLoaded', function() {
      // DOM elements
      const errorDiv = document.getElementById('error');
      const resultDiv = document.getElementById('result');
      const copyBtn = document.getElementById('copyBtn');
      const calculateBtn = document.getElementById('calculateBtn');
      const saveBtn = document.getElementById('saveBtn');
      const yearsEl = document.getElementById('years');
      const monthsEl = document.getElementById('months');
      const daysEl = document.getElementById('days');
      const ageInDaysEl = document.getElementById('ageInDays');
      const ageInHoursEl = document.getElementById('ageInHours');
      const nextBirthdayEl = document.getElementById('nextBirthday');
      const zodiacSignEl = document.getElementById('zodiacSign');
      const historyList = document.getElementById('historyList');
      const tabs = document.querySelectorAll('.tab');
      const tabContents = document.querySelectorAll('.tab-content');
      
      // Initialize date pickers
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const dobPicker = flatpickr("#dob", {
        maxDate: todayStr,
        dateFormat: "Y-m-d",
        allowInput: false,
        defaultDate: new Date(today.getFullYear() - 25, today.getMonth(), today.getDate())
      });

      const currentPicker = flatpickr("#currentDate", {
        maxDate: todayStr,
        dateFormat: "Y-m-d",
        defaultDate: todayStr,
        allowInput: false
      });

      // Tab switching
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tabContents.forEach(c => c.classList.remove('active'));
          
          tab.classList.add('active');
          document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
        });
      });

      // Error handling
      function showError(message) {
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        errorDiv.style.display = 'block';
        resultDiv.classList.remove('active');
      }

      function clearError() {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
      }

      // Get zodiac sign
      function getZodiacSign(day, month) {
        const zodiac = [
          { sign: "Capricorn", start: [1, 1], end: [1, 19] },
          { sign: "Aquarius", start: [1, 20], end: [2, 18] },
          { sign: "Pisces", start: [2, 19], end: [3, 20] },
          { sign: "Aries", start: [3, 21], end: [4, 19] },
          { sign: "Taurus", start: [4, 20], end: [5, 20] },
          { sign: "Gemini", start: [5, 21], end: [6, 20] },
          { sign: "Cancer", start: [6, 21], end: [7, 22] },
          { sign: "Leo", start: [7, 23], end: [8, 22] },
          { sign: "Virgo", start: [8, 23], end: [9, 22] },
          { sign: "Libra", start: [9, 23], end: [10, 22] },
          { sign: "Scorpio", start: [10, 23], end: [11, 21] },
          { sign: "Sagittarius", start: [11, 22], end: [12, 21] },
          { sign: "Capricorn", start: [12, 22], end: [12, 31] }
        ];
        
        for (const z of zodiac) {
          if ((month === z.start[0] && day >= z.start[1]) || 
              (month === z.end[0] && day <= z.end[1])) {
            return z.sign;
          }
        }
        return "Unknown";
      }

      // Calculate next birthday
      function getNextBirthday(dob, current) {
        const dobDate = new Date(dob);
        const currentDate = new Date(current);
        
        const nextBirthday = new Date(
          currentDate.getFullYear(),
          dobDate.getMonth(),
          dobDate.getDate()
        );
        
        if (nextBirthday < currentDate) {
          nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
        }
        
        const diffTime = nextBirthday - currentDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
          date: nextBirthday.toLocaleDateString(),
          daysUntil: diffDays
        };
      }

      // Age calculation
      function calculateAge() {
        clearError();

        const dobValue = dobPicker.input.value;
        const currentValue = currentPicker.input.value;

        if (!dobValue) {
          showError('Please select your date of birth.');
          return;
        }

        if (!currentValue) {
          showError('Please select the current date.');
          return;
        }

        const dob = new Date(dobValue);
        const current = new Date(currentValue);

        if (dob > current) {
          showError('Date of birth cannot be in the future.');
          return;
        }

        // Calculate age in years, months, days
        let years = current.getFullYear() - dob.getFullYear();
        let months = current.getMonth() - dob.getMonth();
        let days = current.getDate() - dob.getDate();

        if (days < 0) {
          months--;
          const prevMonthLastDay = new Date(
            current.getFullYear(),
            current.getMonth(),
            0
          ).getDate();
          days += prevMonthLastDay;
        }

        if (months < 0) {
          years--;
          months += 12;
        }

        // Calculate total days and hours
        const diffTime = current - dob;
        const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const totalHours = Math.floor(diffTime / (1000 * 60 * 60));

        // Get next birthday info
        const nextBirthday = getNextBirthday(dobValue, currentValue);

        // Get zodiac sign
        const zodiacSign = getZodiacSign(dob.getDate(), dob.getMonth() + 1);

        // Update UI
        yearsEl.textContent = years;
        monthsEl.textContent = months;
        daysEl.textContent = days;
        ageInDaysEl.textContent = totalDays.toLocaleString();
        ageInHoursEl.textContent = totalHours.toLocaleString();
        nextBirthdayEl.textContent = `${nextBirthday.date} (in ${nextBirthday.daysUntil} days)`;
        zodiacSignEl.textContent = zodiacSign;
        resultDiv.classList.add('active');
        
        // Scroll to result if mobile
        if (window.innerWidth < 768) {
          resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }

      // Save calculation to history
      function saveToHistory() {
        if (!resultDiv.classList.contains('active')) {
          showError('No calculation to save. Please calculate an age first.');
          return;
        }

        const dobValue = dobPicker.input.value;
        const currentValue = currentPicker.input.value;
        const ageText = `${yearsEl.textContent}y ${monthsEl.textContent}m ${daysEl.textContent}d`;
        
        // Get existing history or initialize empty array
        const history = JSON.parse(localStorage.getItem('ageCalculatorHistory')) || [];
        
        // Add new entry
        history.unshift({
          dob: dobValue,
          currentDate: currentValue,
          age: ageText,
          timestamp: new Date().toISOString()
        });
        
        // Keep only last 10 entries
        if (history.length > 10) {
          history.pop();
        }
        
        // Save to localStorage
        localStorage.setItem('ageCalculatorHistory', JSON.stringify(history));
        
        // Update history display
        updateHistoryDisplay();
        
        // Show success message
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = `<i class="fas fa-check"></i> Saved!`;
        setTimeout(() => {
          saveBtn.innerHTML = originalText;
        }, 2000);
      }

      // Update history display
      function updateHistoryDisplay() {
        const history = JSON.parse(localStorage.getItem('ageCalculatorHistory')) || [];
        
        if (history.length === 0) {
          historyList.innerHTML = '<div class="no-history">No history yet. Calculate some ages first!</div>';
          return;
        }
        
        historyList.innerHTML = history.map(item => `
          <div class="history-item" data-dob="${item.dob}" data-current="${item.currentDate}">
            <div class="history-date">${new Date(item.timestamp).toLocaleString()}</div>
            <div class="history-age">Age: ${item.age}</div>
          </div>
        `).join('');
        
        // Add click handlers to history items
        document.querySelectorAll('.history-item').forEach(item => {
          item.addEventListener('click', () => {
            dobPicker.setDate(item.dataset.dob);
            currentPicker.setDate(item.dataset.current);
            calculateAge();
            
            // Switch back to calculator tab
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            document.querySelector('.tab[data-tab="calculator"]').classList.add('active');
            document.getElementById('calculator-tab').classList.add('active');
          });
        });
      }

      // Copy to clipboard
      copyBtn.addEventListener('click', function() {
        const years = yearsEl.textContent;
        const months = monthsEl.textContent;
        const days = daysEl.textContent;
        const textToCopy = `Age: ${years} years, ${months} months, ${days} days`;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
          copyBtn.innerHTML = `<i class="fas fa-check"></i> Copied!`;
          setTimeout(() => {
            copyBtn.innerHTML = `<i class="far fa-copy"></i> Copy`;
          }, 2000);
        });
      });

      // Calculate button event
      calculateBtn.addEventListener('click', calculateAge);
      
      // Save button event
      saveBtn.addEventListener('click', saveToHistory);
      
      // Also calculate when pressing Enter in date fields
      document.querySelectorAll('input[type="text"]').forEach(input => {
        input.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            calculateAge();
          }
        });
      });
      
      // Calendar icon click handlers
      document.getElementById('dob-icon').addEventListener('click', () => {
        dobPicker.open();
      });
      
      document.getElementById('currentDate-icon').addEventListener('click', () => {
        currentPicker.open();
      });
      
      // Load history on initial page load
      updateHistoryDisplay();
    });