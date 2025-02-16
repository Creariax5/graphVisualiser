import ClientGraph from './components/ClientGraph';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white font-[family-name:var(--font-geist-sans)]">
          Graph Visualization
        </h1>
      </nav>

      <main className="flex-1 p-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
          <div className="h-[760px] w-full">
            <ClientGraph />
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center font-[family-name:var(--font-geist-mono)]">
          By Florian DEMARINI
        </p>
      </footer>
    </div>
  );
}