import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [db, setDb] = useState(null);

  useEffect(() => {
    initDatabase();
  }, []);

  const initDatabase = async () => {
    const database = await SQLite.openDatabaseAsync('notes.db');
    setDb(database);
    
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    loadNotes(database);
  };

  const loadNotes = async (database) => {
    const result = await database.getAllAsync(
      'SELECT * FROM notes ORDER BY created_at DESC'
    );
    setNotes(result || []);
  };

  const addNote = async () => {
    if (!title.trim() || !text.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }
    await db.runAsync('INSERT INTO notes (title, text) VALUES (?, ?)', [title, text]);
    loadNotes(db);
    setTitle('');
    setText('');
  };

  const deleteNote = async (id) => {
    await db.runAsync('DELETE FROM notes WHERE id = ?', [id]);
    loadNotes(db);
  };

  return (
    <View style={{ flex: 1, padding: 20, paddingTop: 50 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>📝 Заметки</Text>
      
      <TextInput
        placeholder="Заголовок"
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 }}
      />
      <TextInput
        placeholder="Текст заметки..."
        value={text}
        onChangeText={setText}
        multiline
        style={{ borderWidth: 1, padding: 10, marginBottom: 10, height: 80, borderRadius: 5, textAlignVertical: 'top' }}
      />
      <TouchableOpacity 
        onPress={addNote}
        style={{ backgroundColor: '#4a90e2', padding: 15, alignItems: 'center', marginBottom: 20, borderRadius: 5 }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>➕ Добавить заметку</Text>
      </TouchableOpacity>

      <FlatList
        data={notes}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ borderWidth: 1, padding: 15, marginBottom: 10, borderRadius: 5, backgroundColor: '#f9f9f9' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.title}</Text>
            <Text style={{ marginTop: 5 }}>{item.text}</Text>
            <TouchableOpacity onPress={() => deleteNote(item.id)} style={{ marginTop: 10 }}>
              <Text style={{ color: 'red' }}>🗑 Удалить</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}