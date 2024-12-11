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
      };
      const updatedTodos = [...todos, newTodo];
      saveTodos(updatedTodos);
      setTodoText('');
    }
  };

  const editTodo = () => {
    if (todoText.trim() && selectedTodo) {
      const updatedTodos = todos.map(todo => 
        todo.id === selectedTodo.id ? { ...todo, text: todoText } : todo
      );
      saveTodos(updatedTodos);
      setTodoText('');
      setIsEdit(false);
      setSelectedTodo(null);
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

  const startEdit = (todo) => {
    setTodoText(todo.text);
    setIsEdit(true);
    setSelectedTodo(todo);
  };

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
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TODO List</Text>

      {/* Form to Add/Edit TODO */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter new TODO..."
          value={todoText}
          onChangeText={setTodoText}
        />
        <Button title={isEdit ? "Edit TODO" : "Add TODO"} onPress={handleSave} />
      </View>

      {/* TODO List Display */}
      <FlatList
        data={todos}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <TouchableOpacity onPress={() => startEdit(item)}>
              <Text style={styles.todoText}>{item.text}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmDelete(item)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Modal Confirmation */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text>Are you sure you want to delete this todo?</Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => deleteTodo(selectedTodo.id)}
            >
              <Text style={styles.modalButtonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
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
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
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
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  todoItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todoText: {
    fontSize: 18,
  },
  deleteText: {
    color: 'red',
    fontSize: 16,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: 'white',
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
    justifyContent: 'space-around',
    marginTop: 20,
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    color: 'white',
  },
});
