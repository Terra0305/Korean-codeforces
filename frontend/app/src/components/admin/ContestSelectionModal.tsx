
import { useState, useEffect } from 'react';
import { contestApi, Contest } from '../../api/contestApi';
import '../Modal.css';

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
                const results = await contestApi.getAllContests();
                setContests(results);
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
