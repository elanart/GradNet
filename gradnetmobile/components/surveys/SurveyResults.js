import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import APIs, { authAPI, endpoints } from "../../configs/APIs";

const SurveyResults = ({ route }) => {
    const { id } = route.params;
    const [results, setResults] = useState(null);

    useEffect(() => {
        authAPI.get(endpoints.survey_results(id))
            .then(response => setResults(response.data))
            .catch(error => console.error(error));
    }, [id]);

    if (!results) {
        return <Text>Loading...</Text>;
    }

    return (
        <View>
            <Text>Kết quả khảo sát</Text>
            {results.map((result, index) => (
                <View key={index}>
                    <Text>{result.question}</Text>
                    {result.choices.map((choice, cIndex) => (
                        <Text key={cIndex}>{choice.name}: {choice.count}</Text>
                    ))}
                </View>
            ))}
        </View>
    );
};

export default SurveyResults;
