import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';
import { authAPI } from '../../configs/APIs';

const BASE_URL = "https://elanart.pythonanywhere.com";

const SurveyDetails = ({ route }) => {
    const { surveyId } = route.params;
    const [questions, setQuestions] = useState([]);
    const [currentAnswer, setCurrentAnswer] = useState({});
    const navigation = useNavigation();

    const fetchQuestions = async () => {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
            console.error("Người dùng chưa đăng nhập");
            return;
        }

        try {
            const response = await authAPI(token).get(`${BASE_URL}/surveys/${surveyId}/get-questions/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const questionsWithChoices = await Promise.all(response.data.map(async question => {
                const choicesResponse = await authAPI(token).get(`${BASE_URL}/questions/${question.id}/get-choices/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                return { ...question, choices: choicesResponse.data };
            }));
            setQuestions(questionsWithChoices);
        } catch (error) {
            console.error(error);
        }
    };

    const handleInputChange = (questionId, value) => {
        setCurrentAnswer({ ...currentAnswer, [questionId]: value });
    };

    const submitAllAnswers = async () => {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
            console.error("Người dùng chưa đăng nhập");
            return;
        }

        try {
            await Promise.all(
                Object.keys(currentAnswer).map(questionId =>
                    authAPI(token).post(`${BASE_URL}/questions/${questionId}/create-choices/`, {
                        name: currentAnswer[questionId]
                    }, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })
                )
            );
            Alert.alert('Thành công', 'Các câu trả lời đã được gửi');
            setTimeout(() => {
                navigation.navigate('SurveyList');
            }, 3000);
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi gửi câu trả lời');
        }
    };


    useEffect(() => {
        fetchQuestions();
    }, []);

   

    return (
        <View style={styles.container}>
            <FlatList
                data={questions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.questionItem}>
                        <Text style={styles.questionText}>{item.name}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập câu trả lời của bạn"
                            value={currentAnswer[item.id] || ''}
                            onChangeText={(text) => handleInputChange(item.id, text)}
                        />
                    </View>
                )}
            />
            <Button title="Submit Answer" onPress={submitAllAnswers} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    questionItem: {
        padding: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        marginBottom: 8,
    },
    questionText: {
        fontSize: 16,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        paddingHorizontal: 8,
        marginBottom: 8,
        borderRadius: 4,
    },
});

export default SurveyDetails;
