import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Link } from 'react-router-dom';
import { Plus, Trash2, Save } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Project } from '../types';
import { selectIsDirty, selectIsLoading, saveShapes } from '../store/shapesSlice';
import { AppDispatch } from '../store/store';
import { useDispatch, useSelector } from 'react-redux';
import ConfirmationDialog from './ConfirmationDialog';

interface NavbarProps {
  onCreateNewNotes: () => void;
  projects: Project[];
  currentProjectId: string | null;
  onProjectSelect: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onCreateNewNotes, 
  projects, 
  currentProjectId, 
  onProjectSelect, 
  onDeleteProject 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const isDirty = useSelector(selectIsDirty);
  const isSaving = useSelector(selectIsLoading);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleSave = async () => {
    if (currentProjectId && isDirty) {
      try {
        await dispatch(saveShapes(currentProjectId)).unwrap();
      } catch (error) {
        console.error('Failed to save shapes:', error);
      }
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (currentProjectId) {
      await onDeleteProject(currentProjectId);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-20">
      <nav className="bg-white border-b border-gray-300 shadow-sm px-4 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Select onValueChange={onProjectSelect} value={currentProjectId || undefined}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={onCreateNewNotes} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" /> Create New Project
          </Button>
          {currentProjectId && (
            <>
              <Button 
                onClick={handleDeleteClick}
                variant="outline" 
                size="sm"
                className="text-red-500 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Project
              </Button>
              <Button
                onClick={handleSave}
                disabled={!isDirty || isSaving}
                variant="outline"
                size="sm"
                className={isDirty ? 'text-blue-500 hover:bg-blue-50' : ''}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </div>
        <h1 className="text-lg font-semibold">EasyNotes Canvas</h1>
        <div className="flex items-center space-x-4">
          <Link to="/logout">
            <Button variant="ghost">Logout</Button>
          </Link>
        </div>
      </nav>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone and all associated drawings will be permanently deleted."
        confirmText="Delete Project"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default Navbar;