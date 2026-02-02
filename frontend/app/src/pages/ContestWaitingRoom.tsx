import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { contestApi, Contest } from '../api/contestApi';
import './ContestWaitingRoom.css';

const ContestWaitingRoom = () => {
    const { virtual_id } = useParams();
    const navigate = useNavigate();
    const [contest, setContest] = useState<Contest | null>(null);
    const [timerText, setTimerText] = useState("Loading...");
    const [participantCount, setParticipantCount] = useState<number>(0);
    const [isStarted, setIsStarted] = useState(false);

    useEffect(() => {
        if (virtual_id) {
            const fetchContest = async () => {
                try {
                    const data = await contestApi.getContestDetail(virtual_id);
                    setContest(data);
                } catch (error) {
                    console.error("Failed to fetch contest:", error);
                }
            };
            
            const fetchParticipants = async () => {
                try {
                   // Using getParticipants API. Note: ideally should have a count-only API for performance
                   const participants = await contestApi.getParticipants(virtual_id);
                   setParticipantCount(participants.length); 
                } catch (error) {
                    console.error("Failed to fetch participants:", error);
                }
            };

            fetchContest();
            fetchParticipants();
            
            return;
        }
    }, [virtual_id]);

    useEffect(() => {
        if (!contest) return;

        const updateTimer = () => {
            const now = new Date();
            const start = new Date(contest.start_time);
            
            if (now >= start) {
                setTimerText("대회가 시작되었습니다!");
                setIsStarted(true);
            } else {
                const diff = Math.floor((start.getTime() - now.getTime()) / 1000);
                const h = Math.floor(diff / 3600);
                const m = Math.floor((diff % 3600) / 60);
                const s = diff % 60;
                setTimerText(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
                setIsStarted(false);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);

    }, [contest]);

    const handleEnterContest = () => {
        navigate(`/contest/${virtual_id}`);
    };

    return (
        <div className="waiting-page">
            <Navbar />
            <div className="waiting-container">
                {contest ? (
                    <>
                        <h1 className="contest-title-large">{contest.name}</h1>
                        <div className="waiting-card">
                            <h2 className="status-label">대회 시작까지</h2>
                            <div className="countdown-large">{timerText}</div>
                            
                            <div className="participant-info">
                                <span>현재 참가 신청 인원: </span>
                                <strong className="highlight-count">{participantCount}</strong>
                                <span> 명</span>
                            </div>

                            <div className="action-area">
                                <button 
                                    className={`btn-enter ${isStarted ? 'active' : 'disabled'}`}
                                    onClick={handleEnterContest}
                                    disabled={!isStarted}
                                >
                                    {isStarted ? "대회 입장하기" : "대기 중..."}
                                </button>
                            </div>
                        </div>
                        <div className="rule-info">
                            <h3>⚠️ 주의사항</h3>
                            <ul>
                                <li>대회 시작 전에 안정적인 인터넷 환경을 확인해주세요.</li>
                                <li>부정행위 적발 시, 영구적으로 이용이 제한될 수 있습니다.</li>
                                <li>문제 유출 금지 및 매너를 지켜주세요.</li>
                            </ul>
                        </div>
                    </>
                ) : (
                    <div>Loading contest info...</div>
                )}
            </div>
        </div>
    );
};

export default ContestWaitingRoom;
