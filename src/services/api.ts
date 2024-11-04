import { Project, ProjectOut, ProjectInput, ShapeBatchOperation, ShapeResponse } from '../types';

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private baseUrl: string;
  private storage = window.localStorage;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
  }

  // Auth methods
  async login(credentials: { username: string; password: string }) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(
          errorData.message || 'Login failed',
          response.status,
          errorData
        );
      }

      const data = await response.json();
      this.setToken(data.token);
      return data;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  }

  async logout(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new ApiError('Logout failed', response.status);
      }
    } finally {
      this.clearToken();
    }
  }

  // Project methods
  async getProjects(): Promise<Project[]> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new ApiError('Failed to fetch projects', response.status);
      }

      const projects: ProjectOut[] = await response.json();
      // Convert backend format to frontend format and merge with local storage shapes
      return projects.map(p => this.convertToFrontendProject(p));
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError('Failed to fetch projects');
    }
  }

  async createProject(name: string, description?: string): Promise<Project> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          title: name,
          description,
          is_public: false, // default to private
        }),
      });

      if (!response.ok) {
        throw new ApiError('Failed to create project', response.status);
      }

      const project: ProjectOut = await response.json();
      return this.convertToFrontendProject(project);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError('Failed to create project');
    }
  }

  async updateProject(projectId: string, data: Partial<ProjectInput>): Promise<Project> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new ApiError('Failed to update project', response.status);
      }

      const project: ProjectOut = await response.json();
      return this.convertToFrontendProject(project);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError('Failed to update project');
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new ApiError('Failed to delete project', response.status);
      }
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError('Failed to delete project');
    }
  }

  // Shape methods
  async getProjectShapes(projectId: string): Promise<ShapeResponse[]> {
    try {
      const response = await fetch(`${this.baseUrl}/shapes/${projectId}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new ApiError('Failed to fetch shapes', response.status);
      }

      return await response.json();
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError('Failed to fetch shapes');
    }
  }

  async saveShapes(operation: ShapeBatchOperation) {
    try {
      // Prepare the batch operations
      const promises: Promise<Response>[] = [];

      // Handle added shapes
      if (operation.added.length > 0) {
        promises.push(
          fetch(`${this.baseUrl}/shapes/${operation.projectId}`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(operation.added),
          })
        );
      }

      // Handle updated shapes - now sending as a list to a single project endpoint
      if (operation.updated.length > 0) {
        promises.push(
          fetch(`${this.baseUrl}/shapes/${operation.projectId}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(operation.updated), // Send the entire array of updates
          })
        );
      }

      // Handle deleted shapes
      if (operation.deleted.length > 0) {
        promises.push(
          fetch(`${this.baseUrl}/shapes/${operation.projectId}/shapes`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(operation.deleted), // Send the entire array of updates
          })
        );
      }

      // Wait for all operations to complete
      const results = await Promise.allSettled(promises);

      // Process results
      const response = {
        added: [] as ShapeResponse[],
        updated: [] as ShapeResponse[],
        deleted: operation.deleted,
      };

      // Helper to parse JSON response
      const parseResponse = async (result: PromiseSettledResult<Response>) => {
        if (result.status === 'fulfilled' && result.value.ok) {
          if (result.value.status !== 204) { // Skip parsing for DELETE operations
            return await result.value.json();
          }
        }
        return null;
      };

      // Process added shapes response
      if (operation.added.length > 0) {
        const addedResult = results[0];
        if (addedResult.status === 'fulfilled' && addedResult.value.ok) {
          response.added = await parseResponse(addedResult) || [];
        }
      }

      // Process updated shapes responses
      const updatedResults = results.slice(
        operation.added.length ? 1 : 0,
        operation.added.length + operation.updated.length
      );
      
      for (const result of updatedResults) {
        if (result.status === 'fulfilled' && result.value.ok) {
          const updatedShape = await parseResponse(result);
          if (updatedShape) {
            response.updated.push(updatedShape);
          }
        }
      }

      return response;

    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError('Failed to save shapes');
    }
  }

  // Private helper methods
  private getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  private setToken(token: string): void {
    this.storage.setItem('auth_token', token);
  }

  private getToken(): string | null {
    return this.storage.getItem('auth_token');
  }

  private clearToken(): void {
    this.storage.removeItem('auth_token');
  }

  private convertToFrontendProject(backendProject: ProjectOut): Project {
    // Get shapes from localStorage if they exist
    const storedShapes = this.storage.getItem(`project_shapes_${backendProject.id}`);
    const shapes = storedShapes ? JSON.parse(storedShapes) : [];

    return {
      id: backendProject.id.toString(),
      name: backendProject.title,
      shapes,
    };
  }
}

export const apiService = new ApiService();