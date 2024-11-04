import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CreateProjectOverlayProps {
  onCreateNewNotes: () => void;
}

const CreateProjectOverlay: React.FC<CreateProjectOverlayProps> = ({ onCreateNewNotes }) => {
  return (
    <div className="absolute inset-0 bg-slate-100/90 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">Create a project to start drawing</h2>
        <Button onClick={onCreateNewNotes} variant="default" size="lg">
          <Plus className="mr-2 h-5 w-5" /> Create New Project
        </Button>
      </div>
    </div>
  );
};

export default CreateProjectOverlay;