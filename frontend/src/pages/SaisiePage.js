import React from 'react';
import TaskForm from '../components/TaskForm';

export default function SaisiePage() {
  return (
    <div className="min-h-screen bg-gray-100 py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-2 md:px-4">
        <TaskForm />
      </div>
    </div>
  );
} 