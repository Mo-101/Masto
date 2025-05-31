export default function HomePage() {
  return (
    <div className="container mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Welcome to the Application</h1>
      <p className="text-xl text-gray-600 mb-8">
        Navigate to the{" "}
        <a href="/map-dashboard" className="text-sky-600 hover:text-sky-800 font-semibold underline">
          Map Dashboard
        </a>{" "}
        to view the interactive map and command center.
      </p>
      <div className="mt-10">
        <a
          href="/map-dashboard"
          className="px-8 py-3 bg-sky-500 text-white text-lg font-medium rounded-lg shadow-md hover:bg-sky-600 transition-colors"
        >
          Go to Map Dashboard
        </a>
      </div>
    </div>
  )
}
