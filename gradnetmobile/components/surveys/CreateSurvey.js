// components/surveys/CreateSurvey.js

import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../configs/APIs';

const BASE_URL = "https://elanart.pythonanywhere.com";

const CreateSurvey = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [questions, setQuestions] = useState([{ id: Date.now(), question: '' }]);
    const [message, setMessage] = useState('');

    const handleCreateSurvey = async () => {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.error("Người dùng chưa đăng nhập");
          return;
        }

        try {
            const response = await authAPI(token).post(`${BASE_URL}/surveys/`, 
                { title, content }, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const surveyId = response.data.id;

            // Thêm câu hỏi vào khảo sát
            for (const question of questions) {
                if (question.question) {
                    await authAPI(token).post(`${BASE_URL}/surveys/${surveyId}/add-question/`, 
                        { name: question.question }, 
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                }
            }

            setMessage('Survey created successfully!');
            navigation.goBack(); // Quay lại danh sách khảo sát sau khi tạo
        } catch (error) {
            console.error(error);
            setMessage('Failed to create survey.');
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, { id: Date.now(), question: '' }]);
    };

    const updateQuestion = (id, text) => {
        setQuestions(
            questions.map(q => q.id === id ? { ...q, question: text } : q)
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Title</Text>
            <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
            />
            <Text style={styles.label}>Content</Text>
            <TextInput
                style={styles.input}
                value={content}
                onChangeText={setContent}
            />

            <Text style={styles.label}>Questions</Text>
            <FlatList
                data={questions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TextInput
                        style={styles.input}
                        value={item.question}
                        onChangeText={(text) => updateQuestion(item.id, text)}
                        placeholder="Question text"
                    />
                )}
                ListFooterComponent={() => (
                    <TouchableOpacity onPress={addQuestion} style={styles.addButton}>
                        <Text style={styles.addButtonText}>+ Add Question</Text>
                    </TouchableOpacity>
                )}
            />

            <Button
                title="Create Survey"
                onPress={handleCreateSurvey}
            />
            {message ? <Text>{message}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 16,
        paddingLeft: 8,
    },
    addButton: {
        marginTop: 16,
        padding: 10,
        backgroundColor: '#007bff',
        borderRadius: 5,
        alignItems: 'center',
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default CreateSurvey;
