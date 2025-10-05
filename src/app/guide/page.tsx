"use client";

export default function GuidePage() {
  return (
    <main className="p-10 flex justify-center">
      {/* Glassmorphic Container */}
      <div className="bg-[#0f172a]/50 backdrop-blur-sm rounded-2xl shadow-lg p-10 w-full space-y-6 text-gray-100">
        <h1 className="text-4xl font-bold mb-6 text-white drop-shadow-lg">
          Navigation Guide
        </h1>
        <p className="text-lg leading-relaxed">
          This page explains how to navigate through the NSAC App, upload CSVs, 
          visualize rover data, and interpret telemetry results.
        </p>
        <br />
          <h1 className="text-2xl font-bold mb-6 text-white drop-shadow-lg">What is the problem statement?</h1>
        <p className="text-lg leading-relaxed">
          Space missions rely on sophisticated scientific instruments aboard rovers like Curiosity and Perseverance. These instruments face extreme conditions including temperature swings from -125°C to 20°C. 
The challenge lies in analyzing detecting subtle degradation patterns, and predicting when instruments might fail or require calibration. Traditional approaches lack sophisticated statistical analysis capabilities needed for accurate health assessment. <br /> <br />
        Rover Instrument Quality Analysis and Lifespan Prediction serves: <br />
        (A) To detect when an instrument deviates from expected performance, indicating possible calibration needs.
        <br />
        (B) To estimate the instrument’s remaining lifespan by projecting current performance trends.
        </p>
        <h1 className="text-2xl font-bold mb-6 text-white drop-shadow-lg">
          What is Rover Data?
        </h1>
        <p className="text-lg leading-relaxed">The telemetry sent by the Perseverance rover from Mars to the ground stations on Earth, is our <b>Rover Data.</b>
        Thousands of such telemetry are archived collectively on a public database called <a href="https://pds.nasa.gov/" className="text-green-500">Planetary Data System</a>, and this database is maintained by NASA.
        </p>
        <h1 className="text-2xl font-bold mb-6 text-white drop-shadow-lg">
          Why do we choose to study MEDA?
        </h1>
        <p className="text-lg leading-relaxed">MEDA is a suite of weather sensors providing continuous measurements of temperature, humidity, wind speed, pressure, and dust properties. While Perseverance carries a diverse suite of instruments, our study emphasizes MEDA (Mars Environmental Dynamics Analyzer) because of its uniquely comprehensive and continuous stream of environmental data. Its datasets are extensive, structured, and highly relevant to both surface operations and long-term habitability assessments, making MEDA an ideal candidate for detailed analysis.
        </p>
      
         <h1 className="text-2xl font-bold mb-6 text-white drop-shadow-lg">
          Accessing the Rover Data
        </h1>
        <p className="text-lg leading-relaxed"><a className="text-green-500" href="https://pds-atmospheres.nmsu.edu/data_and_services/atmospheres_data/PERSEVERANCE/meda.html">Mars 2020 Perseverance Archive</a> is easily accessible from the PDS website. Select an index for a particular <a className="text-green-500" href="https://pds-atmospheres.nmsu.edu/data_and_services/atmospheres_data/PERSEVERANCE/logs/MARS2020_MEDA_ENG_Calibrated_Del13.htm">sol (Martian Day)</a> of which you need to check for anomalies and check if any calibrations are needed, then download that data. For the ease of navigation, the latest telemetry is available on our <a className="text-green-500" href="/engineering.csv">GitHub</a>. We focus on engineering csv data to understand the performance of rover instruments, rather than accessing the direct data captured by the instruments.
        </p>
        <img src="/engineering-csv-screenshot.png" alt="" />
        <h1 className="text-2xl font-bold mb-6 text-white drop-shadow-lg">
          Upload the data
        </h1>
        <p className="text-lg leading-relaxed">Click "Add Rover Data" button, then upload the csv dataset on this website. Now the system will calculate the anomalies, performance, Grubbs test, Z-score results, Lifespan prediction and calibrations if needed.
        </p>
        
        <img src="/upload-screenshot.png" alt="" />
        <h1 className="text-2xl font-bold mb-6 text-white drop-shadow-lg">
          Statistical Methods
        </h1>
        <h2 className="text-xl font-bold mb-6 text-white drop-shadow-lg"> Z-score method</h2>
        <p className="text-lg leading-relaxed">The Z-score tells how far a data point is from the mean of a dataset — measured in standard deviations.
If a point lies too far from the mean, it’s considered an anomaly (outlier).
</p>
<img src="/z-score-screenshot.png" alt="" />
<p className="text-lg leading-relaxed"><b>Detecting Anomalies</b><br />
    If |zᵢ| is greater than threshold, this is an anomaly. Typical threshold = 3.0 (means  greater than 3σ away from mean).
We can tune it to 2.5 or 3.5 depending on data sensitivity.
An Example of z-score prediction -
A sample of 30 datasets from the engineering.csv is used here.
</p>
<img src="/z-score-example.png" alt="" />

<h2 className="text-xl font-bold mb-6 text-white drop-shadow-lg">Grubbs Test</h2>
<p className="text-lg leading-relaxed">The Grubbs test is a formal statistical hypothesis test designed to detect a single outlier in a normally distributed dataset.
It tests whether the largest or smallest value in the dataset is too far from the rest.
</p>
<img src="/grubbs-test-screenshot.png" alt="" />
<p className="text-lg leading-relaxed">Works only if data ≈ normally distributed. Detects one anomaly at a time, unlike Z-score (which flags many at once).
More statistically rigorous than Z-score (it tests hypothesis). <br />
In Practice:
Z-score is fast scan for all anomalies.
Grubbs can confirm statistically if a point is truly anomalous. <br />
An example of Grubbs test Anomaly prediction :
Same set of 30 values is used here.
</p>
<img src="/grubbs-example.png" alt="" />

    <h2 className="text-xl font-bold mb-6 text-white drop-shadow-lg">Calibration</h2>
    <p className="text-lg leading-relaxed">Calibration means adjusting the instrument so its readings stay close to the true or reference values.
When data shows systematic drift or bias, calibration is required. Mathematical Indicators of Calibration Need
Let: <br />
Xi​ = measured values (from instrument) <br />
Yi​ = reference or expected values <br />
A. Mean Offset (Bias) <br />
Bias=xˉ−yˉ
If Bias ≠ 0 then instrument is systematically off and it needs recalibration. <br />
B. Standard Deviation Increase <br />
If σ (variation) grows over time, it means  measurement precision decreasing, so noise so possible recalibration.
<br /> <br />
These are the mathematical logic behind the Anomaly prediction and calibration requirement. This logic can be implemented into code with the help of JavaScript libraries like Plotly.js (Scientific, 3D, and time-series visualization (perfect for rover data)) and PapaParse.js (for CSV handling). These tools converts built-in mathematical ways into visualization.
</p>
<h2 className="text-xl font-bold mb-6 text-white drop-shadow-lg">Lifespan Prediction</h2>
<p className="text-lg leading-relaxed">We take the most recent set of telemetry readings (for example, the last 50 data points of a sensor column) and fit a linear extrapolation model on them. This model looks at the trend of the last values, whether the parameter is rising, falling, or staying relatively stable, and then extends that trend into the future for a fixed number of steps (e.g., 500 future SCLK ticks). By plotting both the actual readings and the extrapolated (predicted) values together, we get a forward-looking estimate of how the instrument will behave if the current trend continues. The last predicted value and its corresponding SCLK tick give a numerical point where the instrument may cross thresholds or start behaving abnormally, which helps identify potential lifespan limits or performance degradation without relying on heavy models like LSTM.</p>
     <h2 className="text-xl font-bold mb-6 text-white drop-shadow-lg">*Disclaimer</h2>
     <p className="text-lg leading-relaxed">The datasets to be used should be of a calibrated form. Hence, the chances of an anomaly may or may not exist.</p>
      </div>
    </main>
  );
}
