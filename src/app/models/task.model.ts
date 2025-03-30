export interface Task {
    id: number;
    title: string;
    description?: string;
    dueDate?: string;        
    project?: string;
    assignedTo?: string;     
    status: 'To-Do' | 'In Progress' | 'Done';
}
  