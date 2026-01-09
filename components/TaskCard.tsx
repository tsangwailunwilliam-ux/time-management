import React from 'react';
import { Trash2, CheckSquare, Image as ImageIcon, ClipboardList } from 'lucide-react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onClick: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onDelete,
  onToggleComplete,
  onClick,
  onDragStart,
}) => {
  const logCount = task.logs ? task.logs.length : 0;
  const imgCount = task.images ? task.images.length : 0;
  const hasContent = logCount > 0 || imgCount > 0;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onClick(task.id)}
      className={`
        relative group p-3 mb-3 rounded-lg border-l-4 shadow-sm cursor-pointer transition-all duration-200
        hover:shadow-md hover:-translate-y-0.5
        ${task.completed ? 'bg-gray-100 border-gray-300 opacity-60' : 'bg-white border-transparent'}
        ${!task.completed && task.category === 'work' ? 'hover:border-primary' : ''}
        ${!task.completed && task.category === 'personal' ? 'hover:border-personal' : ''}
      `}
    >
      <div className="flex justify-between items-start gap-3">
        <span
          className={`text-base font-medium flex-grow break-all ${
            task.completed ? 'line-through text-gray-500' : 'text-gray-800'
          }`}
        >
          {task.text}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(task.id);
            }}
            className={`transition-colors ${task.completed ? 'text-green-500' : 'text-gray-300 hover:text-green-500'}`}
          >
            <CheckSquare size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="text-gray-300 hover:text-red-500 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex justify-between items-end mt-2">
        <div className={`flex items-center gap-3 text-xs font-medium ${hasContent ? 'opacity-100' : 'opacity-0'} text-gray-400 transition-opacity`}>
            {logCount > 0 && (
                <span className="flex items-center gap-1">
                    <ClipboardList size={14} /> {logCount}
                </span>
            )}
            {imgCount > 0 && (
                <span className="flex items-center gap-1">
                    <ImageIcon size={14} /> {imgCount}
                </span>
            )}
        </div>
        <span className="text-xs text-gray-400 font-mono">{task.createdTime}</span>
      </div>
    </div>
  );
};