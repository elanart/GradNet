import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, Button, RefreshControl, TouchableOpacity } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI } from '../../configs/APIs';

const BASE_URL = "https://elanart.pythonanywhere.com";

const SurveyList = ({ navigation }) => {
    const [surveys, setSurveys] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchSurveys = async () => {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.error("Người dùng chưa đăng nhập");
          return;
        }

        try {
            const response = await authAPI(token).get(`${BASE_URL}/surveys/`);
            setSurveys(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchSurveys();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchSurveys();
        setRefreshing(false);
    };

    return (
        <View style={styles.container}>
            <Button title="Create Survey" onPress={() => navigation.navigate('CreateSurvey')} />
            <FlatList
                data={surveys}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.surveyItem}
                        onPress={() => navigation.navigate('SurveyDetails', { surveyId: item.id })}
                    >
                        <Text style={styles.title}>{item.title}</Text>
                        <Text>{item.content}</Text>
                    </TouchableOpacity>
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    surveyItem: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
});

export default SurveyList;
