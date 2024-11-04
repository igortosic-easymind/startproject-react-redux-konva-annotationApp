import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProjectInput } from '../types';

interface CreateNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, description?: string) => void;
  isLoading?: boolean;
}

const CreateNotesModal: React.FC<CreateNotesModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreate,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState<ProjectInput>({
    title: '',
    description: '',
  });
  const [errors, setErrors] = useState<Partial<ProjectInput>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ProjectInput> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onCreate(formData.title, formData.description);
      handleReset();
    }
  };

  const handleReset = () => {
    setFormData({ title: '', description: '' });
    setErrors({});
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="required">
                Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  title: e.target.value 
                }))}
                placeholder="Enter project title"
                disabled={isLoading}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">
                Description <span className="text-sm text-gray-500">(optional)</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  description: e.target.value 
                }))}
                placeholder="Enter project description"
                disabled={isLoading}
                className={errors.description ? "border-red-500" : ""}
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
              <div className="text-sm text-gray-500 text-right">
                {formData.description?.length || 0}/500
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="ml-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⭘</span>
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNotesModal;