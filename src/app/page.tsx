import Image from "next/image";
import PdfUploader from '@/components/PdfUploader';

export default function Home() {
  return (
    <div className="grid grid-rows-[auto,1fr,auto] min-h-screen">
      <header className="bg-black text-white py-4 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold">SalaryGenkit</h1>
        </div>
      </header>
      
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Resume Salary Analyzer
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload your resume to get an AI-powered salary estimate based on your skills,
              experience, and current market conditions in Sweden.
            </p>
          </div>
          <PdfUploader />
        </div>
      </main>

      <footer className="bg-black text-white py-4 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center">
          <a
            href="https://nextjs.org/docs"
            className="group rounded-lg border border-transparent px-4 py-3 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className="text-lg sm:text-xl font-semibold">
              Learn{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
          </a>

          <a
            href="https://nextjs.org/docs"
            className="group rounded-lg border border-transparent px-4 py-3 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className="text-lg sm:text-xl font-semibold">
              Examples{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
          </a>

          <a
            href="https://nextjs.org/docs"
            className="group rounded-lg border border-transparent px-4 py-3 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className="text-lg sm:text-xl font-semibold">
              Go to nextjs.org{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
          </a>
        </div>
      </footer>
    </div>
  );
}
