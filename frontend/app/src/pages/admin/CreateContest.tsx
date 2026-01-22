import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import client from '../../api/client';
import Navbar from '../../components/Navbar';
import './Admin.css';

const CreateContest = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        start_time: null as Date | null,
        end_time: null as Date | null
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDateChange = (name: string, date: Date | null) => {
        setFormData(prev => ({
            ...prev,
            [name]: date
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const submitData = {
                ...formData,
                start_time: formData.start_time ? formData.start_time.toISOString() : null,
                end_time: formData.end_time ? formData.end_time.toISOString() : null
            };

            const response = await client.post('/api/contests/admin/contests/', submitData);
            if (response.status === 201) {
                alert('대회가 성공적으로 생성되었습니다.');
                // Optionally navigate somewhere or clear form
                navigate('/');
            }
        } catch (error: any) {
            console.error('Failed to create contest:', error);
            const errorMessage = error.response?.data ? 
                JSON.stringify(error.response.data) : '대회 생성에 실패했습니다.';
            alert(errorMessage);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="admin-page-container">
                <div className="admin-card">
                    <h1 className="admin-header">대회 생성 (Admin)</h1>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Codeforces Contest ID</label>
                            <input 
                                name="id"
                                type="number"
                                value={formData.id}
                                onChange={handleChange}
                                className="admin-form-input"
                                placeholder="ex) 1234"
                                required
                            />
                            <p style={{fontSize: '0.8rem', color: '#718096', marginTop: '5px'}}>
                                * Codeforces Contest ID를 입력하면 자동으로 문제 정보를 동기화합니다.
                            </p>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">대회명</label>
                            <input 
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                className="admin-form-input"
                                placeholder="대회명을 입력하세요"
                                required
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">시작 시간</label>
                            <DatePicker 
                                selected={formData.start_time}
                                onChange={(date: Date | null) => handleDateChange('start_time', date)}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="yyyy/MM/dd HH:mm"
                                className="admin-form-input"
                                placeholderText="시작 시간을 선택하세요"
                                required
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">종료 시간</label>
                            <DatePicker 
                                selected={formData.end_time}
                                onChange={(date: Date | null) => handleDateChange('end_time', date)}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="yyyy/MM/dd HH:mm"
                                className="admin-form-input"
                                placeholderText="종료 시간을 선택하세요"
                                required
                            />
                        </div>

                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                            <button type="button" className="admin-btn" style={{backgroundColor: '#718096'}} onClick={() => navigate(-1)}>
                                취소
                            </button>
                            <button type="submit" className="admin-btn">
                                대회 생성
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateContest;
