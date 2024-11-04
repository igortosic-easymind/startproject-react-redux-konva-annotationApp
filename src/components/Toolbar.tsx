import React from 'react';
import { Button } from "@/components/ui/button"
import { Square, Circle, Minus, Type, Image, Hand } from 'lucide-react';
import { ShapeType } from '../types/index';

interface ToolbarProps {
  onToolChange: (tool: ShapeType | string) => void;
  activeTool: ShapeType | string | null;
}

interface Tool {
  type: ShapeType | string;
  icon: React.ReactNode;
  label: string;
}

const tools: Tool[] = [
  { type: 'select', icon: <Hand className="h-4 w-4" />, label: 'Select' },
  { type: 'rectangle', icon: <Square className="h-4 w-4" />, label: 'Rectangle' },
  { type: 'circle', icon: <Circle className="h-4 w-4" />, label: 'Circle' },
  { type: 'line', icon: <Minus className="h-4 w-4" />, label: 'Line' },
  { type: 'text', icon: <Type className="h-4 w-4" />, label: 'Text' },
  { type: 'image', icon: <Image className="h-4 w-4" />, label: 'Image' },
];

const Toolbar: React.FC<ToolbarProps> = ({ onToolChange, activeTool }) => {
  return (
    <div className="fixed left-4 top-[60px] h-auto py-2 bg-background border border-input rounded-md shadow-sm z-10">
      <div className="flex flex-col space-y-2">
        {tools.map((tool) => (
          <Button
            key={tool.type}
            variant={activeTool === tool.type ? "secondary" : "ghost"}
            size="icon"
            className="w-10 h-10 relative group"
            onClick={() => onToolChange(tool.type)}
          >
            {tool.icon}
            <span className="sr-only">{tool.label}</span>
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {tool.label}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Toolbar;