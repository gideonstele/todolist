export const todoTableLiteral = '$$id, value, createdAt, updatedAt, isCompleted';
export const todoSchemaName = 'todolist';

export interface TodoRecordItem {
  id: string;
  value: string;
  createdAt: string;
  updatedAt: string;
  isCompleted: boolean;
}

export type AddTodoItemPayload = {
  value: string;
};

export type UpdateTodoItemPayload = {
  id: string;
  value?: string;
  isCompleted?: boolean;
};

export type DeleteTodoItemPayload = {
  id: string;
};
