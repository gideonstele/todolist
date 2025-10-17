import 'dexie-observable';
import Dexie, { Entity, type EntityTable } from 'dexie';
import {
  todoTableLiteral,
  todoSchemaName,
  type AddTodoItemPayload,
  type DeleteTodoItemPayload,
  type TodoRecordItem,
  type UpdateTodoItemPayload,
} from './schema';
import dayjs from 'dayjs';

class TodoModel extends Entity<TodoListService> implements TodoRecordItem {
  id!: string;
  value!: string;
  createdAt!: string;
  updatedAt!: string;
}

export class TodoListService extends Dexie {
  private static instance: TodoListService;

  static getInstance(): TodoListService {
    if (!TodoListService.instance) {
      TodoListService.instance = new TodoListService();
    }
    return TodoListService.instance;
  }

  constructor() {
    super(todoSchemaName);
    this.version(1).stores({
      todoTable: todoTableLiteral,
    });
    this.todoTable.mapToClass(TodoModel);
  }

  private todoTable!: EntityTable<TodoModel, 'id'>;

  async all(): Promise<TodoRecordItem[]> {
    return await this.todoTable.orderBy('updatedAt').reverse().toArray();
  }

  async addItem(payload: AddTodoItemPayload): Promise<TodoRecordItem> {
    const now = dayjs().format();

    const record = {
      value: payload.value,
      createdAt: now,
      updatedAt: now,
    };

    const id = await this.todoTable.add(record);

    return {
      id,
      ...record,
    } as TodoRecordItem;
  }

  async updateItem(payload: UpdateTodoItemPayload): Promise<number> {
    const now = dayjs().format();

    console.log('updateItem', payload);

    return await this.todoTable.update(payload.id, {
      value: payload.value,
      updatedAt: now,
    });
  }

  async deleteItem(payload: DeleteTodoItemPayload): Promise<void> {
    return await this.todoTable.delete(payload.id);
  }

  async addBulkItems(payload: AddTodoItemPayload[]): Promise<void> {
    const now = dayjs().format();

    const records = payload.map((item) => ({
      value: item.value,
      createdAt: now,
      updatedAt: now,
    }));

    await this.todoTable.bulkAdd(records);
  }
}

export const todoListService = TodoListService.getInstance();
