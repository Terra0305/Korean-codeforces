import { useState } from 'react';
import { Contest } from '../../api/contestApi';
import client from '../../api/client';
import './JoinContest.css';
import '../Navbar.css';

interface JoinContestModalProps {
    isOpen: boolean;
    onClose: () => void;
    contest: Contest;
}

const JoinContestModal = ({ isOpen, onClose, contest }: JoinContestModalProps) => {
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirmRegistration = async () => {
        setIsLoading(true);
        try {
            await client.post(`/api/contests/contests/${contest.id}/register/`);
            alert("대회 참가 신청이 완료되었습니다.");
            onClose();
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.error || "참가 신청에 실패했습니다.";
            alert(msg);
            // Don't close modal on error so user can try again or see the error
            // Previously we closed it, but keeping it open might be better user experience if it's a transient error.
            // However, duplicating the logic from Main.tsx which closed it. Let's close it as requested originally.
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">처리 중입니다...</div>
                </div>
            )}
            <div className="modal-content" style={{maxWidth: '400px', textAlign: 'center'}}>
                <h2 style={{ marginBottom: '15px' }}>대회 참가 신청</h2>
                <p style={{ marginBottom: '25px', color: '#4a5568' }}>
                    <strong>{contest.name}</strong><br/>
                    참가 신청하시겠습니까?
                </p>
                <div style={{display: 'flex', justifyContent: 'center', gap: '15px'}}>
                    <button 
                        className="btn" 
                        style={{backgroundColor: '#3182ce', color: 'white'}}
                        onClick={handleConfirmRegistration}
                        disabled={isLoading}
                    >
                        확인
                    </button>
                    <button 
                        className="btn" 
                        style={{backgroundColor: '#e2e8f0', color: '#4a5568'}}
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JoinContestModal;
