
import { useState, useEffect } from 'react';
import client from '../../api/client';
import '../Modal.css';

interface Contest {
    id: number;
    name: string;
}

interface ContestSelectionModalProps {
    onClose: () => void;
    onSelect: (contestId: number, contestName: string) => void;
}

const ContestSelectionModal = ({ onClose, onSelect }: ContestSelectionModalProps) => {
    const [contests, setContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContests = async () => {
            try {
                // 관리자는 모든 대회를 볼 수 있어야 하므로 admin 엔드포인트나 일반 엔드포인트 사용
                // 여기서는 일반 조회 API를 사용해도 무방 (대회 목록 조회)
                const response = await client.get('/api/contests/contests/');
                setContests(response.data.results);
                console.log(response.data);
            } catch (error) {
                console.error("Failed to fetch contests:", error);
                alert("대회 목록을 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchContests();
    }, []);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">대회 선택</div>
                    <button className="modal-close-btn" onClick={onClose}>&times;</button>
                </div>
                
                {loading ? (
                    <div style={{textAlign: 'center', padding: '20px'}}>Loading...</div>
                ) : (
                    <div className="contest-list">
                        {contests.length === 0 ? (
                            <div style={{textAlign: 'center', padding: '20px', color: '#718096'}}>
                                생성된 대회가 없습니다.
                            </div>
                        ) : (
                            contests.map(contest => (
                                <div 
                                    key={contest.id} 
                                    className="contest-list-item"
                                    onClick={() => onSelect(contest.id, contest.name)}
                                >
                                    <div className="contest-id">ID: {contest.id}</div>
                                    <div className="contest-name">{contest.name}</div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContestSelectionModal;
