"use client";

export default function ToolsPage() {
  return (
    <main className="p-10 flex justify-center">
      {/* Glassmorphic Container */}
      <div className="bg-[#0f172a]/50 backdrop-blur-sm rounded-2xl shadow-lg p-10 w-full space-y-6 text-gray-100">
        <h1 className="text-4xl font-bold mb-6 text-white drop-shadow-lg">
          Tools We Used
        </h1>
        <p className="text-lg leading-relaxed">
          This page details the tools, software, and instruments used by Team Miracle 
          to analyze rover telemetry, and visualize data.
        </p>

        <h2 className="text-xl font-bold mb-6 text-white drop-shadow-lg">Accessing Data</h2>
        <p className="text-lg leading-relaxed">
          1. <a className="text-green-500" href="https://pds-atmospheres.nmsu.edu/data_and_services/atmospheres_data/PERSEVERANCE/perseverance_rover.html">PDS (Planetary Data System) </a> to access raw telemetry of Perseverance rover.<br /> 
          2. <a className="text-green-500" href="https://pds-atmospheres.nmsu.edu/data_and_services/atmospheres_data/PERSEVERANCE/logs/MEDA_SIS_v0.27_10Sep2020.docx">SIS (System Interface Specification) </a> to undersand the parts of the rover and derive meaning out of the raw telemetry.<br /> 
          3. <a className="text-green-500" href="https://an.rsl.wustl.edu/">Analyst's Notebook</a> for sequencial information of sols.<br />
        </p>

         <h2 className="text-xl font-bold mb-6 text-white drop-shadow-lg">Mathematical methods</h2>
        <p className="text-lg leading-relaxed">
           1. Calculate <a className="text-green-500" href="https://en.wikipedia.org/wiki/Standard_score">Z-Score </a> to know how far a data point is from the mean of a dataset.<br /> 
          2. Calculate <a className="text-green-500" href="https://en.wikipedia.org/wiki/Grubbs%27s_test">Grubbs-test </a> to detect a single outlier.<br /> 
          2. Calculate <a className="text-green-500" href="https://en.wikipedia.org/wiki/Extrapolation">Linear extrapolation </a> to predict lifespan.<br /> 
        </p>

    <h2 className="text-xl font-bold mb-6 text-white drop-shadow-lg">Technical Stack</h2>
    <p className="text-lg leading-relaxed">
      1. Programming languages: Combination of HTML, CSS, JavaScript, TypeScript, and Python. We used CSV for datasets.<br />
      2. Libraries and frameworks: NextJS, TailwindCSS, ReactJS, matplotlib, react-plotly.js, and papaparse.js. <br />
      3. Softwares: Visual Studio Code, PyCharm.
    </p>
    <h2 className="text-xl font-bold mb-6 text-white drop-shadow-lg">Use of Artificial Intelligence</h2>
    <p className="text-lg leading-relaxed">
      We have used ChatGPT (developed by OpenAI) alongside refering SIS documentation to learn about the engineering CSV and the sensors aboard MEDA.
    </p>
    <h2 className="text-xl font-bold mb-6 text-white drop-shadow-lg">Behind the scenes</h2>
    <img src="/pds-screenshot.png" alt="" />
    <img src="/sis-screenshot.png" alt="" />
    <img src="/analyst-notebook-screenshot.png" alt="" />
    <img src="/coding-website-screenshot.png" alt="" />
    <img src="/vardheep-pycharm.jpeg" alt="" />
    <img src="/rds-screenshot.jpeg" alt="" />
    <img src="/chatgpt-meda.png" alt="" />
      </div>
    </main>
  );
}
