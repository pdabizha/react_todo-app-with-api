/* eslint-disable jsx-a11y/label-has-associated-control */
import cn from 'classnames';
import { Todo } from '../../types/Todo';
import { useCallback, useRef, useState } from 'react';
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

  const inputRef = useRef<HTMLInputElement | null>(null);

  const toggleTodoCompletion = (todo: Todo) => {
    onUpdate({ ...todo, completed: !todo.completed });
  };

  const handleTodoEdit = useCallback((todo: Todo) => {
    setEditingTodoId(todo.id);
    setValue(todo.title);
  }, []);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value);
    },
    [],
  );

  const updateTodoTitle = useCallback(
    async (todo: Todo) => {
      if (value.trim() === '') {
        onDelete(todo.id);

        return;
      }

      try {
        await onUpdate({ ...todo, title: value.trim() });
        setEditingTodoId(null);
      } catch (error) {
        inputRef.current?.focus();
      }
    },
    [value, onUpdate, onDelete],
  );

  const handleKeyDown = useCallback(
    async (event: React.KeyboardEvent<HTMLInputElement>, todo: Todo) => {
      if (event.key === 'Enter') {
        if (todo.title === value.trim()) {
          setEditingTodoId(null);

          return;
        }

        updateTodoTitle(todo);
      } else if (event.key === 'Escape') {
        setEditingTodoId(null);
      }
    },
    [updateTodoTitle],
  );

  const handleDeleteTodo = (id: number) => {
    onDelete(id);
  };

  const handleBlur = useCallback(
    (todo: Todo) => {
      if (value !== todo.title) {
        updateTodoTitle(todo);
      } else {
        setEditingTodoId(null);
      }
    },
    [value, updateTodoTitle],
  );

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
                    onChange={() => toggleTodoCompletion(todo)}
                  />
                </label>

                {editingTodoId === todo.id ? (
                  <form onSubmit={e => e.preventDefault()}>
                    <input
                      ref={inputRef}
                      data-cy="TodoTitleField"
                      type="text"
                      className="todo__title-field"
                      placeholder="Empty todo will be deleted"
                      value={value}
                      onChange={handleChange}
                      onKeyDown={event => handleKeyDown(event, todo)}
                      onBlur={() => handleBlur(todo)}
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
                      onClick={() => handleDeleteTodo(todo.id)}
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
