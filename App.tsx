import React, { useState, useEffect, useMemo } from 'react';
import { Briefcase, Home, Plus, AlertCircle, Clock, Battery, Coffee } from 'lucide-react';
import { Task, Category, QuadrantId, QUADRANT_CONFIG } from './types';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { getFormattedTime } from './utils';

const STORAGE_KEY = 'eisenhower_matrix_v9_react';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentView, setCurrentView] = useState<Category>('work');
  const [isImportant, setIsImportant] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Load from Storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTasks(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load tasks", error);
    }
  }, []);

  // Save to Storage
  useEffect(() => {
    if (tasks.length > 0) { // Avoid overwriting with empty array on initial render if logic fails
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
            triggerToast();
        } catch (e) {
            alert('儲存空間已滿！請刪除一些圖片。');
        }
    } else if (localStorage.getItem(STORAGE_KEY)) {
        // Handle case where we genuinely deleted everything
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  }, [tasks]);

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleAddTask = () => {
    if (!inputValue.trim()) return;

    let quadrant: QuadrantId = 'q4';
    if (isImportant && isUrgent) quadrant = 'q1';
    else if (isImportant && !isUrgent) quadrant = 'q2';
    else if (!isImportant && isUrgent) quadrant = 'q3';

    const newTask: Task = {
      id: `task-${Date.now()}`,
      text: inputValue.trim(),
      quadrant,
      category: currentView,
      completed: false,
      createdTime: getFormattedTime(),
      logs: [],
      images: [],
    };

    setTasks([...tasks, newTask]);
    setInputValue('');
    setIsImportant(false);
    setIsUrgent(false);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('確定要刪除此事項嗎？')) {
      setTasks(tasks.filter((t) => t.id !== id));
    }
  };

  const handleToggleComplete = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setSelectedTask(updatedTask); // Keep modal updated
  };

  // Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetQuadrant: QuadrantId) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const task = tasks.find((t) => t.id === id);
    
    if (task && task.quadrant !== targetQuadrant) {
      setTasks(tasks.map((t) => (t.id === id ? { ...t, quadrant: targetQuadrant } : t)));
    }
  };

  const filteredTasks = useMemo(() => tasks.filter(t => t.category === currentView), [tasks, currentView]);

  const getThemeColor = () => currentView === 'work' ? 'text-primary' : 'text-personal';
  const getThemeBorder = () => currentView === 'work' ? 'border-primary' : 'border-personal';
  const getThemeBg = () => currentView === 'work' ? 'bg-primary' : 'bg-personal';

  return (
    <div className="min-h-screen pb-10 flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-white shadow-sm border-b border-gray-100 mb-8 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-light text-gray-700 tracking-tight">
            時間管理<span className="font-bold text-gray-900">矩陣</span>
          </h1>
          
          {/* View Toggle */}
          <div className="bg-gray-100 p-1 rounded-full flex">
            <button
              onClick={() => setCurrentView('work')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                currentView === 'work' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Briefcase size={16} /> 工作
            </button>
            <button
              onClick={() => setCurrentView('personal')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                currentView === 'personal' ? 'bg-white text-personal shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Home size={16} /> 個人
            </button>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className={`w-full max-w-4xl mx-4 mb-8 bg-white p-5 rounded-2xl shadow-lg border-t-4 transition-colors duration-300 ${getThemeBorder()}`}>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder={`新增${currentView === 'work' ? '工作' : '個人'}事項...`}
            className="flex-grow w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-all outline-none"
            style={{ '--tw-ring-color': currentView === 'work' ? '#339af0' : '#20c997' } as React.CSSProperties}
          />
          
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isImportant ? 'bg-red-500 border-red-500' : 'border-gray-300 group-hover:border-red-400'}`}>
                   {isImportant && <Plus size={14} className="text-white" />}
                </div>
                <input type="checkbox" className="hidden" checked={isImportant} onChange={(e) => setIsImportant(e.target.checked)} />
                <span className={`text-sm font-medium ${isImportant ? 'text-red-500' : 'text-gray-500'}`}>重要</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isUrgent ? 'bg-yellow-500 border-yellow-500' : 'border-gray-300 group-hover:border-yellow-400'}`}>
                   {isUrgent && <Plus size={14} className="text-white" />}
                </div>
                <input type="checkbox" className="hidden" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} />
                <span className={`text-sm font-medium ${isUrgent ? 'text-yellow-500' : 'text-gray-500'}`}>緊急</span>
              </label>
            </div>

            <button
              onClick={handleAddTask}
              className={`px-6 py-3 rounded-xl text-white font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all ${getThemeBg()}`}
            >
              新增事項
            </button>
          </div>
        </div>
      </div>

      {/* Matrix Grid */}
      <div className="w-full max-w-6xl px-4 grid grid-cols-1 md:grid-cols-2 gap-6 h-auto md:h-[calc(100vh-250px)]">
        {(Object.keys(QUADRANT_CONFIG) as QuadrantId[]).map((qId) => {
          const config = QUADRANT_CONFIG[qId];
          const qTasks = filteredTasks.filter((t) => t.quadrant === qId);

          return (
            <div
              key={qId}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, qId)}
              className={`
                flex flex-col rounded-2xl border-t-[6px] shadow-sm overflow-hidden h-full min-h-[300px] transition-colors
                ${config.bg} ${config.border}
              `}
            >
              <div className="p-4 bg-white/50 backdrop-blur-sm border-b border-black/5 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-gray-700 text-lg">{config.title}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold opacity-70">{config.subtitle}</p>
                </div>
                <div className="text-2xl opacity-20 text-gray-500">
                    {qId === 'q1' && <AlertCircle />}
                    {qId === 'q2' && <Clock />}
                    {qId === 'q3' && <Battery />}
                    {qId === 'q4' && <Coffee />}
                </div>
              </div>
              
              <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
                {qTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDelete={handleDeleteTask}
                    onToggleComplete={handleToggleComplete}
                    onClick={() => setSelectedTask(task)}
                    onDragStart={handleDragStart}
                  />
                ))}
                {qTasks.length === 0 && (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm italic opacity-60 pointer-events-none">
                        拖放事項至此
                    </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals & Overlays */}
      <TaskModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={handleUpdateTask}
      />

      {/* Toast Notification */}
      <div
        className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg transition-all duration-300 pointer-events-none ${
          showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        已自動儲存
      </div>
    </div>
  );
};

export default App;