import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SurveyList = () => {
    const [surveys, setSurveys] = useState([]);

    useEffect(() => {
        axios.get('/api/surveys/')
            .then(response => setSurveys(response.data))
            .catch(error => console.error(error));
    }, []);

    return (
        <div>
            <h1>Danh sách khảo sát</h1>
            <ul>
                {surveys.map(survey => (
                    <li key={survey.id}>{survey.title}</li>
                ))}
            </ul>
            <button onClick={() => window.location.href = '/create-survey'}>Tạo khảo sát mới</button>
        </div>
    );
};

export default SurveyList;
