import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { TaskDashboard } from "./pages/TaskDashboard";
import { TaskDetail } from "./pages/TaskDetail";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-gray-900 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-sm">
                AI
              </div>
              <h1 className="text-xl font-bold">AI Task Orchestrator</h1>
            </Link>
            <div className="text-sm text-gray-400">
              Planner / Builder / Validator Pipeline
            </div>
          </div>
        </header>

        {/* Content */}
        <main>
          <Routes>
            <Route path="/" element={<TaskDashboard />} />
            <Route path="/tasks/:id" element={<TaskDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
