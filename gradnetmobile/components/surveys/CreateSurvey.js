import React, { useState } from 'react';
import axios from 'axios';

const CreateSurvey = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [questions, setQuestions] = useState([]);

    const handleAddQuestion = () => {
        setQuestions([...questions, { name: '', choices: [] }]);
    };

    const handleQuestionChange = (index, event) => {
        const newQuestions = [...questions];
        newQuestions[index].name = event.target.value;
        setQuestions(newQuestions);
    };

    const handleAddChoice = (questionIndex) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].choices.push('');
        setQuestions(newQuestions);
    };

    const handleChoiceChange = (questionIndex, choiceIndex, event) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].choices[choiceIndex] = event.target.value;
        setQuestions(newQuestions);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const surveyResponse = await axios.post('/api/surveys/', { title, content });
            const surveyId = surveyResponse.data.id;

            for (const question of questions) {
                const questionResponse = await axios.post(`/api/surveys/${surveyId}/add_question/`, { name: question.name });
                const questionId = questionResponse.data.id;

                for (const choice of question.choices) {
                    await axios.post(`/api/surveys/${surveyId}/add_choice/`, { question_id: questionId, name: choice });
                }
            }
            window.location.href = '/surveys';
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h1>Tạo khảo sát mới</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Tiêu đề</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                    <label>Nội dung</label>
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} />
                </div>
                <div>
                    <button type="button" onClick={handleAddQuestion}>Thêm câu hỏi</button>
                </div>
                {questions.map((question, qIndex) => (
                    <div key={qIndex}>
                        <input
                            type="text"
                            placeholder="Câu hỏi"
                            value={question.name}
                            onChange={(e) => handleQuestionChange(qIndex, e)}
                        />
                        <button type="button" onClick={() => handleAddChoice(qIndex)}>Thêm lựa chọn</button>
                        {question.choices.map((choice, cIndex) => (
                            <input
                                key={cIndex}
                                type="text"
                                placeholder="Lựa chọn"
                                value={choice}
                                onChange={(e) => handleChoiceChange(qIndex, cIndex, e)}
                            />
                        ))}
                    </div>
                ))}
                <button type="submit">Lưu khảo sát</button>
            </form>
        </div>
    );
};

export default CreateSurvey;
