import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList, ActivityIndicator, Modal, TouchableOpacity, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [todoText, setTodoText] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [filter, setFilter] = useState('all');
  const [priority, setPriority] = useState('Low');

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    setLoading(true);
    try {
      const storedTodos = await AsyncStorage.getItem('todos');
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos));
      }
    } catch (error) {
      console.error("Error loading todos from storage", error);
    }
    setLoading(false);
  };

  const saveTodos = async (newTodos) => {
    try {
      await AsyncStorage.setItem('todos', JSON.stringify(newTodos));
      setTodos(newTodos);
    } catch (error) {
      console.error("Error saving todos to storage", error);
    }
  };

  const addTodo = () => {
    if (todoText.trim()) {
      const newTodo = {
        id: uuidv4(),
        text: todoText,
        completed: false,
        priority: priority,
      };
      const updatedTodos = [...todos, newTodo];
      saveTodos(updatedTodos);
      setTodoText('');
      setPriority('Low');
    }
  };

  const editTodo = () => {
    if (todoText.trim() && selectedTodo) {
      const updatedTodos = todos.map(todo => 
        todo.id === selectedTodo.id ? { ...todo, text: todoText, priority: priority } : todo
      );
      saveTodos(updatedTodos);
      setTodoText('');
      setIsEdit(false);
      setSelectedTodo(null);
      setPriority('Low');
    }
  };

  const deleteTodo = (id) => {
    const filteredTodos = todos.filter(todo => todo.id !== id);
    saveTodos(filteredTodos);
    setModalVisible(false);
  };

  const confirmDelete = (todo) => {
    setSelectedTodo(todo);
    setModalVisible(true);
  };

  const markComplete = (id) => {
    const updatedTodos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos(updatedTodos);
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'completed') return todo.completed;
    if (filter === 'active') return !todo.completed;
    return true;
  });

  const handleSave = () => {
    if (isEdit) {
      editTodo();
    } else {
      addTodo();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TODO List</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter new TODO..."
          placeholderTextColor="#B0B0B0"
          value={todoText}
          onChangeText={setTodoText}
        />
        <View style={styles.priorityContainer}>
          <Text style={styles.priorityLabel}>Priority: </Text>
          <Button title="Low" onPress={() => setPriority('Low')} color={priority === 'Low' ? '#4CAF50' : '#555'} />
          <Button title="Medium" onPress={() => setPriority('Medium')} color={priority === 'Medium' ? '#FFC107' : '#555'} />
          <Button title="High" onPress={() => setPriority('High')} color={priority === 'High' ? '#F44336' : '#555'} />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleSave}>
          <Text style={styles.addButtonText}>{isEdit ? "Edit TODO" : "Add TODO"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={() => setFilter('all')}>
          <Text style={[styles.filterButton, filter === 'all' && styles.activeFilter]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('active')}>
          <Text style={[styles.filterButton, filter === 'active' && styles.activeFilter]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('completed')}>
          <Text style={[styles.filterButton, filter === 'completed' && styles.activeFilter]}>Completed</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredTodos}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <TouchableOpacity onPress={() => markComplete(item.id)}>
              <Text style={[styles.todoText, item.completed && styles.completedText]}>
                {item.text} ({item.priority})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmDelete(item)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text>Are you sure you want to delete this todo?</Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={() => deleteTodo(selectedTodo.id)}>
              <Text style={styles.modalButtonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#4CAF50',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    color: '#FFF',
    backgroundColor: '#333',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priorityLabel: {
    fontSize: 16,
    color: '#FFF',
  },
  todoItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todoText: {
    fontSize: 18,
    color: '#FFF',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  deleteText: {
    color: '#F44336',
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  filterButton: {
    color: '#B0B0B0',
    fontSize: 16,
  },
  activeFilter: {
    color: '#4CAF50',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#333',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  modalButton: {
    margin: 10,
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  modalButtonText: {
    color: '#FFF',
  },
});
