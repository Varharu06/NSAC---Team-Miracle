"use client";

import { useEffect, useState } from "react";
import { openDB } from "idb";
import Papa from "papaparse";
import Plot from "react-plotly.js";
import { zScore, grubbsTest, linearExtrapolate } from "./utils";

// Column list
const columnsToPlot = [
  "ICU_Analog_TH_HK_TM",
  "ICU_Analog_WS1_PRT",
  "ICU_Analog_WS2_PRT",
  "ICU_Analog_TIRS_ACQ_TEMP_TM",
  "ICU_Analog_MEDA_RDS_TEMP",
  "ICU_Analog_H_PRT_TEMP_1",
  "ICU_Analog_H_PRT_TEMP_2",
  "ICU_Analog_CAM_PCB_PRT",
  "ICU_Analog_CAM_CCD_PRT",
  "ICU_Analog_5V_CURRENT_TM",
  "ICU_Analog_8V_CURRENT_TM",
  "ICU_Analog_11VN_CURRENT_TM",
  "ICU_Analog_3V3_HK_MUX",
  "ICU_Analog_POWER_P1",
  "ICU_Analog_R1_CAL_PRT",
  "ICU_Analog_POWER_P2",
  "ICU_Analog_R2_CAL_PRT",
  "ICU_Analog_B1_SEC_PWR_TLM",
  "ICU_Analog_B2_SEC_PWR_TLM",
  "ICU_Analog_12V_HTR_CURRENT_TM",
  "SCLK",
];

// Human-readable names
const columnNames: Record<string, string> = {
  "ICU_Analog_TH_HK_TM": "Thermal Housing Temp",
  "ICU_Analog_WS1_PRT": "Wind Sensor 1 Pressure",
  "ICU_Analog_WS2_PRT": "Wind Sensor 2 Pressure",
  "ICU_Analog_TIRS_ACQ_TEMP_TM": "TIRS Acquisition Temp",
  "ICU_Analog_MEDA_RDS_TEMP": "MEDA RDS Temp",
  "ICU_Analog_H_PRT_TEMP_1": "Heater Temp 1",
  "ICU_Analog_H_PRT_TEMP_2": "Heater Temp 2",
  "ICU_Analog_CAM_PCB_PRT": "Camera PCB Temp",
  "ICU_Analog_CAM_CCD_PRT": "Camera CCD Temp",
  "ICU_Analog_5V_CURRENT_TM": "5V Current",
  "ICU_Analog_8V_CURRENT_TM": "8V Current",
  "ICU_Analog_11VN_CURRENT_TM": "11V Current",
  "ICU_Analog_3V3_HK_MUX": "3.3V HK MUX Voltage",
  "ICU_Analog_POWER_P1": "Power P1",
  "ICU_Analog_R1_CAL_PRT": "Resistor 1 Temp",
  "ICU_Analog_POWER_P2": "Power P2",
  "ICU_Analog_R2_CAL_PRT": "Resistor 2 Temp",
  "ICU_Analog_B1_SEC_PWR_TLM": "Battery 1 Secondary Power",
  "ICU_Analog_B2_SEC_PWR_TLM": "Battery 2 Secondary Power",
  "ICU_Analog_12V_HTR_CURRENT_TM": "12V Heater Current",
  "SCLK": "SCLK",
};

// Column units
const columnUnits: Record<string, string> = {
  "ICU_Analog_TH_HK_TM": "K",
  "ICU_Analog_WS1_PRT": "Pa",
  "ICU_Analog_WS2_PRT": "Pa",
  "ICU_Analog_TIRS_ACQ_TEMP_TM": "K",
  "ICU_Analog_MEDA_RDS_TEMP": "K",
  "ICU_Analog_H_PRT_TEMP_1": "K",
  "ICU_Analog_H_PRT_TEMP_2": "K",
  "ICU_Analog_CAM_PCB_PRT": "K",
  "ICU_Analog_CAM_CCD_PRT": "K",
  "ICU_Analog_5V_CURRENT_TM": "A",
  "ICU_Analog_8V_CURRENT_TM": "A",
  "ICU_Analog_11VN_CURRENT_TM": "A",
  "ICU_Analog_3V3_HK_MUX": "V",
  "ICU_Analog_POWER_P1": "W",
  "ICU_Analog_R1_CAL_PRT": "Ω",
  "ICU_Analog_POWER_P2": "W",
  "ICU_Analog_R2_CAL_PRT": "Ω",
  "ICU_Analog_B1_SEC_PWR_TLM": "W",
  "ICU_Analog_B2_SEC_PWR_TLM": "W",
  "ICU_Analog_12V_HTR_CURRENT_TM": "A",
  "SCLK": "ticks",
};

