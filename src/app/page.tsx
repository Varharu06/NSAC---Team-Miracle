"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { openDB } from "idb";

export default function Home() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);

  // Initialize IndexedDB
  const initDB = async () => {
    const db = await openDB("NSAC", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("csvData")) {
          db.createObjectStore("csvData");
        }
      },
    });
    return db;
  };

  // Clean up CSV from IndexedDB when tab closes
  useEffect(() => {
    const cleanup = async () => {
      try {
        const db = await initDB();
        await db.delete("csvData", "latest");
      } catch (err) {
        console.error("Failed to clean up CSV:", err);
      }
    };

    window.addEventListener("beforeunload", cleanup);
    return () => window.removeEventListener("beforeunload", cleanup);
  }, []);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const uploadedFile = e.target.files[0];

      if (uploadedFile.type === "text/csv") {
        setFile(uploadedFile);

        const reader = new FileReader();
        reader.onload = async (event) => {
          if (event.target?.result) {
            try {
              const db = await initDB();
              await db.put("csvData", event.target.result as string, "latest");
            } catch (err) {
              console.error("Failed to save CSV in IndexedDB:", err);
            }
          }
        };
        reader.readAsText(uploadedFile);
      } else {
        alert("Please upload a valid CSV file.");
      }
    }
  };

  // Navigate to visualization page
  const handleGo = () => {
    if (!file) {
      alert("Please upload a CSV file first.");
      return;
    }
    router.push("/visualize");
  };

  return (
    <main
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      // style={{ backgroundImage: "url('/Perseverance.jpg')" }}
    >
      {/* Card Container */}
      {/* bg-black/100 */}
      <div className="bg-[#0f172a]/50 backdrop-blur-sm rounded-2xl shadow-lg p-10 max-w-2xl w-full text-center space-y-8">
        {/* Title */}
        <h1 className="text-3xl font-bold text-white drop-shadow-lg">
          Rover Instrument Quality <br /> Analysis and Lifespan Prediction
        </h1>

        {/* Description */}
        <p className="text-md text-gray-100 leading-relaxed">
          Inspired by missions like Opportunity and Ingenuity that lasted far longer than expected, we study Perseverance’s telemetry to understand its instruments and make amazing discoveries possible again.
          {/* Space exploration has witnessed countless{" "}
          <span className="font-semibold">“miracles”</span> where spacecraft
          exceeded expectations, thanks to the dedication and ingenuity of engineers.
          Our team aims to harness the power of data to make such extraordinary outcomes
          possible again.{" "}
          <span className="font-bold text-200">Team Miracle</span> is a
          passionate student team based in Chennai, India, pushing the boundaries
          of space science through analysis and innovation. */}
        </p>

        {/* File Upload */}
        <div className="flex flex-col items-center space-y-6">
          <label
            htmlFor="file-upload"
            className="w-64 cursor-pointer rounded-full bg-[#1e293b] px-6 py-4 text-center text-white hover:bg-[#1e293b]/50 transition"
          >
            {file ? file.name : "Add Rover Data"}
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Go Button */}
          {/* // bg-red-100 text-gray-800.   [#1e293b] text-white */}
          <button
            onClick={handleGo}
            className="px-10 py-3 bg-red-100 text-gray-800 font-semibold rounded-full shadow-md hover:bg-red-100 hover:scale-105 transition-transform"
          >
            Upload
          </button>

          {/* Navigation Guide */}
          <p className="text-gray-200 text-sm mt-4">
            New to the app?{" "}  
            <a href="/guide" className="text-blue-300 hover:underline">
               Check out the Navigation Guide
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}






// THE PREVIOUS CODE:
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";

// export default function Home() {
//   const router = useRouter();
//   const [file, setFile] = useState<File | null>(null);

//   // Handle file selection
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const uploadedFile = e.target.files[0];
//       if (uploadedFile.type === "text/csv") {
//         setFile(uploadedFile);
//         // Store temporarily in sessionStorage (clears when tab closes)
//         const reader = new FileReader();
//         reader.onload = (event) => {
//           if (event.target?.result) {
//             sessionStorage.setItem("csvData", event.target.result as string);
//           }
//         };
//         reader.readAsText(uploadedFile);
//       } else {
//         alert("Please upload a valid CSV file.");
//       }
//     }
//   };

//   // Handle Go button click
//   const handleGo = () => {
//     if (!file) {
//       alert("Please upload a CSV file first.");
//       return;
//     }
//     router.push("/visualize"); // Navigate to visualization page
//   };

//   return (
//     <main className="max-w-3xl mx-auto py-16 px-6">
//       {/* Title */}
//       <h1 className="text-4xl font-bold mb-6">
//         Rover Instrument Quality Analysis and Lifespan Prediction
//       </h1>

//       {/* Description */}
//       <p className="text-lg text-gray-700 mb-10">
//         Many so called 'miracles' have happened in space when spacecrafts
//         outperformed/outshined their expectations. These miracles are a
//         testament of the efforts of many engineers and a part of which our team
//         would like to demonstrate. We would like to leverage the power of data
//         to make such miracles happen again. <b>Team Miracle</b> is a student team
//         based in Chennai, India.
//       </p>

//       {/* File upload */}
//       <div className="mb-6">
//         <label
//           htmlFor="file-upload"
//           className="block mb-2 font-semibold text-gray-800"
//         >
//           Upload CSV
//         </label>
//         <input
//           id="file-upload"
//           type="file"
//           accept=".csv"
//           onChange={handleFileChange}
//           className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
//           file:rounded-md file:border-0 file:text-sm file:font-semibold
//           file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//         />
//       </div>

//       {/* Go button */}
//       <button
//         onClick={handleGo}
//         className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
//       >
//         Go →
//       </button>
//     </main>
//   );
// }

// export default function Home() {
//   return (
//     <main className="flex min-h-screen items-center justify-center bg-black text-white">
//       <h1 className="text-4xl font-bold">🚀 NSAC Mission Control</h1>
//       <p className="mt-4 text-lg">Real-time data. Real impact.</p>
//     </main>
//   );
// }


// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
//       <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
//           <li className="mb-2 tracking-[-.01em]">
//             Get started by editing{" "}
//             <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
//               src/app/page.tsx
//             </code>
//             .
//           </li>
//           <li className="tracking-[-.01em]">
//             Save and see your changes instantly.
//           </li>
//         </ol>

//         <div className="flex gap-4 items-center flex-col sm:flex-row">
//           <a
//             className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={20}
//               height={20}
//             />
//             Deploy now
//           </a>
//           <a
//             className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Read our docs
//           </a>
//         </div>
//       </main>
//       <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/file.svg"
//             alt="File icon"
//             width={16}
//             height={16}
//           />
//           Learn
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/window.svg"
//             alt="Window icon"
//             width={16}
//             height={16}
//           />
//           Examples
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/globe.svg"
//             alt="Globe icon"
//             width={16}
//             height={16}
//           />
//           Go to nextjs.org →
//         </a>
//       </footer>
//     </div>
//   );
// }
