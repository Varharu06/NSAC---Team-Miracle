"use client";

export default function MedaPage() {
  return (
    <main className="p-10 flex justify-center">
      {/* Glassmorphic Container */}
      <div className="bg-[#0f172a]/50 backdrop-blur-sm rounded-2xl shadow-lg p-10 w-full max-w-5xl space-y-8 text-gray-100">
        <h1 className="text-4xl font-bold mb-6 text-white drop-shadow-lg">
          What is MEDA?
        </h1>
        <p className="text-lg leading-relaxed">
          The <strong>Mars Environmental Dynamics Analyzer (MEDA)</strong> is a sophisticated suite of sensors aboard NASA’s Perseverance rover designed to study the Martian atmosphere and surface environment. It measures parameters like temperature, wind speed and direction, pressure, humidity, and radiation flux. This data helps scientists understand Martian weather, dust dynamics, and seasonal variations, supporting both robotic and future human exploration.
        </p>

        <h2 className="text-xl font-bold mb-4 text-white drop-shadow-lg">1. Instrument Architecture</h2>
        <p className="text-lg leading-relaxed mb-4">
          Main components:
        </p>
        <ul className="list-disc ml-6 text-lg leading-relaxed mb-4">
          <li>ICU (Instrument Control Unit) – Central processor; receives analog signals from sensors, digitizes them, and communicates with the rover’s computer.</li>
          <li>RAMP (Rover Avionics Mounting Panel) – Interface between ICU and rover avionics for data communication and control.</li>
          <li>RCE (Rover Compute Element) – Stores and processes data sent by MEDA for transmission to Earth.</li>
          <li>ASIC – Front-end signal acquisition from sensors.</li>
        </ul>
        <p className="text-lg leading-relaxed mb-6">Sensors:</p>
        <ul className="list-disc ml-6 text-lg leading-relaxed mb-6">
          <li>WS (Wind Sensor)</li>
          <li>TIRS (Thermal Infrared Sensor)</li>
          <li>RDS (Radiation and Dust Sensor)</li>
          <li>PS (Pressure Sensor)</li>
          <li>HS (Humidity Sensor)</li>
          <li>ATS (Air Temperature Sensor)</li>
        </ul>

        <h2 className="text-xl font-bold mb-4 text-white drop-shadow-lg">2. Function and Data Flow</h2>
        <p className="text-lg leading-relaxed mb-6">
          Overall Working Principle:
        </p>
        <ol className="list-decimal ml-6 text-lg leading-relaxed mb-6">
          <li>Each sensor acquires environmental data.</li>
          <li>Signals (analog) are sent to the ICU.</li>
          <li>The ICU conditions, digitizes, and stores the data.</li>
          <li>Data is passed to the RAMP, then to the RCE.</li>
          <li>The RCE transmits the telemetry back to Earth.</li>
        </ol>

        <h2 className="text-xl font-bold mb-4 text-white drop-shadow-lg">3. MEDA Sensor Subsystems</h2>
        <ul className="list-disc ml-6 text-lg leading-relaxed mb-6">
          <li><strong>Wind Sensor (WS):</strong> Measures wind speed and direction; signals go via ASIC → ICU → RAMP → RCE.</li>
          <li><strong>Thermal Infrared Sensor (TIRS):</strong> Measures ground/air temperature using thermopiles; mounted on the Rover’s Mast.</li>
          <li><strong>Radiation and Dust Sensor (RDS):</strong> Measures UV radiation and dust deposition; mounted on rover’s top deck with photodiodes.</li>
          <li><strong>Humidity Sensor (HS):</strong> Measures ambient humidity using capacitive sensors near RMS.</li>
          <li><strong>Pressure Sensor (PS):</strong> Measures atmospheric pressure via tube connection; data flows tube → ICU → RAMP → RCE.</li>
        </ul>

        <h2 className="text-xl font-bold mb-4 text-white drop-shadow-lg">4. Data Processing Levels</h2>
        <table className="table-auto border border-white text-lg mb-6">
          <thead>
            <tr className="border-b border-white">
              <th className="px-4 py-2">Level</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white">
              <td className="px-4 py-2">EDR</td>
              <td className="px-4 py-2">Experimental Data Record</td>
              <td className="px-4 py-2">Unprocessed original telemetry data.</td>
            </tr>
            <tr className="border-b border-white">
              <td className="px-4 py-2">Partially Processed RDR</td>
              <td className="px-4 py-2">Reduced Data Record</td>
              <td className="px-4 py-2">Data parsed but not yet calibrated.</td>
            </tr>
            <tr className="border-b border-white">
              <td className="px-4 py-2">Calibrated RDR</td>
              <td className="px-4 py-2">Calibrated Data</td>
              <td className="px-4 py-2">Converted to physical units (Kelvin, Pa, V, etc.) independent of the instrument.</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Derived RDR</td>
              <td className="px-4 py-2">Final Data</td>
              <td className="px-4 py-2">Fully analyzed and ready for scientific use.</td>
            </tr>
          </tbody>
        </table>

        <h2 className="text-xl font-bold mb-4 text-white drop-shadow-lg">5. Flowcharts</h2>
        <p className="text-lg mb-2">A. Overall MEDA Data Flow:</p>
        <pre className="bg-gray-800 p-4 rounded mb-4">Sensors → ICU → RAMP → RCE → Earth (via Telemetry)</pre>

        <p className="text-lg mb-2">B. Detailed Data Acquisition and Transmission Flow:</p>
        <pre className="bg-gray-800 p-4 rounded mb-4">
{`flowchart TD
  A[Environmental Sensors] --> B[ICU - Instrument Control Unit]
  B --> C[RAMP - Rover Avionics Mounting Panel]
  C --> D[RCE - Rover Compute Element]
  D --> E[Telemetry Transmission to Earth]`}
        </pre>

        <p className="text-lg mb-2">C. Pressure Sensor Data Path:</p>
        <pre className="bg-gray-800 p-4 rounded mb-4">
{`flowchart LR
  A[Surface Air Pressure] --> B[Pressure Sensor]
  B --> C[Tube Connection]
  C --> D[ICU (Baseplate)]
  D --> E[RAMP]
  E --> F[Cavity Under Top Deck]
  F --> G[RCE → Earth]`}
        </pre>

        <p className="text-lg mb-2">D. Processing Level Flow:</p>
        <pre className="bg-gray-800 p-4 rounded mb-6">
{`flowchart LR
  A[RAW EDR] --> B[Partially Processed RDR]
  B --> C[Calibrated RDR]
  C --> D[Derived RDR (Final Data)]`}
        </pre>

        <h2 className="text-xl font-bold mb-4 text-white drop-shadow-lg">6. Summary</h2>
        <p className="text-lg leading-relaxed">
          The <strong>MEDA system</strong> is the environmental monitoring suite of the Perseverance rover. Its network of sensors continuously gathers meteorological data—temperature, wind, radiation, pressure, and humidity—which is conditioned by the ICU, transmitted through the rover avionics (RAMP, RCE), and sent to Earth for scientific analysis. The data helps calibrate models of the Martian atmosphere and assess long-term hardware performance.
        </p>
      </div>
    </main>
  );
}