export default function Visualize() {
  const [csvData, setCsvData] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, number[]>>({});

  useEffect(() => {
    const loadCsv = async () => {
      try {
        const db = await openDB("NSAC", 1);
        const data = await db.get("csvData", "latest");
        if (data) {
          setCsvData(data as string);
          const parsed = Papa.parse(data as string, { header: true, skipEmptyLines: true });
          const obj: Record<string, number[]> = {};

          columnsToPlot.forEach((col) => {
            if (parsed.data[0] && col in parsed.data[0]) {
              obj[col] = (parsed.data as any[])
                .map((row) => parseFloat(row[col]))
                .filter((v) => !isNaN(v));
            }
          });

          setParsedData(obj);
        }
      } catch (err) {
        console.error("Failed to load CSV from IndexedDB:", err);
      }
    };
    loadCsv();
  }, []);

  if (!csvData) {
    return (
      <main className="max-w-4xl mx-auto py-16 px-6 text-center">
        <h1 className="text-3xl font-bold mb-6">Data Visualization</h1>
        <p className="text-gray-400">No data uploaded. Go back and upload a CSV.</p>
      </main>
    );
  }

  const sclkData = parsedData["SCLK"] ?? Array.from({ length: 100 }, (_, i) => i);

  const sortedColumns = [...columnsToPlot].filter(c => c !== "SCLK").sort((a, b) => {
    const dataA = parsedData[a] ?? [];
    const dataB = parsedData[b] ?? [];
    const middleA = dataA.slice(Math.floor(dataA.length / 2 - 50), Math.floor(dataA.length / 2 - 50) + 100);
    const middleB = dataB.slice(Math.floor(dataB.length / 2 - 50), Math.floor(dataB.length / 2 - 50) + 100);
    const hasAnomalyA = grubbsTest(middleA).length > 0 ? -1 : 1;
    const hasAnomalyB = grubbsTest(middleB).length > 0 ? -1 : 1;
    return hasAnomalyA - hasAnomalyB;
  });

  const predictSteps = 500;

  const lifespanSummary = sortedColumns.map((col) => {
    const values = parsedData[col] ?? [];
    const predicted = linearExtrapolate(values.slice(-50), predictSteps);
    const lastPredicted = predicted[predicted.length - 1];
    const lastSCLK = (sclkData[values.length - 1] || 0) + predictSteps;
    return { col, lastPredicted, lastSCLK };
  });

  return (
    <main className="max-w-6xl mx-auto py-16 px-6 space-y-12">
      <h1 className="text-3xl font-bold mb-6 text-white text-center">Rover Instrument Telemetry Visualization</h1>

      {/* Lifespan Prediction Graph */}
      <div className="bg-[#0f172a]/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-gray-100">
        <h2 className="text-2xl font-bold mb-4">Lifespan Prediction: All Instruments</h2>
        <Plot
          data={sortedColumns.flatMap((col) => {
            const values = parsedData[col] ?? [];
            const sclk = sclkData.slice(0, values.length);
            const predicted = linearExtrapolate(values.slice(-50), predictSteps);
            const futureSCLK = Array.from({ length: predictSteps }, (_, i) => (sclk[sclk.length - 1] || 0) + i + 1);

            return [
              {
                x: sclk,
                y: values,
                type: "scatter",
                mode: "lines",
                name: `${columnNames[col]} Actual`,
                line: { color: "cyan" },
              },
              {
                x: futureSCLK,
                y: predicted,
                type: "scatter",
                mode: "lines+markers",
                name: `${columnNames[col]} Predicted`,
                line: { dash: "dot", color: "yellow", width: 2 },
                marker: { size: 4, color: "yellow" },
              },
            ];
          })}
          layout={{
            width: 1000,
            height: 600,
            margin: { t: 50 },
            paper_bgcolor: "#0f172a",
            plot_bgcolor: "#0f172a",
            font: { color: "white" },
            title: "Lifespan Prediction Graph",
            xaxis: { title: "SCLK (8×10^8 ticks/sec)" },
            yaxis: { title: "Telemetry Values" },
          }}
        />

        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Predicted Readings Summary</h3>
          <table className="table-auto text-gray-300 border border-gray-700">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="px-4 py-2">Instrument</th>
                <th className="px-4 py-2">Unit</th>
                <th className="px-4 py-2">Last Predicted Reading</th>
                <th className="px-4 py-2">Corresponding SCLK</th>
              </tr>
            </thead>
            <tbody>
              {lifespanSummary.map(({ col, lastPredicted, lastSCLK }) => (
                <tr key={col} className="border-b border-gray-700">
                  <td className="px-4 py-2">{columnNames[col]}</td>
                  <td className="px-4 py-2">{columnUnits[col]}</td>
                  <td className="px-4 py-2">{lastPredicted.toFixed(2)}</td>
                  <td className="px-4 py-2">{lastSCLK}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Individual Column Graphs */}
      {sortedColumns.map((col) => {
        const data = parsedData[col];
        if (!data) return null;

        const start = Math.floor(data.length / 2 - 50);
        const middle100 = data.slice(start, start + 100);
        const sclk = sclkData.slice(start, start + 100);
        const outlierIndices = grubbsTest(middle100);
        const zScoresArr = zScore(middle100);

        const normalValues = middle100.map((v, i) => (outlierIndices.includes(i) ? null : v));
        const outlierValues = middle100.map((v, i) => (outlierIndices.includes(i) ? v : null));
        const performance = ((middle100.length - outlierIndices.length) / middle100.length) * 100;

        return (
          <div key={col} className="bg-[#0f172a]/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-gray-100">
            <h2 className="text-2xl font-bold mb-4">{columnNames[col]} vs SCLK</h2>
            <Plot
              data={[
                {
                  x: sclk,
                  y: normalValues,
                  type: "scatter",
                  mode: "lines+markers",
                  marker: { color: "cyan" },
                  name: "Normal",
                  line: { color: "cyan" },
                },
                {
                  x: sclk,
                  y: outlierValues,
                  type: "scatter",
                  mode: "markers",
                  marker: { color: "red", size: 8 },
                  name: "Anomaly",
                },
              ]}
              layout={{
                width: 900,
                height: 450,
                margin: { t: 50 },
                paper_bgcolor: "#0f172a",
                plot_bgcolor: "#0f172a",
                font: { color: "white" },
                title: `${columnNames[col]} vs SCLK`,
                xaxis: { title: "SCLK (8×10^8 ticks/sec)" },
                yaxis: { title: `${columnNames[col]} (${columnUnits[col]})` },
              }}
            />

            {/* Table showing units and scale */}
            <div className="mt-4">
              <table className="table-auto text-gray-300 border border-gray-700">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="px-4 py-2">Instrument</th>
                    <th className="px-4 py-2">Unit</th>
                    <th className="px-4 py-2">SCLK Unit</th>
                    <th className="px-4 py-2">SCLK Scale</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="px-4 py-2">{columnNames[col]}</td>
                    <td className="px-4 py-2">{columnUnits[col]}</td>
                    <td className="px-4 py-2">ticks</td>
                    <td className="px-4 py-2">8×10^8 ticks/sec</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Performance summary */}
            <div className="mt-2 text-gray-300">
              <p>
                <b>Performance:</b> {performance.toFixed(2)}% <br />
                <b>Suggested Calibration:</b> {(100 - performance).toFixed(2)}% <br />
                <b>Max Z-Score:</b> {Math.max(...zScoresArr.map(Math.abs)).toFixed(2)} <br />
                <b>Grubbs Test Outlier Indices:</b> {outlierIndices.length > 0 ? outlierIndices.join(", ") : "None"}
              </p>
            </div>

            <p className="mt-2 text-gray-300">
              This plot shows telemetry data with detected anomalies. Cyan lines are normal readings; red markers indicate potential instability or need for recalibration.
            </p>
          </div>
        );
      })}
    </main>
  );
}

// BEFORE HUMAN READABLE FORMAT:
// "use client";

// import { useEffect, useState } from "react";
// import { openDB } from "idb";
// import Papa from "papaparse";
// import Plot from "react-plotly.js";
// import { zScore, grubbsTest, linearExtrapolate } from "./utils";

// // Column list
// const columnsToPlot = [
//   "ICU_Analog_TH_HK_TM",
//   "ICU_Analog_WS1_PRT",
//   "ICU_Analog_WS2_PRT",
//   "ICU_Analog_TIRS_ACQ_TEMP_TM",
//   "ICU_Analog_MEDA_RDS_TEMP",
//   "ICU_Analog_H_PRT_TEMP_1",
//   "ICU_Analog_H_PRT_TEMP_2",
//   "ICU_Analog_CAM_PCB_PRT",
//   "ICU_Analog_CAM_CCD_PRT",
//   "ICU_Analog_5V_CURRENT_TM",
//   "ICU_Analog_8V_CURRENT_TM",
//   "ICU_Analog_11VN_CURRENT_TM",
//   "ICU_Analog_3V3_HK_MUX",
//   "ICU_Analog_POWER_P1",
//   "ICU_Analog_R1_CAL_PRT",
//   "ICU_Analog_POWER_P2",
//   "ICU_Analog_R2_CAL_PRT",
//   "ICU_Analog_B1_SEC_PWR_TLM",
//   "ICU_Analog_B2_SEC_PWR_TLM",
//   "ICU_Analog_12V_HTR_CURRENT_TM",
//   "SCLK",
// ];

// // Column units mapping
// const columnUnits: Record<string, string> = {
//   "ICU_Analog_TH_HK_TM": "°C",
//   "ICU_Analog_WS1_PRT": "Pa",
//   "ICU_Analog_WS2_PRT": "Pa",
//   "ICU_Analog_TIRS_ACQ_TEMP_TM": "°C",
//   "ICU_Analog_MEDA_RDS_TEMP": "°C",
//   "ICU_Analog_H_PRT_TEMP_1": "°C",
//   "ICU_Analog_H_PRT_TEMP_2": "°C",
//   "ICU_Analog_CAM_PCB_PRT": "°C",
//   "ICU_Analog_CAM_CCD_PRT": "°C",
//   "ICU_Analog_5V_CURRENT_TM": "A",
//   "ICU_Analog_8V_CURRENT_TM": "A",
//   "ICU_Analog_11VN_CURRENT_TM": "A",
//   "ICU_Analog_3V3_HK_MUX": "V",
//   "ICU_Analog_POWER_P1": "W",
//   "ICU_Analog_R1_CAL_PRT": "°C",
//   "ICU_Analog_POWER_P2": "W",
//   "ICU_Analog_R2_CAL_PRT": "°C",
//   "ICU_Analog_B1_SEC_PWR_TLM": "W",
//   "ICU_Analog_B2_SEC_PWR_TLM": "W",
//   "ICU_Analog_12V_HTR_CURRENT_TM": "A",
//   "SCLK": "ticks",
// };

// export default function Visualize() {
//   const [csvData, setCsvData] = useState<string | null>(null);
//   const [parsedData, setParsedData] = useState<Record<string, number[]>>({});

//   useEffect(() => {
//     const loadCsv = async () => {
//       try {
//         const db = await openDB("NSAC", 1);
//         const data = await db.get("csvData", "latest");
//         if (data) {
//           setCsvData(data as string);
//           const parsed = Papa.parse(data as string, { header: true, skipEmptyLines: true });
//           const obj: Record<string, number[]> = {};

//           columnsToPlot.forEach((col) => {
//             if (parsed.data[0] && col in parsed.data[0]) {
//               obj[col] = (parsed.data as any[])
//                 .map((row) => parseFloat(row[col]))
//                 .filter((v) => !isNaN(v));
//             }
//           });

//           setParsedData(obj);
//         }
//       } catch (err) {
//         console.error("Failed to load CSV from IndexedDB:", err);
//       }
//     };
//     loadCsv();
//   }, []);

//   if (!csvData) {
//     return (
//       <main className="max-w-4xl mx-auto py-16 px-6 text-center">
//         <h1 className="text-3xl font-bold mb-6">Data Visualization</h1>
//         <p className="text-gray-400">No data uploaded. Go back and upload a CSV.</p>
//       </main>
//     );
//   }

//   const sclkData = parsedData["SCLK"] ?? Array.from({ length: 100 }, (_, i) => i);

//   const sortedColumns = [...columnsToPlot].filter(c => c !== "SCLK").sort((a, b) => {
//     const dataA = parsedData[a] ?? [];
//     const dataB = parsedData[b] ?? [];
//     const middleA = dataA.slice(Math.floor(dataA.length / 2 - 50), Math.floor(dataA.length / 2 - 50) + 100);
//     const middleB = dataB.slice(Math.floor(dataB.length / 2 - 50), Math.floor(dataB.length / 2 - 50) + 100);
//     const hasAnomalyA = grubbsTest(middleA).length > 0 ? -1 : 1;
//     const hasAnomalyB = grubbsTest(middleB).length > 0 ? -1 : 1;
//     return hasAnomalyA - hasAnomalyB;
//   });

//   const predictSteps = 500; // longer prediction

//   const lifespanSummary = sortedColumns.map((col) => {
//     const values = parsedData[col] ?? [];
//     const predicted = linearExtrapolate(values.slice(-50), predictSteps);
//     const lastPredicted = predicted[predicted.length - 1];
//     const lastSCLK = (sclkData[values.length - 1] || 0) + predictSteps;
//     return { col, lastPredicted, lastSCLK };
//   });

//   return (
//     <main className="max-w-6xl mx-auto py-16 px-6 space-y-12">
//       <h1 className="text-3xl font-bold mb-6 text-center">Rover Instrument Telemetry Visualization</h1>

//       {/* Lifespan Prediction Graph */}
//       <div className="bg-[#0f172a]/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-gray-100">
//         <h2 className="text-2xl font-bold mb-4">Lifespan Prediction: All Columns</h2>
//         <Plot
//           data={sortedColumns.flatMap((col) => {
//             const values = parsedData[col] ?? [];
//             const sclk = sclkData.slice(0, values.length);
//             const predicted = linearExtrapolate(values.slice(-50), predictSteps);
//             const futureSCLK = Array.from({ length: predictSteps }, (_, i) => (sclk[sclk.length - 1] || 0) + i + 1);

//             return [
//               {
//                 x: sclk,
//                 y: values,
//                 type: "scatter",
//                 mode: "lines",
//                 name: `${col} Actual`,
//                 line: { color: "cyan" },
//               },
//               {
//                 x: futureSCLK,
//                 y: predicted,
//                 type: "scatter",
//                 mode: "lines+markers",
//                 name: `${col} Predicted`,
//                 line: { dash: "dot", color: "yellow", width: 2 },
//                 marker: { size: 4, color: "yellow" },
//               },
//             ];
//           })}
//           layout={{
//             width: 1000,
//             height: 600,
//             margin: { t: 50 },
//             paper_bgcolor: "#0f172a",
//             plot_bgcolor: "#0f172a",
//             font: { color: "white" },
//             title: "Lifespan Prediction Graph",
//             xaxis: { title: "SCLK (8×10^8 ticks/sec)" },
//             yaxis: { title: "Telemetry Values" },
//           }}
//         />
//         {/* Summary Table */}
//         <div className="mt-4">
//           <h3 className="text-lg font-semibold mb-2">Predicted Readings Summary</h3>
//           <table className="table-auto text-gray-300 border border-gray-700">
//             <thead>
//               <tr className="border-b border-gray-600">
//                 <th className="px-4 py-2">Column</th>
//                 <th className="px-4 py-2">Unit</th>
//                 <th className="px-4 py-2">Last Predicted Reading</th>
//                 <th className="px-4 py-2">Corresponding SCLK</th>
//               </tr>
//             </thead>
//             <tbody>
//               {lifespanSummary.map(({ col, lastPredicted, lastSCLK }) => (
//                 <tr key={col} className="border-b border-gray-700">
//                   <td className="px-4 py-2">{col}</td>
//                   <td className="px-4 py-2">{columnUnits[col]}</td>
//                   <td className="px-4 py-2">{lastPredicted.toFixed(2)}</td>
//                   <td className="px-4 py-2">{lastSCLK}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Individual Column Graphs */}
//       {sortedColumns.map((col) => {
//         const data = parsedData[col];
//         if (!data) return null;

//         const start = Math.floor(data.length / 2 - 50);
//         const middle100 = data.slice(start, start + 100);
//         const sclk = sclkData.slice(start, start + 100);
//         const outlierIndices = grubbsTest(middle100);
//         const zScoresArr = zScore(middle100);

//         const normalValues = middle100.map((v, i) => (outlierIndices.includes(i) ? null : v));
//         const outlierValues = middle100.map((v, i) => (outlierIndices.includes(i) ? v : null));
//         const performance = ((middle100.length - outlierIndices.length) / middle100.length) * 100;

//         return (
//           <div key={col} className="bg-[#0f172a]/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-gray-100">
//             <h2 className="text-2xl font-bold mb-4">{col} vs SCLK</h2>
//             <Plot
//               data={[
//                 { x: sclk, y: normalValues, type: "scatter", mode: "lines+markers", marker: { color: "cyan" }, name: "Normal" },
//                 { x: sclk, y: outlierValues, type: "scatter", mode: "markers", marker: { color: "red", size: 8 }, name: "Anomaly" },
//               ]}
//               layout={{
//                 width: 800,
//                 height: 400,
//                 margin: { t: 50 },
//                 paper_bgcolor: "#0f172a",
//                 plot_bgcolor: "#0f172a",
//                 font: { color: "white" },
//                 title: `${col} vs SCLK`,
//                 xaxis: { title: "SCLK (8×10^8 ticks/sec)" },
//                 yaxis: { title: `${col} (${columnUnits[col]})` },
//               }}
//             />
//             {/* Units Table */}
//             <div className="mt-2 text-gray-300">
//               <table className="table-auto border border-gray-700">
//                 <thead>
//                   <tr className="border-b border-gray-600">
//                     <th className="px-2 py-1">Column</th>
//                     <th className="px-2 py-1">Column Unit</th>
//                     <th className="px-2 py-1">SCLK Unit</th>
//                     <th className="px-2 py-1">SCLK Scale</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr>
//                     <td className="px-2 py-1">{col}</td>
//                     <td className="px-2 py-1">{columnUnits[col]}</td>
//                     <td className="px-2 py-1">{columnUnits["SCLK"]}</td>
//                     <td className="px-2 py-1">8×10^8 ticks/sec</td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         );
//       })}
//     </main>
//   );
// }

// BEFORE NOT USING LSTM METHOD:
// "use client";

// import { useEffect, useState } from "react";
// import { openDB } from "idb";
// import Papa from "papaparse";
// import Plot from "react-plotly.js";

// // Helper functions
// function zScore(arr: number[]) {
//   const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
//   const std = Math.sqrt(arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length);
//   return arr.map((x) => (x - mean) / std);
// }

// function grubbsTest(arr: number[], threshold = 2.5) {
//   if (arr.length < 3) return [];
//   const zScoresArr = zScore(arr);
//   const maxZ = Math.max(...zScoresArr.map(Math.abs));
//   const maxIndex = zScoresArr.map(Math.abs).indexOf(maxZ);
//   return maxZ > threshold ? [maxIndex] : [];
// }

// const columnsToPlot = [
//   "ICU_Analog_TH_HK_TM",
//   "ICU_Analog_WS1_PRT",
//   "ICU_Analog_WS2_PRT",
//   "ICU_Analog_TIRS_ACQ_TEMP_TM",
//   "ICU_Analog_MEDA_RDS_TEMP",
//   "ICU_Analog_H_PRT_TEMP_1",
//   "ICU_Analog_H_PRT_TEMP_2",
//   "ICU_Analog_CAM_PCB_PRT",
//   "ICU_Analog_CAM_CCD_PRT",
//   "ICU_Analog_5V_CURRENT_TM",
//   "ICU_Analog_8V_CURRENT_TM",
//   "ICU_Analog_11VN_CURRENT_TM",
//   "ICU_Analog_3V3_HK_MUX",
//   "ICU_Analog_POWER_P1",
//   "ICU_Analog_R1_CAL_PRT",
//   "ICU_Analog_POWER_P2",
//   "ICU_Analog_R2_CAL_PRT",
//   "ICU_Analog_B1_SEC_PWR_TLM",
//   "ICU_Analog_B2_SEC_PWR_TLM",
//   "ICU_Analog_12V_HTR_CURRENT_TM",
//   "SCLK", // For real x-axis
// ];

// export default function Visualize() {
//   const [csvData, setCsvData] = useState<string | null>(null);
//   const [parsedData, setParsedData] = useState<Record<string, number[]>>({});

//   useEffect(() => {
//     const loadCsv = async () => {
//       try {
//         const db = await openDB("NSAC", 1);
//         const data = await db.get("csvData", "latest");
//         if (data) {
//           setCsvData(data as string);
//           const parsed = Papa.parse(data as string, { header: true, skipEmptyLines: true });
//           const obj: Record<string, number[]> = {};

//           columnsToPlot.forEach((col) => {
//             if (parsed.data[0] && col in parsed.data[0]) {
//               obj[col] = (parsed.data as any[])
//                 .map((row) => parseFloat(row[col]))
//                 .filter((v) => !isNaN(v));
//             }
//           });

//           setParsedData(obj);
//         }
//       } catch (err) {
//         console.error("Failed to load CSV from IndexedDB:", err);
//       }
//     };
//     loadCsv();
//   }, []);

//   if (!csvData) {
//     return (
//       <main className="max-w-4xl mx-auto py-16 px-6 text-center">
//         <h1 className="text-3xl font-bold mb-6">Data Visualization</h1>
//         <p className="text-gray-400">No data uploaded. Go back and upload a CSV.</p>
//       </main>
//     );
//   }

//   const sclkData = parsedData["SCLK"] ?? Array.from({ length: 100 }, (_, i) => i);

//   // Sort columns by anomalies first
//   const sortedColumns = [...columnsToPlot]
//     .filter((c) => c !== "SCLK")
//     .sort((a, b) => {
//       const dataA = parsedData[a] ?? [];
//       const dataB = parsedData[b] ?? [];
//       const middleA = dataA.slice(Math.floor(dataA.length / 2 - 50), Math.floor(dataA.length / 2 - 50) + 100);
//       const middleB = dataB.slice(Math.floor(dataB.length / 2 - 50), Math.floor(dataB.length / 2 - 50) + 100);
//       const hasAnomalyA = grubbsTest(middleA).length > 0 ? -1 : 1;
//       const hasAnomalyB = grubbsTest(middleB).length > 0 ? -1 : 1;
//       return hasAnomalyA - hasAnomalyB;
//     });

//   return (
//     <main className="max-w-6xl mx-auto py-16 px-6 space-y-12">
//       <h1 className="text-3xl font-bold mb-6 text-center">Rover Instrument Telemetry Visualization</h1>

//       {/* Lifespan Prediction Graph */}
//       <div className="bg-[#0f172a]/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-gray-100">
//         <h2 className="text-2xl font-bold mb-4 text-center">Lifespan Prediction (All Columns)</h2>

//         {parsedData && Object.keys(parsedData).length > 0 && (
//           <Plot
//             data={Object.keys(parsedData)
//               .filter((c) => c !== "SCLK")
//               .map((col, idx) => {
//                 const data = parsedData[col];
//                 const sclk = sclkData;
//                 // Linear extrapolation placeholder
//                 const lastVal = data[data.length - 1] ?? 0;
//                 const futureSCLK = sclk.map((v) => v + 50);
//                 const predictedValues = sclk.map(() => lastVal);
//                 return {
//                   x: [...sclk, ...futureSCLK],
//                   y: [...data, ...predictedValues],
//                   type: "scatter",
//                   mode: "lines",
//                   line: { color: `hsl(${(idx / columnsToPlot.length) * 360}, 70%, 50%)` },
//                   name: col,
//                 };
//               })}
//             layout={{
//               width: 1000,
//               height: 500,
//               margin: { t: 50 },
//               paper_bgcolor: "#0f172a",
//               plot_bgcolor: "#0f172a",
//               font: { color: "white" },
//               xaxis: { title: "SCLK" },
//               yaxis: { title: "Telemetry Values" },
//               title: "Predicted Lifespan Trends (Placeholder)",
//             }}
//           />
//         )}

//         <p className="mt-2 text-gray-300">
//           <b>Graph Summary:</b> Combines all telemetry columns to show predicted trends. Future points are extrapolated from current data. LSTM integration can provide more accurate lifespan predictions.
//         </p>
//       </div>

//       {/* Individual Telemetry Graphs */}
//       {sortedColumns.map((col) => {
//         const data = parsedData[col];
//         if (!data) return null;

//         const start = Math.floor(data.length / 2 - 50);
//         const middle100 = data.slice(start, start + 100);
//         const sclk = sclkData.slice(start, start + 100);
//         const outlierIndices = grubbsTest(middle100);
//         const zScoresArr = zScore(middle100);

//         const normalValues = middle100.map((v, i) => (outlierIndices.includes(i) ? null : v));
//         const outlierValues = middle100.map((v, i) => (outlierIndices.includes(i) ? v : null));

//         const performance = ((middle100.length - outlierIndices.length) / middle100.length) * 100;

//         return (
//           <div key={col} className="bg-[#0f172a]/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-gray-100">
//             <h2 className="text-2xl font-bold mb-4">{col} vs SCLK</h2>

//             <Plot
//               data={[
//                 { x: sclk, y: normalValues, type: "scatter", mode: "lines+markers", marker: { color: "cyan" }, name: "Normal" },
//                 { x: sclk, y: outlierValues, type: "scatter", mode: "markers", marker: { color: "red", size: 8 }, name: "Anomaly" },
//               ]}
//               layout={{
//                 width: 800,
//                 height: 400,
//                 margin: { t: 50 },
//                 paper_bgcolor: "#0f172a",
//                 plot_bgcolor: "#0f172a",
//                 font: { color: "white" },
//                 xaxis: { title: "SCLK" },
//                 yaxis: { title: col },
//                 title: `${col} vs SCLK`,
//               }}
//             />

//             <p>
//               <b>Performance:</b> {performance.toFixed(2)}% <br />
//               <b>Suggested Calibration:</b> {(100 - performance).toFixed(2)}% <br />
//               <b>Max Z-Score:</b> {Math.max(...zScoresArr.map(Math.abs)).toFixed(2)} <br />
//               <b>Grubbs Test Outlier Indices:</b> {outlierIndices.length > 0 ? outlierIndices.join(", ") : "None"}
//             </p>

//             <p className="mt-2 text-gray-300">
//               <b>Graph Summary:</b> Telemetry data for <i>{col}</i> vs SCLK. Red points indicate anomalies detected by Grubbs' test. A higher anomaly count suggests potential instability or need for calibration.
//             </p>
//           </div>
//         );
//       })}
//     </main>
//   );
// }









// THE ONE BEFORE LIFESPAN PREDICTION:
// "use client";

// import { useEffect, useState } from "react";
// import { openDB } from "idb";
// import Papa from "papaparse";
// import Plot from "react-plotly.js";

// // Helper functions
// function zScore(arr: number[]) {
//   const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
//   const std = Math.sqrt(arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length);
//   return arr.map((x) => (x - mean) / std);
// }

// function grubbsTest(arr: number[], threshold = 2.5) {
//   if (arr.length < 3) return [];
//   const zScoresArr = zScore(arr);
//   const maxZ = Math.max(...zScoresArr.map(Math.abs));
//   const maxIndex = zScoresArr.map(Math.abs).indexOf(maxZ);
//   return maxZ > threshold ? [maxIndex] : [];
// }

// const columnsToPlot = [
//   "ICU_Analog_TH_HK_TM",
//   "ICU_Analog_WS1_PRT",
//   "ICU_Analog_WS2_PRT",
//   "ICU_Analog_TIRS_ACQ_TEMP_TM",
//   "ICU_Analog_MEDA_RDS_TEMP",
//   "ICU_Analog_H_PRT_TEMP_1",
//   "ICU_Analog_H_PRT_TEMP_2",
//   "ICU_Analog_CAM_PCB_PRT",
//   "ICU_Analog_CAM_CCD_PRT",
//   "ICU_Analog_5V_CURRENT_TM",
//   "ICU_Analog_8V_CURRENT_TM",
//   "ICU_Analog_11VN_CURRENT_TM",
//   "ICU_Analog_3V3_HK_MUX",
//   "ICU_Analog_POWER_P1",
//   "ICU_Analog_R1_CAL_PRT",
//   "ICU_Analog_POWER_P2",
//   "ICU_Analog_R2_CAL_PRT",
//   "ICU_Analog_B1_SEC_PWR_TLM",
//   "ICU_Analog_B2_SEC_PWR_TLM",
//   "ICU_Analog_12V_HTR_CURRENT_TM",
//   "SCLK", // include SCLK to extract real x-axis
// ];

// export default function Visualize() {
//   const [csvData, setCsvData] = useState<string | null>(null);
//   const [parsedData, setParsedData] = useState<Record<string, number[]>>({});

//   useEffect(() => {
//     const loadCsv = async () => {
//       try {
//         const db = await openDB("NSAC", 1);
//         const data = await db.get("csvData", "latest");
//         if (data) {
//           setCsvData(data as string);
//           const parsed = Papa.parse(data as string, { header: true, skipEmptyLines: true });
//           const obj: Record<string, number[]> = {};

//           columnsToPlot.forEach((col) => {
//             if (parsed.data[0] && col in parsed.data[0]) {
//               obj[col] = (parsed.data as any[])
//                 .map((row) => parseFloat(row[col]))
//                 .filter((v) => !isNaN(v));
//             }
//           });

//           setParsedData(obj);
//         }
//       } catch (err) {
//         console.error("Failed to load CSV from IndexedDB:", err);
//       }
//     };
//     loadCsv();
//   }, []);

//   if (!csvData) {
//     return (
//       <main className="max-w-4xl mx-auto py-16 px-6 text-center">
//         <h1 className="text-3xl font-bold mb-6">Data Visualization</h1>
//         <p className="text-gray-400">No data uploaded. Go back and upload a CSV.</p>
//       </main>
//     );
//   }

//   const sclkData = parsedData["SCLK"] ?? Array.from({ length: 100 }, (_, i) => i);

//   // Sort columns by anomalies first
//   const sortedColumns = [...columnsToPlot].filter(c => c !== "SCLK").sort((a, b) => {
//     const dataA = parsedData[a] ?? [];
//     const dataB = parsedData[b] ?? [];
//     const middleA = dataA.slice(Math.floor(dataA.length / 2 - 50), Math.floor(dataA.length / 2 - 50) + 100);
//     const middleB = dataB.slice(Math.floor(dataB.length / 2 - 50), Math.floor(dataB.length / 2 - 50) + 100);
//     const hasAnomalyA = grubbsTest(middleA).length > 0 ? -1 : 1;
//     const hasAnomalyB = grubbsTest(middleB).length > 0 ? -1 : 1;
//     return hasAnomalyA - hasAnomalyB;
//   });

//   return (
//     <main className="max-w-6xl mx-auto py-16 px-6 space-y-12">
//       <h1 className="text-3xl font-bold mb-6 text-center">Rover Instrument Telemetry Visualization</h1>

//       {sortedColumns.map((col) => {
//         const data = parsedData[col];
//         if (!data) return null;

//         const start = Math.floor(data.length / 2 - 50);
//         const middle100 = data.slice(start, start + 100);
//         const sclk = sclkData.slice(start, start + 100);
//         const outlierIndices = grubbsTest(middle100);
//         const zScoresArr = zScore(middle100);

//         const normalValues = middle100.map((v, i) => (outlierIndices.includes(i) ? null : v));
//         const outlierValues = middle100.map((v, i) => (outlierIndices.includes(i) ? v : null));

//         const performance = ((middle100.length - outlierIndices.length) / middle100.length) * 100;

//         return (
//           <div key={col} className="bg-[#0f172a]/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-gray-100">
//             <h2 className="text-2xl font-bold mb-4">{col} vs SCLK</h2>

//             <Plot
//               data={[
//                 { x: sclk, y: normalValues, type: "scatter", mode: "lines+markers", marker: { color: "cyan" }, name: "Normal" },
//                 { x: sclk, y: outlierValues, type: "scatter", mode: "markers", marker: { color: "red", size: 8 }, name: "Anomaly" },
//               ]}
//               layout={{
//                 width: 800,
//                 height: 400,
//                 margin: { t: 50 },
//                 paper_bgcolor: "#0f172a",
//                 plot_bgcolor: "#0f172a",
//                 font: { color: "white" },
//                 title: `${col} vs SCLK`,
//                 xaxis: { title: "SCLK" },
//                 yaxis: { title: col },
//               }}
//             />

//             <p>
//               <b>Performance:</b> {performance.toFixed(2)}% <br />
//               <b>Suggested Calibration:</b> {(100 - performance).toFixed(2)}% <br />
//               <b>Max Z-Score:</b> {Math.max(...zScoresArr.map(Math.abs)).toFixed(2)} <br />
//               <b>Grubbs Test Outlier Indices:</b> {outlierIndices.length > 0 ? outlierIndices.join(", ") : "None"}
//             </p>

//             <p className="mt-2 text-gray-300">
//               <b>Graph Summary:</b> This plot shows the telemetry data for <i>{col}</i> against SCLK. Red points indicate detected anomalies based on Grubbs' test. 
//               A higher number of anomalies may indicate instrument instability or need for calibration.
//             </p>
//           </div>
//         );
//       })}
//     </main>
//   );
// }

// JUST JUST JUST BEFORE
// "use client";

// import { useEffect, useState } from "react";
// import { openDB } from "idb";
// import Papa from "papaparse";
// import Plot from "react-plotly.js";

// // Helper functions
// function zScore(arr: number[]) {
//   const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
//   const std = Math.sqrt(arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length);
//   return arr.map((x) => (x - mean) / std);
// }

// function grubbsTest(arr: number[], threshold = 2.5) {
//   if (arr.length < 3) return [];
//   const zScoresArr = zScore(arr);
//   const maxZ = Math.max(...zScoresArr.map(Math.abs));
//   const maxIndex = zScoresArr.map(Math.abs).indexOf(maxZ);
//   return maxZ > threshold ? [maxIndex] : [];
// }

// const columnsToPlot = [
//   "ICU_Analog_TH_HK_TM",
//   "ICU_Analog_WS1_PRT",
//   "ICU_Analog_WS2_PRT",
//   "ICU_Analog_TIRS_ACQ_TEMP_TM",
//   "ICU_Analog_MEDA_RDS_TEMP",
//   "ICU_Analog_H_PRT_TEMP_1",
//   "ICU_Analog_H_PRT_TEMP_2",
//   "ICU_Analog_CAM_PCB_PRT",
//   "ICU_Analog_CAM_CCD_PRT",
//   "ICU_Analog_5V_CURRENT_TM",
//   "ICU_Analog_8V_CURRENT_TM",
//   "ICU_Analog_11VN_CURRENT_TM",
//   "ICU_Analog_3V3_HK_MUX",
//   "ICU_Analog_POWER_P1",
//   "ICU_Analog_R1_CAL_PRT",
//   "ICU_Analog_POWER_P2",
//   "ICU_Analog_R2_CAL_PRT",
//   "ICU_Analog_B1_SEC_PWR_TLM",
//   "ICU_Analog_B2_SEC_PWR_TLM",
//   "ICU_Analog_12V_HTR_CURRENT_TM",
// ];

// export default function Visualize() {
//   const [csvData, setCsvData] = useState<string | null>(null);
//   const [parsedData, setParsedData] = useState<Record<string, number[]>>({});

//   useEffect(() => {
//     const loadCsv = async () => {
//       try {
//         const db = await openDB("NSAC", 1);
//         const data = await db.get("csvData", "latest");
//         if (data) {
//           setCsvData(data as string);
//           const parsed = Papa.parse(data as string, { header: true, skipEmptyLines: true });
//           const obj: Record<string, number[]> = {};
//           columnsToPlot.forEach((col) => {
//             if (parsed.data[0] && col in parsed.data[0]) {
//               obj[col] = (parsed.data as any[])
//                 .map((row) => parseFloat(row[col]))
//                 .filter((v) => !isNaN(v));
//             }
//           });
//           setParsedData(obj);
//         }
//       } catch (err) {
//         console.error("Failed to load CSV from IndexedDB:", err);
//       }
//     };
//     loadCsv();
//   }, []);

//   if (!csvData) {
//     return (
//       <main className="max-w-4xl mx-auto py-16 px-6 text-center">
//         <h1 className="text-3xl font-bold mb-6">Data Visualization</h1>
//         <p className="text-gray-600">No data uploaded. Go back and upload a CSV.</p>
//       </main>
//     );
//   }

//   // Sort columns: prioritize those with anomalies
//   const sortedColumns = [...columnsToPlot].sort((a, b) => {
//     const dataA = parsedData[a] ?? [];
//     const dataB = parsedData[b] ?? [];
//     const middleA = dataA.slice(Math.floor(dataA.length / 2 - 50), Math.floor(dataA.length / 2 - 50) + 100);
//     const middleB = dataB.slice(Math.floor(dataB.length / 2 - 50), Math.floor(dataB.length / 2 - 50) + 100);
//     const hasAnomalyA = grubbsTest(middleA).length > 0 ? -1 : 1;
//     const hasAnomalyB = grubbsTest(middleB).length > 0 ? -1 : 1;
//     return hasAnomalyA - hasAnomalyB;
//   });

//   return (
//     <main className="max-w-6xl mx-auto py-16 px-6 space-y-12">
//       <h1 className="text-3xl font-bold mb-6 text-center">Rover Instrument Telemetry Visualization</h1>

//       {sortedColumns.map((col) => {
//         const data = parsedData[col];
//         if (!data) return null;

//         const start = Math.floor(data.length / 2 - 50);
//         const middle100 = data.slice(start, start + 100);
//         const outlierIndices = grubbsTest(middle100);

//         const normalValues = middle100.map((v, i) => (outlierIndices.includes(i) ? null : v));
//         const outlierValues = middle100.map((v, i) => (outlierIndices.includes(i) ? v : null));
//         const sclk = Array.from({ length: middle100.length }, (_, i) => i); // SCLK placeholder

//         const performance = ((middle100.length - outlierIndices.length) / middle100.length) * 100;

//         return (
//           <div key={col} className="bg-[#0f172a]/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-gray-100">
//             <h2 className="text-2xl font-bold mb-4">{col}</h2>
//             <Plot
//               data={[
//                 { x: sclk, y: normalValues, type: "scatter", mode: "lines+markers", marker: { color: "cyan" }, name: "Normal" },
//                 { x: sclk, y: outlierValues, type: "scatter", mode: "markers", marker: { color: "red", size: 8 }, name: "Anomaly" },
//               ]}
//               layout={{ width: 800, height: 400, margin: { t: 30 }, title: col }}
//             />
//             <p>
//               Performance: <b>{performance.toFixed(2)}%</b> <br />
//               Suggested calibration: <b>{(100 - performance).toFixed(2)}%</b>
//             </p>
//           </div>
//         );
//       })}
//     </main>
//   );
// }

// JUST JUST BEFORE:
// "use client"; // <<< MUST be the first line

// import { useEffect, useState } from "react";
// import { openDB } from "idb";
// import Papa from "papaparse";
// import Plot from "react-plotly.js";

// // Helper functions
// function zScore(arr: number[]) {
//   const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
//   const std = Math.sqrt(arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length);
//   return arr.map((x) => (x - mean) / std);
// }

// function grubbsTest(arr: number[], threshold = 2.5) {
//   if (arr.length < 3) return [];
//   const zScoresArr = zScore(arr);
//   const maxZ = Math.max(...zScoresArr.map(Math.abs));
//   const maxIndex = zScoresArr.map(Math.abs).indexOf(maxZ);
//   return maxZ > threshold ? [maxIndex] : [];
// }

// const columnsToPlot = [
//   "ICU_Analog_TH_HK_TM",
//   "ICU_Analog_WS1_PRT",
//   "ICU_Analog_WS2_PRT",
//   "ICU_Analog_TIRS_ACQ_TEMP_TM",
//   "ICU_Analog_MEDA_RDS_TEMP",
//   "ICU_Analog_H_PRT_TEMP_1",
//   "ICU_Analog_H_PRT_TEMP_2",
//   "ICU_Analog_CAM_PCB_PRT",
//   "ICU_Analog_CAM_CCD_PRT",
//   "ICU_Analog_5V_CURRENT_TM",
//   "ICU_Analog_8V_CURRENT_TM",
//   "ICU_Analog_11VN_CURRENT_TM",
//   "ICU_Analog_3V3_HK_MUX",
//   "ICU_Analog_POWER_P1",
//   "ICU_Analog_R1_CAL_PRT",
//   "ICU_Analog_POWER_P2",
//   "ICU_Analog_R2_CAL_PRT",
//   "ICU_Analog_B1_SEC_PWR_TLM",
//   "ICU_Analog_B2_SEC_PWR_TLM",
//   "ICU_Analog_12V_HTR_CURRENT_TM",
// ];

// export default function Visualize() {
//   const [csvData, setCsvData] = useState<string | null>(null);
//   const [parsedData, setParsedData] = useState<Record<string, number[]>>({});

//   useEffect(() => {
//     const loadCsv = async () => {
//       try {
//         const db = await openDB("NSAC", 1);
//         const data = await db.get("csvData", "latest");
//         if (data) {
//           setCsvData(data as string);
//           const parsed = Papa.parse(data as string, { header: true, skipEmptyLines: true });
//           const obj: Record<string, number[]> = {};
//           columnsToPlot.forEach((col) => {
//             if (parsed.data[0] && col in parsed.data[0]) {
//               obj[col] = (parsed.data as any[]).map((row) => parseFloat(row[col]));
//             }
//           });
//           setParsedData(obj);
//         }
//       } catch (err) {
//         console.error("Failed to load CSV from IndexedDB:", err);
//       }
//     };
//     loadCsv();
//   }, []);

//   if (!csvData) {
//     return (
//       <main className="max-w-4xl mx-auto py-16 px-6 text-center">
//         <h1 className="text-3xl font-bold mb-6">Data Visualization</h1>
//         <p className="text-gray-600">No data uploaded. Go back and upload a CSV.</p>
//       </main>
//     );
//   }

//   return (
//     <main className="max-w-6xl mx-auto py-16 px-6 space-y-12">
//       <h1 className="text-3xl font-bold mb-6 text-center">Rover Instrument Telemetry Visualization</h1>

//       {columnsToPlot.map((col) => {
//         const data = parsedData[col];
//         if (!data) return null;

//         const start = Math.floor(data.length / 2 - 50);
//         const middle100 = data.slice(start, start + 100);

//         const outlierIndices = grubbsTest(middle100);

//         const normalValues = middle100.map((v, i) => (outlierIndices.includes(i) ? null : v));
//         const outlierValues = middle100.map((v, i) => (outlierIndices.includes(i) ? v : null));
//         const sclk = Array.from({ length: 100 }, (_, i) => i); // placeholder SCLK

//         return (
//           <div key={col} className="bg-[#0f172a]/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-gray-100">
//             <h2 className="text-2xl font-bold mb-4">{col}</h2>
//             <Plot
//               data={[
//                 { x: sclk, y: normalValues, type: "scatter", mode: "lines+markers", marker: { color: "cyan" }, name: "Normal" },
//                 { x: sclk, y: outlierValues, type: "scatter", mode: "markers", marker: { color: "red", size: 8 }, name: "Anomaly" },
//               ]}
//               layout={{ width: 800, height: 400, margin: { t: 30 }, title: col }}
//             />
//             <p>
//               Instrument performance: {outlierIndices.length === 0 ? "Stable" : "Check anomalies"} <br />
//               Suggested calibration: {outlierIndices.length === 0 ? "None needed (100%)" : "Inspect & recalibrate"}
//             </p>
//           </div>
//         );
//       })}
//     </main>
//   );
// }

// JUST BEFORE:
// "use client";

// import { useEffect, useState } from "react";
// import { openDB } from "idb";
// import Papa from "papaparse";
// import Plot from "react-plotly.js";
// import { zScore, grubbsOutliers } from "./utils";

// const columnsToPlot = [
//   "ICU_Analog_TH_HK_TM",
//   "ICU_Analog_WS1_PRT",
//   "ICU_Analog_WS2_PRT",
//   "ICU_Analog_TIRS_ACQ_TEMP_TM",
//   "ICU_Analog_MEDA_RDS_TEMP",
//   "ICU_Analog_H_PRT_TEMP_1",
//   "ICU_Analog_H_PRT_TEMP_2",
//   "ICU_Analog_CAM_PCB_PRT",
//   "ICU_Analog_CAM_CCD_PRT",
//   "ICU_Analog_5V_CURRENT_TM",
//   "ICU_Analog_8V_CURRENT_TM",
//   "ICU_Analog_11VN_CURRENT_TM",
//   "ICU_Analog_3V3_HK_MUX",
//   "ICU_Analog_POWER_P1",
//   "ICU_Analog_R1_CAL_PRT",
//   "ICU_Analog_POWER_P2",
//   "ICU_Analog_R2_CAL_PRT",
//   "ICU_Analog_B1_SEC_PWR_TLM",
//   "ICU_Analog_B2_SEC_PWR_TLM",
//   "ICU_Analog_12V_HTR_CURRENT_TM",
// ];

// export default function Visualize() {
//   const [csvData, setCsvData] = useState<any[]>([]);

//   // Load CSV from IndexedDB and parse
//   useEffect(() => {
//     const loadCsv = async () => {
//       try {
//         const db = await openDB("NSAC", 1);
//         const data = await db.get("csvData", "latest");
//         if (data) {
//           const parsed = Papa.parse(data as string, { header: true, dynamicTyping: true });
//           setCsvData(parsed.data as any[]);
//         }
//       } catch (err) {
//         console.error("Failed to load CSV from IndexedDB:", err);
//       }
//     };
//     loadCsv();
//   }, []);

//   // Helper: middle 100 rows
//   const getMiddleRows = (arr: any[]) => {
//     const start = Math.floor(arr.length / 2) - 50;
//     return arr.slice(start, start + 100);
//   };

//   return (
//     <main className="max-w-6xl mx-auto py-16 px-6">
//       <h1 className="text-3xl font-bold mb-6 text-center">Data Visualization</h1>

//       {csvData.length === 0 ? (
//         <p className="text-gray-600 text-center">No data uploaded. Go back and upload a CSV.</p>
//       ) : (
//         columnsToPlot.map((col) => {
//           if (!(col in csvData[0])) return null; // skip missing columns

//           const middleRows = getMiddleRows(csvData);
//           const x = middleRows.map(r => r.SCLK);
//           const y = middleRows.map(r => r[col]);

//           const outlierIndices = grubbsOutliers(y);
//           const colors = y.map((_, i) => outlierIndices.includes(i) ? "red" : "blue");

//           // Performance summary
//           const max = Math.max(...y);
//           const min = Math.min(...y);
//           const avg = y.reduce((a, b) => a + b, 0) / y.length;
//           const performance = `Avg: ${avg.toFixed(2)}, Min: ${min.toFixed(2)}, Max: ${max.toFixed(2)}`;

//           return (
//             <div key={col} className="mb-12">
//               <h2 className="text-xl font-semibold mb-2">{col}</h2>
//               <p className="text-sm text-gray-400 mb-4">{performance}</p>
//               <Plot
//                 data={[
//                   {
//                     x,
//                     y,
//                     type: "scatter",
//                     mode: "lines+markers",
//                     marker: { color: colors },
//                     line: { color: "#3b82f6" },
//                   },
//                 ]}
//                 layout={{
//                   width: 800,
//                   height: 400,
//                   title: col,
//                   xaxis: { title: "SCLK" },
//                   yaxis: { title: col },
//                 }}
//               />
//             </div>
//           );
//         })
//       )}
//     </main>
//   );
// }


// THE ACTUAL Page code, (before plotting version)
// "use client";

// import { useEffect, useState } from "react";
// import { openDB } from "idb";

// export default function Visualize() {
//   const [csvData, setCsvData] = useState<string | null>(null);

//   // Load CSV from IndexedDB
//   useEffect(() => {
//     const loadCsv = async () => {
//       try {
//         const db = await openDB("NSAC", 1);
//         const data = await db.get("csvData", "latest");
//         if (data) setCsvData(data as string);
//       } catch (err) {
//         console.error("Failed to load CSV from IndexedDB:", err);
//       }
//     };

//     loadCsv();
//   }, []);

//   // Cleanup CSV on tab close (optional, reinforces tab-lifetime storage)
//   useEffect(() => {
//     const cleanup = async () => {
//       try {
//         const db = await openDB("NSAC", 1);
//         await db.delete("csvData", "latest");
//         console.log("CSV removed from IndexedDB on tab close");
//       } catch (err) {
//         console.error("Failed to clean up CSV:", err);
//       }
//     };

//     window.addEventListener("beforeunload", cleanup);
//     return () => window.removeEventListener("beforeunload", cleanup);
//   }, []);

//   return (
//     <main className="max-w-4xl mx-auto py-16 px-6">
//       <h1 className="text-3xl font-bold mb-6 text-center">
//         Data Visualization
//       </h1>

//       {csvData ? (
//         <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto">
//           {csvData.slice(0, 1000)}...
//         </pre>
//       ) : (
//         <p className="text-gray-600 text-center">
//           No data uploaded. Go back and upload a CSV.
//         </p>
//       )}
//     </main>
//   );
// }



// "use client";

// import { useEffect, useState } from "react";

// export default function Visualize() {
//   const [csvData, setCsvData] = useState<string | null>(null);

//   useEffect(() => {
//     const data = sessionStorage.getItem("csvData");
//     setCsvData(data);
//   }, []);

//   return (
//     <main className="max-w-4xl mx-auto py-16 px-6">
//       <h1 className="text-3xl font-bold mb-6">Data Visualization</h1>
//       {csvData ? (
//         <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto">
//           {csvData.slice(0, 1000)}...
//         </pre>
//       ) : (
//         <p className="text-gray-600">No data uploaded. Go back and upload a CSV.</p>
//       )}
//     </main>
//   );
// }
