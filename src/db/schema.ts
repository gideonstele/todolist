export const todoTableLiteral = '$$id, value, createdAt, updatedAt';
export const todoSchemaName = 'todolist';

export interface TodoRecordItem {
  id: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export type AddTodoItemPayload = {
  value: string;
};

export type UpdateTodoItemPayload = {
  id: string;
  value: string;
};

export type DeleteTodoItemPayload = {
  id: string;
};
