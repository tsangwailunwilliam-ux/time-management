import React, { useState, useRef } from 'react';
import { X, Plus, Trash2, Camera, ExternalLink, ClipboardList } from 'lucide-react';
import { Task, Log } from '../types';
import { compressImage, getFormattedTime } from '../utils';

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
  onUpdateTask: (updatedTask: Task) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onUpdateTask }) => {
  const [newLogText, setNewLogText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  if (!task) return null;

  const handleAddLog = () => {
    if (!newLogText.trim()) return;
    const newLog: Log = {
      id: Date.now().toString(),
      text: newLogText,
      time: getFormattedTime(),
      completed: false,
    };
    const updatedTask = {
      ...task,
      logs: [...(task.logs || []), newLog],
    };
    onUpdateTask(updatedTask);
    setNewLogText('');
  };

  const toggleLogStatus = (logId: string) => {
    const updatedLogs = task.logs.map((log) =>
      log.id === logId ? { ...log, completed: !log.completed } : log
    );
    onUpdateTask({ ...task, logs: updatedLogs });
  };

  const deleteLog = (logId: string) => {
    const updatedLogs = task.logs.filter((log) => log.id !== logId);
    onUpdateTask({ ...task, logs: updatedLogs });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        alert('圖片太大（最大 10MB）');
        return;
      }
      try {
        const compressed = await compressImage(file);
        const updatedTask = {
          ...task,
          images: [...(task.images || []), compressed],
        };
        onUpdateTask(updatedTask);
      } catch (error) {
        console.error('Compression error', error);
      }
      e.target.value = ''; // Reset input
    }
  };

  const deleteImage = (index: number) => {
    if (!confirm('確定要刪除這張圖片嗎？')) return;
    const updatedImages = [...task.images];
    updatedImages.splice(index, 1);
    onUpdateTask({ ...task, images: updatedImages });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-800 break-words pr-4">{task.text}</h2>
            <p className="text-xs text-gray-500 mt-1">建立於: {task.createdTime}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors p-1">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Images Section */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Camera size={16} /> 附件圖片
              </h3>
              <label className="flex items-center gap-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full cursor-pointer transition-colors">
                <Plus size={14} /> 新增照片
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {task.images && task.images.map((src, idx) => (
                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={src}
                    alt={`attachment-${idx}`}
                    className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-110"
                    onClick={() => setLightboxImg(src)}
                  />
                  <button
                    onClick={() => deleteImage(idx)}
                    className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {(!task.images || task.images.length === 0) && (
                <div className="col-span-3 text-center py-6 text-gray-300 italic text-sm border-2 border-dashed border-gray-100 rounded-lg">
                  無附件圖片
                </div>
              )}
            </div>
          </section>

          {/* Logs Section */}
          <section>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ClipboardList size={16} /> 子任務與筆記
            </h3>
            <div className="space-y-3">
              {task.logs && [...task.logs].reverse().map((log) => (
                <div key={log.id} className="group flex gap-3 items-start">
                  <input
                    type="checkbox"
                    checked={log.completed}
                    onChange={() => toggleLogStatus(log.id)}
                    className="mt-1.5 w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className={`flex-grow p-3 rounded-lg transition-colors ${log.completed ? 'bg-gray-50' : 'bg-blue-50/50'}`}>
                    <p className={`text-sm whitespace-pre-wrap ${log.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {log.text}
                    </p>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-black/5">
                        <span className="text-[10px] text-gray-400 font-medium">{log.time}</span>
                        <button 
                            onClick={() => deleteLog(log.id)}
                            className="text-xs text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            刪除
                        </button>
                    </div>
                  </div>
                </div>
              ))}
              {(!task.logs || task.logs.length === 0) && (
                 <div className="text-center py-6 text-gray-300 italic text-sm">
                  尚無紀錄
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer Input */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={newLogText}
              onChange={(e) => setNewLogText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddLog()}
              placeholder="新增子任務或筆記..."
              className="flex-grow px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleAddLog}
              disabled={!newLogText.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              新增
            </button>
          </div>
        </div>
      </div>

      {/* Simple Lightbox */}
      {lightboxImg && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white">
            <X size={32} />
          </button>
          <img
            src={lightboxImg}
            alt="Full size"
            className="max-w-full max-h-full rounded shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
};