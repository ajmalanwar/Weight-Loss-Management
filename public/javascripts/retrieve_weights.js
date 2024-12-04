document.addEventListener('DOMContentLoaded', () => {
    const calculateDifferenceButton = document.getElementById('calculateDifferenceButton');
    const resultDiv = document.getElementById('weightDifferenceResult');

    calculateDifferenceButton.addEventListener('click', async () => {
        const date1 = document.getElementById('date1').value;
        const date2 = document.getElementById('date2').value;

        if (!date1 || !date2) {
            resultDiv.textContent = 'Please select both dates.';
            return;
        }

        try {
            const response = await fetch('/weights/ajax/difference', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ date1, date2 }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch weight difference');
            }

            const data = await response.json();
            if (data.error) {
                resultDiv.textContent = data.error;
                resultDiv.style.display = 'block'; // Show the box for errors
            } else {
                resultDiv.innerHTML = `
                    <p><strong>Weight on ${date1}:</strong> ${data.weight1} kg</p>
                    <p><strong>Weight on ${date2}:</strong> ${data.weight2} kg</p>
                    <p><strong>Difference:</strong> ${data.difference} kg</p>
                `;
                resultDiv.style.display = 'block'; // Show the box with results
            }
        } catch (error) {
            console.error('Error:', error);
            resultDiv.textContent = 'An error occurred while calculating the weight difference.';
            resultDiv.style.display = 'block'; // Show the box for errors
        }
    });
});
