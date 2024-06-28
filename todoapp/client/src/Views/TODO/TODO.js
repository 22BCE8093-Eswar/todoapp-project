import { useEffect, useState } from 'react';
import Styles from './TODO.module.css';
import axios from 'axios';

export function TODO() {
    const [newTodo, setNewTodo] = useState('');
    const [todoData, setTodoData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editTodoId, setEditTodoId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    useEffect(() => {
        const fetchTodo = async () => {
            const apiData = await getTodo();
            setTodoData(apiData);
            setLoading(false);
        };
        fetchTodo();
    }, []);

    const getTodo = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/todo');
            return response.data;
        } catch (err) {
            console.log(err);
            return [];
        }
    };

    const addTodo = async () => {
        try {
            const response = await axios.post('http://localhost:8000/api/todo', { title: newTodo });
            setTodoData([...todoData, response.data.newTodo]);
            setNewTodo('');
        } catch (err) {
            console.log(err);
        }
    };

    const deleteTodo = async (id) => {
        try {
            await axios.delete(`http://localhost:8000/api/todo/${id}`);
            setTodoData(todoData.filter(todo => todo._id !== id));
        } catch (err) {
            console.log(err);
        }
    };

    const startEditTodo = (todo) => {
        setEditTodoId(todo._id);
        setEditTitle(todo.title);
        setEditDescription(todo.description || '');
    };

    const cancelEdit = () => {
        setEditTodoId(null);
        setEditTitle('');
        setEditDescription('');
    };

    const saveEditTodo = async (id) => {
        try {
            const updatedTodo = { title: editTitle, description: editDescription };
            const response = await axios.patch(`http://localhost:8000/api/todo/${id}`, updatedTodo);
            setTodoData(todoData.map(todo => (todo._id === id ? response.data : todo)));
            cancelEdit();
        } catch (err) {
            console.log(err);
        }
    };

    const toggleDone = async (id, done) => {
        try {
            const response = await axios.patch(`http://localhost:8000/api/todo/${id}`, { done: !done });
            setTodoData(todoData.map(todo => (todo._id === id ? response.data : todo)));
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className={Styles.ancestorContainer}>
            <div className={Styles.headerContainer}>
                <h1>Tasks</h1>
                <span>
                    <input
                        className={Styles.todoInput}
                        type='text'
                        value={newTodo}
                        onChange={(event) => setNewTodo(event.target.value)}
                    />
                    <button
                        className={Styles.addButton}
                        onClick={addTodo}
                    >
                        + New Todo
                    </button>
                </span>
            </div>
            <div className={Styles.todoContainer}>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    todoData.length > 0 ? (
                        todoData.map((todo) => (
                            <div key={todo._id} className={`${Styles.todo} ${todo.done ? Styles.done : ''}`}>
                                <input
                                    type='checkbox'
                                    checked={todo.done}
                                    onChange={() => toggleDone(todo._id, todo.done)}
                                    className={Styles.todoCheckbox}
                                />
                                {editTodoId === todo._id ? (
                                    <div className={Styles.todoEditContainer}>
                                        <input
                                            type='text'
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className={Styles.todoEditInput}
                                        />
                                        <textarea
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            className={Styles.todoEditTextarea}
                                        />
                                        <button onClick={() => saveEditTodo(todo._id)}>Save</button>
                                        <button onClick={cancelEdit}>Cancel</button>
                                    </div>
                                ) : (
                                    <div className={Styles.todoContentContainer}>
                                        <span className={Styles.infoContainer}>
                                            <span className={Styles.todoTitle}>{todo.title}</span>
                                            <p className={Styles.todoDescription}>{todo.description}</p>
                                        </span>
                                        <span className={Styles.actionButtons}>
                                            <button onClick={() => startEditTodo(todo)}>Edit</button>
                                            <button onClick={() => deleteTodo(todo._id)}>Delete</button>
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No tasks available. Please add a new task.</p>
                    )
                )}
            </div>
        </div>
    );
}
