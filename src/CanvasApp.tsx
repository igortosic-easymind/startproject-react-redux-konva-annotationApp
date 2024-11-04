import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store/store';
import Navbar from './components/Navbar';
import Toolbar from './components/Toolbar';
import PropertiesSidebar from './components/PropertiesSidebar';
import Canvas from './components/canvas/Canvas';
import CreateNotesModal from './components/NotesModal';
import CreateProjectOverlay from './components/CreateProjectOverlay';
import ConfirmationDialog from './components/ConfirmationDialog';
import { setActiveTool } from './store/shapesSlice';
import { 
  fetchProjects, 
  createProject, 
  deleteProject,
  setCurrentProject,
  selectAllProjects,
  selectCurrentProject,
  selectProjectsLoading,
  selectProjectsError
} from './store/projectsSlice';
import { ShapeType } from './types';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";

const CanvasApp: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  
  // Selectors
  const activeTool = useSelector((state: RootState) => state.shapes.activeTool);
  const projects = useSelector(selectAllProjects);
  const currentProject = useSelector(selectCurrentProject);
  const isLoading = useSelector(selectProjectsLoading);
  const error = useSelector(selectProjectsError);

  // Fetch projects on component mount
  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleProjectSelect = useCallback((projectId: string) => {
    dispatch(setCurrentProject(projectId));
  }, [dispatch]);

  const handleToolChange = useCallback((tool: ShapeType | string) => {
    dispatch(setActiveTool(tool));
  }, [dispatch]);

  const handleCreateNewNotes = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleCreateNotes = useCallback(async (title: string, description?: string) => {
    try {
      await dispatch(createProject({ title, description })).unwrap();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  }, [dispatch]);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteProjectId) {
      try {
        await dispatch(deleteProject(deleteProjectId)).unwrap();
      } catch (error) {
        console.error('Failed to delete project:', error);
      } finally {
        setDeleteProjectId(null);
      }
    }
  }, [deleteProjectId, dispatch]);

  const handleDeleteRequest = useCallback(async (projectId: string): Promise<void> => {
    try {
      await dispatch(deleteProject(projectId)).unwrap();
    } catch (error) {
      console.error('Failed to delete project:', error);
      // Optionally rethrow or handle error
      throw error;
    }
  }, [dispatch]);

  return (
    <div className="h-screen w-screen overflow-hidden">
      {/* Error Alert */}
      {error && (
        <div className="fixed top-16 right-4 z-50">
          <Alert variant="destructive" className="flex items-center">
            <AlertDescription>{error}</AlertDescription>
            <button
              onClick={() => dispatch({ type: 'projects/clearProjectError' })}
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </button>
          </Alert>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Navbar 
        onCreateNewNotes={handleCreateNewNotes}
        projects={projects}
        currentProjectId={currentProject?.id || null}
        onProjectSelect={handleProjectSelect}
        onDeleteProject={handleDeleteRequest}
      />

      <div className="relative">
        {currentProject ? (
          <>
            <Toolbar onToolChange={handleToolChange} activeTool={activeTool} />
            <Canvas />
            <PropertiesSidebar />
          </>
        ) : (
          <>
            <Canvas />
            <CreateProjectOverlay onCreateNewNotes={handleCreateNewNotes} />
          </>
        )}
      </div>

      {/* Modals */}
      <CreateNotesModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onCreate={handleCreateNotes}
      />

      <ConfirmationDialog
        isOpen={!!deleteProjectId}
        onClose={() => setDeleteProjectId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone and all associated drawings will be permanently deleted."
        confirmText="Delete Project"
        cancelText="Cancel"
        variant="danger"
        isLoading={isLoading}
      />
    </div>
  );
};

export default CanvasApp;