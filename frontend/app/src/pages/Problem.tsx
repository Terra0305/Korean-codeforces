import React from 'react';
import './Problem.css';
import { useNavigate, useParams } from 'react-router-dom';

const Problem = () => {
    const navigate = useNavigate();
    const { contestId } = useParams();

    const openContest = () => {
        navigate(`/contest/${contestId}`);
    }

    const handleDummyClick = (e: React.MouseEvent) => {
        e.preventDefault();
        // Canned response/action as requested
    };

    return (
        <div className="problem-page-body">
            <header className="problem-header">
                <a href="#" className="back-btn" onClick={openContest}>← 문제 목록으로 돌아가기</a>
                <div className="problem-timer">01:32:15</div>
                <div style={{fontWeight: 600}}>Codeforces Round #988 [KR]</div>
            </header>

            <div className="split-container">
                <div className="left-panel">
                    <h1>A. 최소 사각형 만들기</h1>
                    <div className="problem-meta">
                        시간 제한: 1.0초 &nbsp;|&nbsp; 메모리 제한: 256MB &nbsp;|&nbsp; 입력: 표준 입력 &nbsp;|&nbsp; 출력: 표준 출력
                    </div>

                    <h3>문제 설명</h3>
                    <p>
                        2차원 평면 위에 $N$개의 점이 주어집니다. 당신은 축에 평행한 직사각형 하나를 그려서 이 점들을 모두 포함하려고 합니다. 
                        이때, 만들어지는 직사각형의 넓이를 최소화하는 것이 목표입니다.
                    </p>
                    <p>
                        단, 당신은 주어진 점들 중 <strong>정확히 하나</strong>를 제거할 수 있습니다. 점 하나를 최적으로 제거했을 때, 남은 $N-1$개의 점을 모두 포함하는 최소 직사각형의 넓이를 구하세요.
                    </p>

                    <h3>입력</h3>
                    <p>
                        첫 번째 줄에 정수 $N$ ($3 \le N \le 100,000$)이 주어집니다.<br />
                        두 번째 줄부터 $N$개의 줄에 걸쳐 각 점의 좌표 $x_i, y_i$가 주어집니다. ($0 \le x_i, y_i \le 10^9$)
                    </p>

                    <h3>출력</h3>
                    <p>
                        점 하나를 제거한 후 만들 수 있는 가장 작은 직사각형의 넓이를 출력합니다.
                    </p>

                    <h3>예제 입력 1</h3>
                    <div className="sample-block">
                        <div className="sample-header">Input <span style={{cursor:'pointer', color:'#3182ce'}} onClick={handleDummyClick}>Copy</span></div>
                        <pre>{`4
1 1
10 10
1 10
10 1`}</pre>
                    </div>

                    <h3>예제 출력 1</h3>
                    <div className="sample-block">
                        <div className="sample-header">Output</div>
                        <pre>0</pre>
                    </div>
                    
                    <p style={{marginTop: '50px', color: '#718096', fontSize: '0.8rem'}}>
                        * 본 문제는 Codeforces의 문제를 학습 목적으로 번역한 것입니다. <br />
                        Original Problem: <a href="#" style={{color:'#3182ce'}} onClick={handleDummyClick}>Codeforces 1234A</a>
                    </p>
                </div>

                <div className="right-panel">
                    
                    <div className="cf-card">
                        <h2 style={{marginTop:0, fontSize:'1.2rem'}}>Codeforces Linkage</h2>
                        <p style={{fontSize:'0.9rem', color:'#718096', marginBottom: '20px'}}>
                            이곳에서 답안을 제출하면 Codeforces Virtual Contest에 자동으로 반영됩니다.
                        </p>
                        
                        <button className="btn-submit" onClick={handleDummyClick}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                            Codeforces에서 제출하기
                        </button>
                    </div>

                    <div className="cf-card" style={{flex: 1}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                            <h3 style={{margin:0, border:'none', fontSize:'1rem'}}>Real-time Status</h3>
                            <span style={{fontSize:'0.8rem', background:'#edf2f7', padding:'2px 6px', borderRadius:'4px'}}>Auto-refreshing</span>
                        </div>

                        <div className="status-box" id="status-container">
                            <div style={{color:'#718096', textAlign:'center', padding: '20px'}}>
                                아직 제출 이력이 없습니다.<br />
                                위 버튼을 눌러 제출을 진행해주세요.
                            </div>
                        </div>

                        <div style={{marginTop:'20px', fontSize:'0.75rem', color:'#a0aec0', fontFamily:'monospace'}}>
                            &gt; Connected to CF API (v.2.0)<br />
                            &gt; Fetching user status: OK<br />
                            &gt; Last Sync: <span id="sync-time">Just now</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Problem;
