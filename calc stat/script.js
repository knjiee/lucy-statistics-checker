function calculateValues() {
    let input = document.getElementById('numbers').value;
    let classInput = document.getElementById('class-intervals').value;
    let intervalMethod = document.getElementById('interval-option').value;

    let numbers = input.split(',').map(Number).sort((a, b) => a - b);

    if (numbers.length === 0 || numbers.some(isNaN)) {
        alert("Please enter valid numbers separated by commas.");
        return;
    }

    let numberOfData = numbers.length;

    // Display the number of data points
    document.getElementById('result-number-of-data').textContent = `Number of Data Points: ${numberOfData}`;

    let sum = numbers.reduce((a, b) => a + b, 0);
    let mean = sum / numbers.length;
    
    let meanCeil  = Math.ceil(mean);

    let varianceSum = 0;
    for (let num of numbers) {
        varianceSum += Math.pow((num - meanCeil), 2);
    }
    let populationVariance = varianceSum / numberOfData;

    let varianceSum2 = 0;
    for (let num of numbers) {
        varianceSum2 += Math.pow((num - mean), 2);
    }
    let populationVariance2 = varianceSum2 / numberOfData;
    // Display the Population Variance
    document.getElementById('result-population-variance').textContent = `Population Variance: ${populationVariance.toFixed(2)} or ${populationVariance2.toFixed(2)}`;    

    let populationStdDev = Math.sqrt(populationVariance);
    let populationStdDev2 = Math.round(populationStdDev);
    // Display the Population Standard Deviation
    document.getElementById('result-population-stddev').textContent = `Population Standard Deviation: ${populationStdDev.toFixed(2)} or  ${populationStdDev2.toFixed(2)}`;


    let min = Math.min(...numbers);
    let max = Math.max(...numbers);
    let midrange = (min + max) / 2;
    let range = max - min;

    let median;
    const midIndex = Math.floor(numbers.length / 2);
    if (numbers.length % 2 === 0) {
        median = (numbers[midIndex - 1] + numbers[midIndex]) / 2;
    } else {
        median = numbers[midIndex];
    }

    const frequencyMap = {};
    let mode = null;
    let maxCount = 0;
    for (let number of numbers) {
        frequencyMap[number] = (frequencyMap[number] || 0) + 1;
        if (frequencyMap[number] > maxCount) {
            maxCount = frequencyMap[number];
            mode = number;
        }
    }
    if (maxCount === 1) {
        mode = "No mode";
    }

    document.getElementById('result-mean').textContent = `Population Arithmetic Mean: ${mean.toFixed(2)}`;
    document.getElementById('result-midrange').textContent = `Midrange: ${midrange.toFixed(2)}`;
    document.getElementById('result-range').textContent = `Range: ${range.toFixed(2)}`;
    document.getElementById('result-median').textContent = `Median: ${median.toFixed(2)}`;
    document.getElementById('result-mode').textContent = `Mode: ${mode}`;

    let frequencyTable = [];
    let estimatedPopulationMeanValues = [];
    let totalFrequencyMarkProduct = 0;
    let cumulativeFrequency = 0;

    let medianClassIndex = -1;
    let cumulativeFreqBeforeMedian = 0;
    let classWidth = 0;
    let n = numbers.length;
    let modalClassIndex = -1;
    let totalFrequency = 0;
    let totalRelativeFrequency = 0;
    
    if (intervalMethod === 'manual') {
        let classIntervals = classInput.split(',').map(interval => interval.trim());
        for (let i = 0; i < classIntervals.length; i++) {
            let [lower, upper] = classIntervals[i].split('-').map(Number);
            let frequency = numbers.filter(num => num >= lower && num <= upper).length;
            let classMark = (lower + upper) / 2;
            cumulativeFrequency += frequency;
            frequencyTable.push({ lower, upper, frequency, classMark });

            totalFrequencyMarkProduct += frequency * classMark;
            estimatedPopulationMeanValues.push({ frequency, classMark, product: frequency * classMark });

            if (cumulativeFrequency >= n / 2 && medianClassIndex === -1) {
                medianClassIndex = i;
                cumulativeFreqBeforeMedian = cumulativeFrequency - frequency;
                classWidth = upper - lower + 1;
            }

            if (frequency > (frequencyTable[modalClassIndex]?.frequency || 0)) {
                modalClassIndex = i; // Track the index of the modal class
            }
        }
    } else {
        const k = Math.ceil(1 + 3.3 * Math.log10(numbers.length));
        classWidth = Math.ceil((max - min) / k);

        for (let i = 0; i < k; i++) {
            let lower = min + i * classWidth;
            let upper = lower + classWidth - 1;

            if (i === k - 1) {
                upper = max + (classWidth - 1);
            }

            let frequency = numbers.filter(num => num >= lower && num <= upper).length;
            let classMark = (lower + upper) / 2;
            totalFrequency += frequency;
            let relativeFrequency = (frequency / numbers.length) * 100;
        totalRelativeFrequency += relativeFrequency;
            cumulativeFrequency += frequency;
            frequencyTable.push({ lower, upper, frequency, classMark });

            totalFrequencyMarkProduct += frequency * classMark;
            estimatedPopulationMeanValues.push({ frequency, classMark, product: frequency * classMark });

            if (cumulativeFrequency >= n / 2 && medianClassIndex === -1) {
                medianClassIndex = i;
                cumulativeFreqBeforeMedian = cumulativeFrequency - frequency;
            }

            if (frequency > (frequencyTable[modalClassIndex]?.frequency || 0)) {
                modalClassIndex = i; // Track the index of the modal class
            }
        }
    }

    document.getElementById('result-class-width').textContent = `Class Width: ${classWidth}`;

    cumulativeFrequency = 0;
    frequencyTable.forEach((row, index) => {
        cumulativeFrequency += row.frequency;
        row.cumulativeFrequency = cumulativeFrequency;
        row.relativeFrequency = ((row.frequency / n) * 100).toFixed(2) + "%";
    });

    let tableBody = document.querySelector('#frequency-table tbody');
    tableBody.innerHTML = '';
    frequencyTable.forEach(row => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.lower}-${row.upper}</td>
            <td>${row.lower - 0.5} - ${row.upper + 0.5}</td>
            <td>${row.frequency}</td>
            <td>${row.classMark}</td>
            <td>${row.cumulativeFrequency}</td>
            <td>${row.relativeFrequency}</td>
        `;
        tableBody.appendChild(tr);
    });

    
 // Display the totals
 document.getElementById('total-frequency').textContent = totalFrequency;
 document.getElementById('total-rf').textContent = totalRelativeFrequency.toFixed(2) + '%';


    const estimatedPopulationMean = totalFrequencyMarkProduct / n;
    document.getElementById('result-population-mean').textContent = `Estimated Population Mean: ${estimatedPopulationMean.toFixed(2)}`;

    if (medianClassIndex !== -1) {
        let lb = frequencyTable[medianClassIndex].lower - 0.5;
        let f = frequencyTable[medianClassIndex].frequency;
        let estimatedPopulationMedian = lb + (((n / 2) - cumulativeFreqBeforeMedian) / f) * classWidth;

        document.getElementById('result-population-median').textContent = `Estimated Population Median: ${estimatedPopulationMedian.toFixed(2)}`;
    }

    if (modalClassIndex !== -1) {
        let lb = frequencyTable[modalClassIndex].lower - 0.5;
        let d1 = frequencyTable[modalClassIndex].frequency - (frequencyTable[modalClassIndex - 1]?.frequency || 0);
        let d2 = frequencyTable[modalClassIndex].frequency - (frequencyTable[modalClassIndex + 1]?.frequency || 0);
        let estimatedPopulationMode = lb + (d1 / (d1 + d2)) * classWidth;

        document.getElementById('result-population-mode').textContent = `Estimated Population Mode: ${estimatedPopulationMode.toFixed(2)}`;
    }

    let populationMeanTableBody = document.querySelector('#population-mean-table tbody');
    populationMeanTableBody.innerHTML = '';
    estimatedPopulationMeanValues.forEach(row => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.frequency}</td>
            <td>${row.classMark}</td>
            <td>${row.product}</td>
        `;
        populationMeanTableBody.appendChild(tr);
    });

    //mean deviation
    let totalMeanDeviation = 0;
    let meanDeviationTable = [];

    
    numbers.forEach(x => {
        let absDeviation = Math.abs(x - meanCeil); // |x - mean|
        totalMeanDeviation += absDeviation; // Summation of |x - mean|

        meanDeviationTable.push({
            dataPoint: x,
            absDeviation: absDeviation.toFixed(2),
        });
    });

    const meanDeviation = totalMeanDeviation / numbers.length;
    document.getElementById('result-mean-deviation').textContent = `Mean Deviation: ${meanDeviation.toFixed(2)}`;

    // Populate mean deviation table
    let meanDeviationTableBody = document.querySelector('#mean-deviation-table tbody');
    meanDeviationTableBody.innerHTML = ''; // Clear previous rows
    meanDeviationTable.forEach(row => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.dataPoint}</td>
            <td>${row.absDeviation}</td>
        `;
        meanDeviationTableBody.appendChild(tr);
    });

    let labels = Object.keys(frequencyMap); // The unique data points
    let frequencies = Object.values(frequencyMap); // Their respective frequencies

    // Create the bar chart using Chart.js
    let ctx = document.getElementById('dataChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Frequency of Data Points',
                data: frequencies,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

}
