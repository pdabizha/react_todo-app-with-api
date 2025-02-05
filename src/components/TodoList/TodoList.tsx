/* eslint-disable jsx-a11y/label-has-associated-control */
import cn from 'classnames';
import { Todo } from '../../types/Todo';
import { useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

type Props = {
  listOfTodos: Todo[];
  onUpdate: (todo: Todo) => void;
  onDelete: (todoId: number) => void;
  savingTodoIds: number[];
  tempTodo?: Todo | null;
};

export const TodoList: React.FC<Props> = ({
  listOfTodos,
  onUpdate,
  onDelete,
  savingTodoIds,
  tempTodo,
}) => {
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [value, setValue] = useState('');

  const handleTodoEdit = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setValue(todo.title);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleBlur = () => {
    setEditingTodoId(null);
  };

  const handleTodoChange = (
    { key, val }: { key: keyof Todo; val: Todo[keyof Todo] },
    todo: Todo,
  ) => {
    const updatedTodo: Todo = {
      ...todo,
      [key]: val,
    };

    onUpdate(updatedTodo);
  };

  const handleKeyDown = async (
    event: React.KeyboardEvent<HTMLInputElement>,
    todo: Todo,
  ) => {
    if (event.key === 'Enter') {
      if (value === '') {
        onDelete(todo.id);

        return;
      }

      if (value === todo.title) {
        setEditingTodoId(null);

        return;
      }

      try {
        await onUpdate({ ...todo, title: value.trim() });
        setEditingTodoId(null);
      } catch (error) {
        const inputElement =
          document.querySelector<HTMLInputElement>('.todo__title-field');

        if (inputElement) {
          inputElement.focus();
        }
      }

      // onUpdate({ ...todo, title: value.trim() });
      // setEditingTodoId(null);
    }

    if (event.key === 'Escape') {
      handleBlur();
    }
  };

  const handleDelieteTodo = (id: number) => {
    onDelete(id);
  };

  return (
    <section className="todoapp__main" data-cy="TodoList">
      <TransitionGroup>
        {listOfTodos.map(todo => {
          const isSaving = savingTodoIds.includes(todo.id);

          return (
            <CSSTransition key={todo.id} timeout={300} classNames="todo item">
              <div
                data-cy="Todo"
                className={cn('todo', { completed: todo.completed })}
              >
                <label className="todo__status-label">
                  <input
                    data-cy="TodoStatus"
                    type="checkbox"
                    className="todo__status"
                    checked={todo.completed}
                    onChange={() =>
                      handleTodoChange(
                        { key: 'completed', val: !todo.completed },
                        todo,
                      )
                    }
                  />
                </label>

                {editingTodoId === todo.id ? (
                  <form onSubmit={e => e.preventDefault()}>
                    <input
                      data-cy="TodoTitleField"
                      type="text"
                      className="todo__title-field"
                      placeholder="Empty todo will be deleted"
                      value={value}
                      onChange={handleChange}
                      onKeyDown={event => handleKeyDown(event, todo)}
                      onBlur={handleBlur}
                      // disabled={isDisabled}
                      autoFocus
                    />
                  </form>
                ) : (
                  <>
                    {' '}
                    <span
                      data-cy="TodoTitle"
                      className="todo__title"
                      onDoubleClick={() => handleTodoEdit(todo)}
                    >
                      {todo.title}
                    </span>
                    <button
                      type="button"
                      className="todo__remove"
                      data-cy="TodoDelete"
                      onClick={() => handleDelieteTodo(todo.id)}
                    >
                      ×
                    </button>
                  </>
                )}
                <div
                  data-cy="TodoLoader"
                  className={cn('modal overlay', {
                    'is-active': isSaving,
                  })}
                >
                  <div className="modal-background has-background-white-ter" />
                  <div className="loader" />
                </div>
              </div>
            </CSSTransition>
          );
        })}
        {tempTodo && (
          <CSSTransition key="temp" timeout={300} classNames="temp-item">
            <div data-cy="Todo" className="todo">
              <label className="todo__status-label">
                <input
                  data-cy="TodoStatus"
                  type="checkbox"
                  className="todo__status"
                />
              </label>
              <span data-cy="TodoTitle" className="todo__title">
                {tempTodo.title}
              </span>
              <div data-cy="TodoLoader" className="modal overlay is-active">
                <div className="modal-background has-background-white-ter" />
                <div className="loader" />
              </div>
            </div>
          </CSSTransition>
        )}
      </TransitionGroup>
    </section>
  );
};
