document.addEventListener('DOMContentLoaded', async () => {
    const nameInput = document.getElementById('name');
    const studentInput = document.getElementById('student');
    const numbersContainer = document.getElementById('numbers-container');
    const form = document.getElementById('raffle-form');
    const message = document.getElementById('message');
  
    // Pre-fill student name from URL
    const params = new URLSearchParams(window.location.search);
    if (params.has('student')) {
      studentInput.value = params.get('student');
    }
  
    // Load available numbers
    const response = await fetch('/api/available-numbers');
    const data = await response.json();
  
    const allNumbers = Array.from({ length: 100 }, (_, i) => i + 1);
    const availableSet = new Set(data.available);
  
    const selectedNumbers = new Set();
  
    allNumbers.forEach(number => {
      const div = document.createElement('div');
      div.textContent = number;
      div.dataset.number = number;
  
      if (availableSet.has(number)) {
        div.classList.add('number-button');
      } else {
        div.classList.add('number-button', 'unavailable');
      }
  
      numbersContainer.appendChild(div);
    });
  
    numbersContainer.addEventListener('click', (e) => {
      const target = e.target;
      if (!target.classList.contains('number-button') || target.classList.contains('unavailable')) {
        return;
      }
  
      const num = parseInt(target.dataset.number, 10);
  
      if (selectedNumbers.has(num)) {
        selectedNumbers.delete(num);
        target.classList.remove('selected');
      } else {
        if (selectedNumbers.size >= 20) {
          alert('You can select up to 20 numbers.');
          return;
        }
        selectedNumbers.add(num);
        target.classList.add('selected');
      }
    });
  
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
      
        if (selectedNumbers.size === 0) {
          alert('Please select at least one number.');
          return;
        }
      
        const body = {
          name: nameInput.value.trim(),
          student: studentInput.value.trim(),
          numbers: Array.from(selectedNumbers)
        };
      
        const res = await fetch('/api/reserve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      
        if (res.ok) {
          message.textContent = 'Reservation successful!';
          form.reset();
          selectedNumbers.clear();
      
          // Refresh availability
          await refreshAvailability();
        } else {
          const err = await res.json();
          message.textContent = err.error || 'Error submitting.';
        }
      });
      
      async function refreshAvailability() {
        const response = await fetch('/api/available-numbers');
        const data = await response.json();
        const availableSet = new Set(data.available);
      
        document.querySelectorAll('.number-button').forEach(div => {
          const num = parseInt(div.dataset.number, 10);
      
          if (availableSet.has(num)) {
            div.classList.remove('unavailable', 'selected');
            div.classList.add('available');
          } else {
            div.classList.add('unavailable');
            div.classList.remove('selected');
          }
        });
      }
      
  });
  