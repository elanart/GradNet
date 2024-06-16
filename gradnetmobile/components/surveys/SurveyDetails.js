import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import APIs, { authAPI, endpoints } from "../../configs/APIs";

const SurveyDetails = ({ route, navigation }) => {
    const { id } = route.params;
    const [survey, setSurvey] = useState(null);

    useEffect(() => {
        authAPI.get(`${endpoints.surveys}${id}/`)
            .then(response => setSurvey(response.data))
            .catch(error => console.error(error));
    }, [id]);

    if (!survey) {
        return <Text>Loading...</Text>;
    }

    return (
        <View>
            <Text>{survey.title}</Text>
            <Text>{survey.content}</Text>
            {survey.questions.map((question, qIndex) => (
                <View key={qIndex}>
                    <Text>{question.name}</Text>
                    {question.choices.map((choice, cIndex) => (
                        <Text key={cIndex}>{choice.name}</Text>
                    ))}
                </View>
            ))}
            <Button title="Xem kết quả" onPress={() => navigation.navigate('SurveyResults', { id })} />
        </View>
    );
};

export default SurveyDetails;
